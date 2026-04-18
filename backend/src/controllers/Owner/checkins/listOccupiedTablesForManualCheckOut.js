const { prisma } = require("../../../prismaClient");

async function listOccupiedTablesForManualCheckOut(req, res) {
    try {
        const ownerId = req.user.userId;

        const restaurant = await prisma.restaurant.findFirst({
            where: { ownerId },
            select: { id: true },
        });

        if (!restaurant) {
            return res.status(404).json({
                error: "Restaurant not found",
            });
        }

        const tables = await prisma.table.findMany({
            where: {
                zone: {
                    restaurantId: restaurant.id,
                },
            },
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                name: true,
                capacity: true,
                active: true,
                reservations: {
                    where: {
                        status: "CONFIRMED",
                        checkedInAt: {
                            not: null,
                        },
                    },
                    orderBy: {
                        checkedInAt: "desc",
                    },
                    take: 1,
                    select: {
                        id: true,
                        partySize: true,
                        guestName: true,
                        user: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        const occupiedTables = tables
            .filter((table) => table.reservations.length > 0)
            .map((table) => ({
                id: table.id,
                name: table.name,
                capacity: table.capacity,
                active: table.active,
                partySize: table.reservations[0].partySize,
                guestName:
                    table.reservations[0].user?.name ||
                    table.reservations[0].guestName ||
                    "Guest",
            }));

        return res.json({
            tables: occupiedTables,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Server error",
        });
    }
}

module.exports = { listOccupiedTablesForManualCheckOut };