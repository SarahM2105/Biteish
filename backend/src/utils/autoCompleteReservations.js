const { prisma } = require("../prismaClient");

const AUTO_COMPLETE_GRACE_MINUTES = 10;

async function autoCompleteExpiredCheckedIns() {
    const cutoff = new Date(
        Date.now() - AUTO_COMPLETE_GRACE_MINUTES * 60 * 1000
    );

    const overdueReservations = await prisma.reservation.findMany({
        where: {
            status: "CONFIRMED",
            checkedInAt: { not: null },
            endsAt: { lte: cutoff },
        },
        select: {
            id: true,
            restaurantId: true,
            tableId: true,
            userId: true,
            startsAt: true,
            endsAt: true,
        },
    });

    if (!overdueReservations.length) {
        return [];
    }

    for (const reservation of overdueReservations) {
        await prisma.reservation.update({
            where: { id: reservation.id },
            data: {
                status: "COMPLETED",
                // checkedOutAt: new Date(),
            },
        });
    }

    return overdueReservations;
}

module.exports = {
    AUTO_COMPLETE_GRACE_MINUTES,
    autoCompleteExpiredCheckedIns,
};