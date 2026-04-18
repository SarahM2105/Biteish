const { prisma } = require("../prismaClient");

async function getLateArrivals(req, res) {
    try {
        const ownerId = req.user.userId;

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
        const graceMinutes = restaurant.bookingRule?.graceMinutes ?? 15;
        const lateThreshold = new Date(now.getTime() - graceMinutes * 60 * 1000);

        const lateReservations = await prisma.reservation.findMany({
            where: {
                restaurantId: restaurant.id,
                status: "CONFIRMED",
                checkedInAt: null,
                startsAt: {
                    lte: lateThreshold,
                },
                endsAt: {
                    gt: now,
                },
            },
            orderBy: {
                startsAt: "asc",
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

        const reservations = lateReservations.map((reservation) => ({
            id: reservation.id,
            customerName: reservation.user?.name || "Guest",
            tableName: reservation.table?.name || "Table",
            partySize: reservation.partySize,
            startsAt: reservation.startsAt,
            minutesLate: Math.max(
                0,
                Math.floor((now - new Date(reservation.startsAt)) / (1000 * 60))
            ),
            graceMinutes,
        }));

        return res.json({ reservations });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Server error",
        });
    }
}

module.exports = {
    getLateArrivals,
};