const { prisma } = require("../../../prismaClient");
const { buildBookingEmailData } = require("../../../utils/emailDataBuilder");
const { buildEmailLayout, sendEmail } = require("../../../utils/emailService");
const { getIO } = require("../../../socket");
const { bookingsOverlap } = require("../../../utils/bookingsOverlap");

async function createBooking(req, res) {
    try {
        const { startsAt, endsAt, partySize, notes } = req.body;
        const { tableId } = req.params;

        if (!startsAt || !endsAt || !partySize) {
            return res
                .status(400)
                .json({ error: "startsAt, endsAt, partysize and reason required" });
        }

        const table = await prisma.table.findUnique({
            where: { id: tableId },
            include: {
                restaurant: {
                    include: {
                        bookingRule: true,
                        openingHours: true,
                    },
                },
            },
        });

        if (!table) {
            return res.status(404).json({ error: "tableId not found" });
        }

        const bookingStart = new Date(startsAt);
        const bookingEnd = new Date(endsAt);

        if (Number.isNaN(bookingStart.getTime()) || Number.isNaN(bookingEnd.getTime())) {
            return res.status(400).json({ error: "Invalid booking date or time" });
        }

        if (bookingStart >= bookingEnd) {
            return res.status(400).json({ error: "End time must be after start time" });
        }

        const bookingDurationMinutes =
            (bookingEnd.getTime() - bookingStart.getTime()) / 60000;

        const SLOT_MINUTES = table.restaurant.bookingRule?.slotMinutes ?? 120;
        const TURNOVER_MINUTES =
            table.restaurant.bookingRule?.turnoverMinutes ?? 15;

        if (bookingDurationMinutes > SLOT_MINUTES) {
            return res.status(400).json({
                error: `Booking cannot be longer than ${SLOT_MINUTES} minutes`,
            });
        }

        const hours = table.restaurant.openingHours || [];
        const bookingDay = bookingStart
            .toLocaleDateString("en-GB", { weekday: "long" })
            .toUpperCase();

        if (hours.length > 0) {
            const openingHour = hours.find((h) => h.day === bookingDay);

            if (!openingHour) {
                return res
                    .status(400)
                    .json({ error: `Restaurant is closed on ${bookingDay}` });
            }

            const [openHour, openMinute] = openingHour.opensAt.split(":").map(Number);
            const [closeHour, closeMinute] = openingHour.closesAt.split(":").map(Number);

            const opensAt = new Date(bookingStart);
            opensAt.setHours(openHour, openMinute, 0, 0);

            const closesAt = new Date(bookingStart);
            closesAt.setHours(closeHour, closeMinute, 0, 0);

            if (closesAt <= opensAt) {
                closesAt.setDate(closesAt.getDate() + 1);
            }

            if (bookingStart < opensAt || bookingEnd > closesAt) {
                return res
                    .status(400)
                    .json({ error: "Booking is outside of opening hours" });
            }
        }

        if (table.restaurant.ownerId === req.user.userId) {
            return res.status(403).json({ error: "you cannot book your own table" });
        }

        const existingReservation = await prisma.reservation.findMany({
            where: {
                tableId,
                status: { in: ["PENDING", "CONFIRMED"] },
                endsAt: {
                    gt: new Date(
                        bookingStart.getTime() - TURNOVER_MINUTES * 60000
                    ),
                },
            },
        });

        const conflict = existingReservation.some((reservation) =>
            bookingsOverlap(
                bookingStart,
                bookingEnd,
                new Date(
                    new Date(reservation.startsAt).getTime() -
                    TURNOVER_MINUTES * 60000
                ),
                new Date(
                    new Date(reservation.endsAt).getTime() +
                    TURNOVER_MINUTES * 60000
                )
            )
        );

        if (conflict) {
            return res.status(409).json({ error: "timeslot already taken" });
        }

        const reservation = await prisma.reservation.create({
            data: {
                userId: req.user.userId,
                tableId,
                restaurantId: table.restaurantId,
                startsAt: bookingStart,
                endsAt: bookingEnd,
                partySize,
                status: "PENDING",
                notes,
            },
        });

        try {
            const emailData = await buildBookingEmailData({
                reservation,
                table,
                bookingStart,
            });

            const subject = "New Booking Request";

            const html = buildEmailLayout({
                title: "New Booking Request",
                greeting: `Hello ${emailData.owner.name || "Owner"},`,
                intro: `You have received a new booking request for ${emailData.restaurantName}.`,
                content: `
                <p><strong> Customer: </strong> ${emailData.customer.name}</p>
                <p><strong>Date:</strong> ${emailData.date}</p>
                <p><strong>Time: </strong> ${emailData.time}</p>
                <p><strong>Party Size:</strong> ${emailData.partySize}</p>
                <p><strong>Notes:</strong> ${emailData.notes || "none"}</p>`,
                actionText: "View Requests",
                actionUrl: `${process.env.FRONTEND_URL}/owner/request`,
            });

            if (emailData.owner?.email) {
                await sendEmail({
                    to: emailData.owner.email,
                    subject,
                    text: `you have a new booking request from ${emailData.customer.name}`,
                    html,
                });
            }
        } catch (error) {
            console.error("Failed to send owner email:", error);
        }

        try {
            const io = getIO();
            io.to(`user:${table.restaurant.ownerId}`).emit("reservation:created", {
                reservationId: reservation.id,
                restaurantId: reservation.restaurantId,
                tableId: reservation.tableId,
                status: reservation.status,
            });
        } catch {}

        return res.status(201).json(reservation);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function listUserReservations(req, res) {
    try {
        const reservations = await prisma.reservation.findMany({
            where: { userId: req.user.userId },
            include: {
                restaurant: true,
                table: true,
                ReservationChangeRequest: {
                    orderBy: { createdAt: "desc" },
                },
            },
            orderBy: { startsAt: "asc" },
        });

        return res.status(200).json(reservations);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function cancelReservation(req, res) {
    try {
        const { reservationId } = req.params;
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                restaurant: true,
                table: {
                    include: { restaurant: true },
                },
            },
        });

        if (!reservation) {
            return res.status(404).json({ error: "No reservation with this id" });
        }

        if (reservation.userId !== req.user.userId) {
            return res
                .status(403)
                .json({ error: "you can only cancel your own reservations" });
        }

        if (["CANCELLED", "COMPLETED", "NO_SHOW"].includes(reservation.status)) {
            return res.status(400).json({
                error: `reservation already ${reservation.status.toLowerCase()}`,
            });
        }

        await prisma.reservation.update({
            where: { id: reservationId },
            data: { status: "CANCELLED" },
        });

        try {
            const owner = await prisma.user.findUnique({
                where: { id: reservation.table.restaurant.ownerId },
                select: { email: true, name: true },
            });

            const html = buildEmailLayout({
                title: "Booking Cancelled",
                greeting: `Hello ${owner?.name || "Owner"},`,
                intro: `You have a cancellation for  ${reservation.restaurant?.name || "your restaurant"}.`,
                content: `<p><strong>Date:</strong> ${new Date(
                    reservation.startsAt
                ).toLocaleDateString("en-GB")}</p>
                <p><strong>Time:</strong> ${new Date(
                    reservation.startsAt
                ).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}</p>
                <p><strong>Party Size:</strong> ${reservation.partySize}</p>
                <p><strong>Status:</strong> Cancelled</p>`,
                actionText: "view requests",
                actionUrl: `${process.env.FRONTEND_URL}/owner/request`,
            });

            if (owner?.email) {
                await sendEmail({
                    to: owner.email,
                    subject: "a booking has been cancelled",
                    text: `Your booking for ${reservation.restaurant?.name || "the restaurant"} has been cancelled.`,
                    html,
                });
            }
        } catch (error) {
            console.error("failed to send cancellation email ", error);
        }

        return res.status(200).json({ message: "Cancelled" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = { createBooking, listUserReservations, cancelReservation };