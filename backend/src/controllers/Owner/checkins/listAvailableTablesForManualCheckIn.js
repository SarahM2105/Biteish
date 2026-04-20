const { prisma } = require("../../../prismaClient");
const { bookingsOverlap } = require("../../../utils/bookingsOverlap");

async function listAvailableTablesForManualCheckIn(req, res) {
    try {
        const ownerId = req.user.userId;
        const partySize = Math.max(Number(req.query.partySize) || 1, 1);

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

        const now = new Date();
        const slotMinutes = restaurant.bookingRule?.slotMinutes ?? 90;
        const turnoverMinutes = restaurant.bookingRule?.turnoverMinutes ?? 15;
        const walkInEndsAt = new Date(now.getTime() + slotMinutes * 60 * 1000);

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
                        status: {
                            in: ["PENDING", "CONFIRMED"],
                        },
                    },
                    orderBy: {
                        startsAt: "asc",
                    },
                    select: {
                        id: true,
                        startsAt: true,
                        endsAt: true,
                        checkedInAt: true,
                        status: true,
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

            const conflictingReservation = table.reservations.some((reservation) =>
                bookingsOverlap(
                    now,
                    walkInEndsAt,
                    new Date(new Date(reservation.startsAt).getTime() - turnoverMinutes * 60000),
                    new Date(new Date(reservation.endsAt).getTime() + turnoverMinutes * 60000)
                )
            );

            return !conflictingReservation;
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