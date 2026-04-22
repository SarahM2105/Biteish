const { prisma } = require("../../../prismaClient");
const {
    validateCreateBookingInput,
    createBookingReservation,
} = require("./createBookingsService");
const {
    notifyOwnerAboutNewBooking,
    emitOwnerBookingCreated,
    notifyOwnerAboutCancelledBooking,
} = require("./bookingNotifications");

async function createBooking(req, res) {
    try {
        const { startsAt, partySize, notes } = req.body;
        const { tableId } = req.params;

        const input = validateCreateBookingInput({ startsAt, partySize });

        if (input.error) {
            return res.status(input.error.status).json({
                error: input.error.message,
            });
        }

        const transactionResult = await createBookingReservation({
            tableId,
            userId: req.user.userId,
            bookingStart: input.bookingStart,
            numericPartySize: input.numericPartySize,
            notes,
        });

        if (transactionResult?.error) {
            return res.status(transactionResult.error.status).json({
                error: transactionResult.error.message,
            });
        }

        const { reservation, table } = transactionResult;

        await notifyOwnerAboutNewBooking({
            reservation,
            table,
            bookingStart: input.bookingStart,
        });

        emitOwnerBookingCreated({ reservation, table });

        return res.status(201).json(reservation);
    } catch (error) {
        if (error.code === "P2034") {
            return res.status(409).json({
                error: "This timeslot has just been taken. Please choose another table or time.",
            });
        }

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

        await notifyOwnerAboutCancelledBooking(reservation);

        return res.status(200).json({ message: "Cancelled" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = { createBooking, listUserReservations, cancelReservation };