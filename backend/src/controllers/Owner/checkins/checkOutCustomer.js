const { prisma } = require("../../../prismaClient");

async function checkOutCustomer(req, res) {
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
                error: `Only confirmed reservations can be checked out. Current status: ${reservation.status}`,
            });
        }

        if (!reservation.checkedInAt) {
            return res.status(400).json({
                error: "Reservation has not been checked in yet",
            });
        }

        const now = new Date();

        if (new Date(reservation.endsAt) <= now) {
            return res.status(400).json({
                error: "Reservation is no longer active",
            });
        }

        const updatedReservation = await prisma.reservation.update({
            where: { id: reservation.id },
            data: {
                status: "COMPLETED",
                endsAt: now,
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
            message: "Customer checked out successfully",
            checkedOutAt: now,
            reservation: {
                id: updatedReservation.id,
                startsAt: updatedReservation.startsAt,
                endsAt: updatedReservation.endsAt,
                partySize: updatedReservation.partySize,
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
            error: "Server error",
        });
    }
}

module.exports = {checkOutCustomer};