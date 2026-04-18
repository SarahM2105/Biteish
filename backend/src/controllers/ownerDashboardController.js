const { prisma } = require("../prismaClient");
const { getRestaurantOccupancy } = require("../utils/occupancy");

function mapReservation(reservation) {
    return {
        id: reservation.id,
        status: reservation.status,
        startsAt: reservation.startsAt,
        endsAt: reservation.endsAt,
        checkedInAt: reservation.checkedInAt,
        partySize: reservation.partySize,
        customerName: reservation.user?.name || "Customer",
    };
}

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
        const reservedSoonThreshold = new Date(now.getTime() + 10 * 60 * 1000);

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
                    checkedInAt: null,
                    startsAt: {
                        gte: now,
                        lte: endOfDay,
                    },
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
                    description: true,
                    tables: {
                        orderBy: {
                            name: "asc",
                        },
                        select: {
                            id: true,
                            name: true,
                            capacity: true,
                            active: true,
                            reservable: true,
                            reservations: {
                                where: {
                                    status: "CONFIRMED",
                                    endsAt: {
                                        gt: now,
                                    },
                                },
                                orderBy: {
                                    startsAt: "asc",
                                },
                                select: {
                                    id: true,
                                    status: true,
                                    startsAt: true,
                                    endsAt: true,
                                    checkedInAt: true,
                                    partySize: true,
                                    user: {
                                        select: {
                                            name: true,
                                        },
                                    },
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

        const zones = zonesRaw.map((zone) => ({
            id: zone.id,
            name: zone.name,
            description: zone.description || "",
            tables: zone.tables.map((table) => {
                const occupiedReservation =
                    table.reservations.find(
                        (reservation) =>
                            reservation.checkedInAt && new Date(reservation.endsAt) > now
                    ) || null;

                const upcomingReservations = table.reservations
                    .filter(
                        (reservation) =>
                            !reservation.checkedInAt &&
                            new Date(reservation.startsAt) >= now
                    )
                    .map(mapReservation);

                const nextUpcomingReservation = upcomingReservations[0] || null;

                const reservedSoon =
                    nextUpcomingReservation &&
                    new Date(nextUpcomingReservation.startsAt) <= reservedSoonThreshold;

                const currentReservation = occupiedReservation
                    ? mapReservation(occupiedReservation)
                    : reservedSoon
                        ? nextUpcomingReservation
                        : null;

                return {
                    id: table.id,
                    name: table.name,
                    capacity: table.capacity,
                    active: table.active,
                    reservable: table.reservable,
                    isBookable: table.active && table.reservable,
                    currentReservation,
                    upcomingReservations,
                };
            }),
        }));

        const zoneSummaries = zones.map((zone) => {
            const totalTables = zone.tables.length;
            const activeTables = zone.tables.filter((table) => table.active).length;
            const reservableTables = zone.tables.filter((table) => table.reservable).length;
            const occupiedTables = zone.tables.filter(
                (table) => table.currentReservation?.checkedInAt
            ).length;
            const reservedTables = zone.tables.filter(
                (table) =>
                    table.active &&
                    !table.currentReservation?.checkedInAt &&
                    table.currentReservation
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
            zones,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = { getOwnerDashboard };