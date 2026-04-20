const { prisma } = require("../../prismaClient");
const crypto = require("crypto");
const { buildEmailLayout, sendEmail } = require("../../utils/emailService");
const { getIO } = require("../../socket");

async function approveReservation(req, res) {
    try {
        const { reservationId } = req.params;
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                user: true,
                restaurant: true,
                table: {
                    include: { restaurant: true },
                },
            },
        });

        if (!reservation || reservation.table.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "Not authorised" });
        }

        if (reservation.status !== "PENDING") {
            return res.status(400).json({ error: "only pending reservations" });
        }

        await prisma.reservation.update({
            where: { id: reservationId },
            data: { status: "CONFIRMED" },
        });

        const qrToken = crypto.randomUUID();
        const expiresAt = new Date(
            new Date(reservation.startsAt).getTime() + 30 * 60 * 1000
        );

        await prisma.qrToken.upsert({
            where: { reservationId: reservationId },
            update: {
                token: qrToken,
                expiresAt,
                used: false,
            },
            create: {
                reservationId: reservationId,
                token: qrToken,
                expiresAt,
                used: false,
            },
        });

        try {
            const html = buildEmailLayout({
                title: "Booking Confirmed",
                greeting: `Hello ${reservation.user?.name || "customer"},`,
                intro: `Your booking request for ${reservation.restaurant?.name || "the restaurant"} has been confirmed.`,
                content: `<p><strong>Date:</strong> ${new Date(reservation.startsAt).toLocaleDateString("en-GB")}</p>
                <p><strong>Time:</strong> ${new Date(reservation.startsAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}</p>
                <p><strong>Party Size:</strong> ${reservation.partySize}</p>
                <p><strong>Status:</strong> Confirmed</p>`,
                actionText: "view my bookings",
                actionUrl: `${process.env.FRONTEND_URL}/customer/bookings`,
            });

            if (reservation.user?.email) {
                await sendEmail({
                    to: reservation.user.email,
                    subject: "your booking has now been confirmed",
                    text: `Your booking for ${reservation.restaurant?.name || "the restaurant"} has been confirmed.`,
                    html,
                });
            }
        } catch (error) {
            console.error("failed to send new booking approval email: ", error);
        }

        try {
            const io = getIO();
            io.to(`user:${reservation.table.restaurant.ownerId}`).emit("reservation:updated", {
                reservationId,
                status: "CONFIRMED",
            });
            io.to(`user:${reservation.userId}`).emit("reservation:updated", {
                reservationId,
                status: "CONFIRMED",
            });
        } catch {}

        return res.status(200).json({ message: "Approved reservation" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function declineReservation(req, res) {
    try {
        const { reservationId } = req.params;
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                user: true,
                restaurant: true,
                table: {
                    include: { restaurant: true },
                },
            },
        });

        if (!reservation || reservation.table.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "Not Authorised" });
        }

        if (reservation.status !== "PENDING") {
            return res.status(400).json({
                error: "Only pending reservations can be declined",
            });
        }

        await prisma.reservation.update({
            where: { id: reservationId },
            data: { status: "DECLINED" },
        });

        try {
            const html = buildEmailLayout({
                title: "Booking Confirmed",
                greeting: `Hello ${reservation.user?.name || "customer"},`,
                intro: `Unfortunately your booking request for ${reservation.restaurant?.name || "the restaurant"} has been declined.`,
                content: `<p><strong>Date:</strong> ${new Date(reservation.startsAt).toLocaleDateString("en-GB")}</p>
                <p><strong>Time:</strong> ${new Date(reservation.startsAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                })}</p>
                <p><strong>Party Size:</strong> ${reservation.partySize}</p>
                <p><strong>Status:</strong> Declined</p>`,
                actionText: "Browse Restaurants",
                actionUrl: `${process.env.FRONTEND_URL}/restaurants`,
            });

            if (reservation.user?.email) {
                await sendEmail({
                    to: reservation.user.email,
                    subject: "your booking request was declined",
                    text: `Your booking for ${reservation.restaurant?.name || "the restaurant"} has been declined.`,
                    html,
                });
            }
        } catch (error) {
            console.error("failed to send new booking decline email: ", error);
        }

        try {
            const io = getIO();
            io.to(`user:${reservation.userId}`).emit("reservation:updated", {
                reservationId,
                status: "DECLINED",
            });
        } catch {}

        return res.status(200).json({ message: "Declined reservation" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function listPendingReservations(req, res) {
    try {
        const ownerId = req.user.userId;

        const reservations = await prisma.reservation.findMany({
            where: {
                status: "PENDING",
                table: {
                    restaurant: {
                        ownerId: ownerId,
                    },
                },
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                table: {
                    select: {
                        id: true,
                        name: true,
                        capacity: true,
                    },
                },
                restaurant: { select: { id: true, name: true } },
            },
            orderBy: { startsAt: "asc" },
            take: 200,
        });

        return res.status(200).json(reservations);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function listOwnerReservations(req, res) {
    try {
        const ownerId = req.user.userId;
        const { status } = req.query;

        const where = {
            table: {
                restaurant: {
                    ownerId,
                },
            },
        };

        if (status) {
            where.status = status;
        }

        const reservations = await prisma.reservation.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
                restaurant: { select: { id: true, name: true } },
                table: {
                    select: {
                        id: true,
                        name: true,
                        capacity: true,
                        zone: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                qrToken: true,
            },
            orderBy: { startsAt: "asc" },
            take: 500,
        });

        return res.status(200).json(reservations);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    approveReservation,
    declineReservation,
    listPendingReservations,
    listOwnerReservations,
};