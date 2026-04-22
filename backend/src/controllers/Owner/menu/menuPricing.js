const { prisma } = require("../../../prismaClient");

function parseMenuItemPrice(value) {
    const numeric = Number(value);

    if (!Number.isFinite(numeric) || numeric < 0) {
        return null;
    }

    return numeric.toFixed(2);
}

function getNumericPrice(value) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
}

function calculateEstimatedSpendRange(prices) {
    if (!prices.length) {
        return {
            estimatedSpendMin: null,
            estimatedSpendMax: null,
        };
    }

    const sortedPrices = [...prices].sort((a, b) => a - b);

    let workingPrices = sortedPrices;

    if (sortedPrices.length >= 5) {
        workingPrices = sortedPrices.slice(1, -1);
    }

    const average =
        workingPrices.reduce((sum, price) => sum + price, 0) / workingPrices.length;

    const estimatedSpendMin = Math.max(1, Math.floor(average * 0.8));
    const estimatedSpendMax = Math.max(
        estimatedSpendMin,
        Math.ceil(average * 1.2)
    );

    return {
        estimatedSpendMin,
        estimatedSpendMax,
    };
}

async function refreshEstimatedSpendIfAutomatic(restaurantId) {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: {
            id: true,
            automaticSpendCalculation: true,
        },
    });

    if (!restaurant || !restaurant.automaticSpendCalculation) {
        return;
    }

    const sections = await prisma.menuSection.findMany({
        where: {
            restaurantId,
            isActive: true,
        },
        select: {
            items: {
                where: {
                    isAvailable: true,
                },
                select: {
                    price: true,
                },
            },
        },
    });

    const prices = sections
        .flatMap((section) => section.items || [])
        .map((item) => getNumericPrice(item.price))
        .filter((price) => price !== null && price > 0);

    const { estimatedSpendMin, estimatedSpendMax } =
        calculateEstimatedSpendRange(prices);

    await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
            estimatedSpendMin,
            estimatedSpendMax,
        },
    });
}

module.exports = {
    parseMenuItemPrice,
    refreshEstimatedSpendIfAutomatic,
};