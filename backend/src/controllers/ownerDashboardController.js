const { prisma } = require("../prismaClient");
const { getRestaurantOccupancy } = require("../utils/occupancy");

async function getOwnerDashboard(req, res) {
    try {
        const ownerId = req.user.userId;

        const restaurant = await prisma.restaurant.findFirst({
            where: { ownerId },
            select: {
                id: true,
                name: true,
                location: true,
            },
        });

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const [
            occupancy,
            pendingBookingsCount,
            pendingChangeRequestsCount,
            expectedGuestsRaw,
            zonesRaw,
        ] = await Promise.all([
            getRestaurantOccupancy(restaurant.id),
            prisma.reservation.count({
                where: {
                    restaurantId: restaurant.id,
                    status: "PENDING",
                },
            }),
            prisma.reservationChangeRequest.count({
                where: {
                    status: "PENDING",
                    reservation: {
                        table: {
                            zone: {
                                restaurantId: restaurant.id,
                            },
                        },
                    },
                },
            }),
            prisma.reservation.findMany({
                where: {
                    restaurantId: restaurant.id,
                    status: {
                        in: ["CONFIRMED", "PENDING"],
                    },
                    OR: [
                        {
                            startsAt: {
                                gte: startOfDay,
                                lte: endOfDay,
                            },
                        },
                        {
                            AND: [
                                { checkedInAt: { not: null } },
                                { endsAt: { gt: now } },
                            ],
                        },
                    ],
                },
                include: {
                    user: {
                        select: {
                            name: true,
                        },
                    },
                    table: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: {
                    startsAt: "asc",
                },
                take: 8,
            }),
            prisma.zone.findMany({
                where: {
                    restaurantId: restaurant.id,
                },
                orderBy: {
                    name: "asc",
                },
                select: {
                    id: true,
                    name: true,
                    tables: {
                        orderBy: {
                            name: "asc",
                        },
                        select: {
                            id: true,
                            name: true,
                            active: true,
                            reservable: true,
                            reservations: {
                                where: {
                                    OR: [
                                        {
                                            AND: [
                                                { status: "CONFIRMED" },
                                                { checkedInAt: { not: null } },
                                                { endsAt: { gt: now } },
                                            ],
                                        },
                                        {
                                            AND: [
                                                { status: "CONFIRMED" },
                                                { checkedInAt: null },
                                                {
                                                    startsAt: {
                                                        gte: startOfDay,
                                                        lte: endOfDay,
                                                    },
                                                },
                                            ],
                                        },
                                    ],
                                },
                                select: {
                                    id: true,
                                    checkedInAt: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);

        const expectedGuests = expectedGuestsRaw.map((reservation) => ({
            id: reservation.id,
            customerName: reservation.user?.name || "Customer",
            partySize: reservation.partySize,
            status: reservation.status,
            startsAt: reservation.startsAt,
            checkedInAt: reservation.checkedInAt,
            tableName: reservation.table?.name || null,
        }));

        const zoneSummaries = zonesRaw.map((zone) => {
            const totalTables = zone.tables.length;
            const activeTables = zone.tables.filter((table) => table.active).length;
            const reservableTables = zone.tables.filter((table) => table.reservable).length;
            const occupiedTables = zone.tables.filter((table) =>
                table.reservations.some((reservation) => reservation.checkedInAt)
            ).length;
            const reservedTables = zone.tables.filter((table) =>
                table.reservations.some((reservation) => !reservation.checkedInAt)
            ).length;

            return {
                id: zone.id,
                name: zone.name,
                totalTables,
                activeTables,
                reservableTables,
                occupiedTables,
                reservedTables,
            };
        });

        const layoutSummary = zoneSummaries.reduce(
            (acc, zone) => {
                acc.zonesCount += 1;
                acc.totalTables += zone.totalTables;
                acc.activeTables += zone.activeTables;
                acc.reservableTables += zone.reservableTables;
                acc.occupiedTables += zone.occupiedTables;
                acc.reservedTables += zone.reservedTables;
                return acc;
            },
            {
                zonesCount: 0,
                totalTables: 0,
                activeTables: 0,
                reservableTables: 0,
                occupiedTables: 0,
                reservedTables: 0,
            }
        );

        return res.status(200).json({
            restaurant,
            summary: {
                occupiedGuests: occupancy.occupiedGuests,
                occupiedTables: occupancy.occupiedTables,
                activeReservations: occupancy.activeReservations,
                pendingBookingsCount,
                pendingChangeRequestsCount,
            },
            expectedGuests,
            layoutSummary,
            zoneSummaries,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = { getOwnerDashboard };