const { prisma } = require("../../../prismaClient");
const { getIO } = require("../../../socket");
const { getRestaurantOccupancy } = require("../../../utils/occupancy");

async function manualCheckOut(req, res) {
    try {
        const ownerId = req.user.userId;
        const { tableId } = req.body;

        if (!tableId) {
            return res.status(400).json({
                error: "tableId is required",
            });
        }

        const restaurant = await prisma.restaurant.findFirst({
            where: { ownerId },
            select: { id: true },
        });

        if (!restaurant) {
            return res.status(404).json({
                error: "Restaurant not found",
            });
        }

        const table = await prisma.table.findFirst({
            where: {
                id: tableId,
                zone: {
                    restaurantId: restaurant.id,
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        if (!table) {
            return res.status(404).json({
                error: "Table not found",
            });
        }

        const now = new Date();

        const activeReservation = await prisma.reservation.findFirst({
            where: {
                tableId: table.id,
                status: "CONFIRMED",
                checkedInAt: {
                    not: null,
                },
            },
            orderBy: {
                checkedInAt: "desc",
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!activeReservation) {
            return res.status(404).json({
                error: "No active checked-in reservation found for this table",
            });
        }

        const updatedReservation = await prisma.reservation.update({
            where: {
                id: activeReservation.id,
            },
            data: {
                status: "COMPLETED",
                endsAt: now,
            },
            include: {
                user: {
                    select: {
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
            message: "Customer checked out successfully",
            checkedOutAt: now,
            table: {
                id: table.id,
                name: table.name,
            },
            reservation: {
                id: updatedReservation.id,
                partySize: updatedReservation.partySize,
            },
            customer: {
                name:
                    updatedReservation.user?.name ||
                    updatedReservation.guestName ||
                    "Guest",
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Server error",
        });
    }
}

module.exports = { manualCheckOut };