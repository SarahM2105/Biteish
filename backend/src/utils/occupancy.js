const { prisma } = require("../prismaClient");

async function getRestaurantOccupancy(restaurantId) {
    const activeReservations = await prisma.reservation.findMany({
        where: {
            restaurantId,
            status: "CONFIRMED",
            checkedInAt: { not: null },
        },
        select: {
            id: true,
            tableId: true,
            partySize: true,
            startsAt: true,
            endsAt: true,
            checkedInAt: true,
        },
    });

    const occupiedGuests = activeReservations.reduce((sum, reservation) => {
        return sum + (reservation.partySize || 0);
    }, 0);

    const occupiedTables = new Set(
        activeReservations.map((reservation) => reservation.tableId)
    ).size;

    return {
        occupiedGuests,
        occupiedTables,
        activeReservations: activeReservations.length,
    };
}

module.exports = { getRestaurantOccupancy };