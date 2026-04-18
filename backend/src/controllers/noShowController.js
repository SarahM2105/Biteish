const { prisma } = require("../prismaClient");
const { getIO } = require("../socket");
const { getRestaurantOccupancy } = require("../utils/occupancy");

async function markNoShow(req, res) {
    try {
        const ownerId = req.user.userId;
        const { reservationId } = req.body;

        if (!reservationId) {
            return res.status(400).json({
                error: "reservationId is required",
            });
        }

        const restaurant = await prisma.restaurant.findFirst({
            where: { ownerId },
            include: {
                bookingRule: true,
            },
        });

        if (!restaurant) {
            return res.status(404).json({
                error: "Restaurant not found",
            });
        }

        const reservation = await prisma.reservation.findFirst({
            where: {
                id: reservationId,
                restaurantId: restaurant.id,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                table: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!reservation) {
            return res.status(404).json({
                error: "Reservation not found",
            });
        }

        if (reservation.status !== "CONFIRMED") {
            return res.status(400).json({
                error: "Only confirmed reservations can be marked as no-show",
            });
        }

        if (reservation.checkedInAt) {
            return res.status(400).json({
                error: "Checked-in reservations cannot be marked as no-show",
            });
        }

        const now = new Date();
        const graceMinutes = restaurant.bookingRule?.graceMinutes ?? 15;
        const graceThreshold = new Date(
            new Date(reservation.startsAt).getTime() + graceMinutes * 60 * 1000
        );

        if (now < graceThreshold) {
            return res.status(400).json({
                error: `This reservation cannot be marked as no-show until ${graceMinutes} minutes after its start time`,
            });
        }

        const updatedReservation = await prisma.reservation.update({
            where: {
                id: reservation.id,
            },
            data: {
                status: "NO_SHOW",
                endsAt: now,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                table: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        try {
            const io = getIO();
            const occupancy = await getRestaurantOccupancy(restaurant.id);

            io.to(`user:${ownerId}`).emit("occupancy:updated", {
                restaurantId: restaurant.id,
                ...occupancy,
            });
        } catch (error) {
            console.error("Failed to emit occupancy update:", error);
        }

        return res.json({
            message: "Reservation marked as no-show",
            reservation: {
                id: updatedReservation.id,
                status: updatedReservation.status,
                startsAt: updatedReservation.startsAt,
                endsAt: updatedReservation.endsAt,
                partySize: updatedReservation.partySize,
            },
            customer: {
                name: updatedReservation.user?.name || "Customer",
            },
            table: {
                id: updatedReservation.table?.id,
                name: updatedReservation.table?.name || "Table",
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Server error",
        });
    }
}

module.exports = {
    markNoShow,
};