const { prisma } = require("../../../prismaClient");
const { getIO } = require("../../../socket");
const { getRestaurantOccupancy } = require("../../../utils/occupancy");

const CHECK_IN_WINDOW_MINUTES = 30;

async function checkinCustomer(req, res) {
    try {
        const { qrToken } = req.body;

        if (!qrToken) {
            return res.status(400).json({
                error: "QR token not provided",
            });
        }

        const tokenRow = await prisma.qrToken.findUnique({
            where: {
                token: qrToken,
            },
            include: {
                reservation: {
                    include: {
                        user: true,
                        table: {
                            include: {
                                restaurant: true,
                            },
                        },
                    },
                },
            },
        });

        if (!tokenRow || !tokenRow.reservation) {
            return res.status(400).json({
                error: "Invalid QR token",
            });
        }

        const reservation = tokenRow.reservation;
        const restaurant = reservation.table?.restaurant;

        if (!restaurant) {
            return res.status(400).json({
                error: "Restaurant not found for reservation",
            });
        }

        if (restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({
                error: "QR code not for your restaurant",
            });
        }

        if (reservation.status !== "CONFIRMED") {
            return res.status(400).json({
                error: `Only confirmed reservations can be checked in. Current status: ${reservation.status}`,
            });
        }

        if (tokenRow.used) {
            return res.status(400).json({
                error: "QR token already used",
            });
        }

        if (reservation.checkedInAt) {
            return res.status(400).json({
                error: "Reservation already checked in",
            });
        }

        const now = new Date();
        const startsAt = new Date(reservation.startsAt);
        const checkInWindowStartsAt = new Date(
            startsAt.getTime() - CHECK_IN_WINDOW_MINUTES * 60 * 1000
        );
        const checkInWindowEndsAt = new Date(
            startsAt.getTime() + CHECK_IN_WINDOW_MINUTES * 60 * 1000
        );

        if (now < checkInWindowStartsAt || now > checkInWindowEndsAt) {
            return res.status(400).json({
                error: "QR check-in is only available 30 minutes before and after the booking time.",
            });
        }

        if (new Date(tokenRow.expiresAt) < now) {
            return res.status(400).json({
                error: "QR token expired",
            });
        }

        const updatedReservation = await prisma.reservation.update({
            where: { id: reservation.id },
            data: {
                checkedInAt: now,
            },
            include: {
                user: true,
                table: {
                    include: {
                        restaurant: true,
                    },
                },
            },
        });

        await prisma.qrToken.update({
            where: {
                id: tokenRow.id,
            },
            data: {
                used: true,
            },
        });

        try {
            const io = getIO();
            const occupancy = await getRestaurantOccupancy(restaurant.id);

            io.to(`user:${restaurant.ownerId}`).emit("occupancy:updated", {
                restaurantId: restaurant.id,
                ...occupancy,
            });
        } catch (error) {
            console.error("Failed to emit occupancy update:", error);
        }

        return res.json({
            message: "Customer checked in successfully",
            reservation: {
                id: updatedReservation.id,
                startsAt: updatedReservation.startsAt,
                endsAt: updatedReservation.endsAt,
                partySize: updatedReservation.partySize,
                notes: updatedReservation.notes,
                checkedInAt: updatedReservation.checkedInAt,
            },
            customer: {
                name:
                    updatedReservation.user?.name ||
                    updatedReservation.guestName ||
                    "Customer",
            },
            table: {
                id: updatedReservation.table?.id,
                name: updatedReservation.table?.name || "table",
            },
            restaurant: {
                id: updatedReservation.table?.restaurant?.id,
                name: updatedReservation.table?.restaurant?.name || "restaurant",
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
}

module.exports = { checkinCustomer };