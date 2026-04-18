const { prisma } = require("../../../prismaClient");

async function listAvailableTablesForManualCheckIn(req, res) {
    try {
        const ownerId = req.user.userId;
        const partySize = Math.max(Number(req.query.partySize) || 1, 1);

        const restaurant = await prisma.restaurant.findFirst({
            where: { ownerId },
            select: { id: true },
        });

        if (!restaurant) {
            return res.status(404).json({
                error: "Restaurant not found",
            });
        }

        const now = new Date();
        const reservedSoonThreshold = new Date(now.getTime() + 10 * 60 * 1000);

        const tables = await prisma.table.findMany({
            where: {
                zone: {
                    restaurantId: restaurant.id,
                },
                active: true,
                reservable: true,
                capacity: {
                    gte: partySize,
                },
            },
            orderBy: {
                name: "asc",
            },
            select: {
                id: true,
                name: true,
                capacity: true,
                reservations: {
                    where: {
                        status: "CONFIRMED",
                    },
                    orderBy: {
                        startsAt: "asc",
                    },
                    select: {
                        id: true,
                        startsAt: true,
                        endsAt: true,
                        checkedInAt: true,
                    },
                },
            },
        });

        const availableTables = tables.filter((table) => {
            const occupied = table.reservations.some(
                (reservation) => reservation.checkedInAt
            );

            if (occupied) {
                return false;
            }

            const reservedSoon = table.reservations.some(
                (reservation) =>
                    !reservation.checkedInAt &&
                    new Date(reservation.startsAt) >= now &&
                    new Date(reservation.startsAt) <= reservedSoonThreshold
            );

            return !reservedSoon;
        });

        return res.json({
            tables: availableTables.map((table) => ({
                id: table.id,
                name: table.name,
                capacity: table.capacity,
            })),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Server error",
        });
    }
}

module.exports = { listAvailableTablesForManualCheckIn };