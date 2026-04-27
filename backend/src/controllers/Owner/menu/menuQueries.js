const { prisma } = require("../../../prismaClient");

async function getOwnedRestaurant(ownerId) {
    return prisma.restaurant.findFirst({
        where: { ownerId },
        select: {
            id: true,
            name: true,
        },
    });
}

async function getNextSectionSortOrder(restaurantId) {
    const result = await prisma.menuSection.aggregate({
        where: { restaurantId },
        _max: { sortOrder: true },
    });

    return (result._max.sortOrder ?? -1) + 1;
}

async function getNextItemSortOrder(sectionId) {
    const result = await prisma.menuItem.aggregate({
        where: { sectionId },
        _max: { sortOrder: true },
    });

    return (result._max.sortOrder ?? -1) + 1;
}

async function getValidTagIdsForMenuItems(tagIds = []) {
    if (!Array.isArray(tagIds) || tagIds.length === 0) {
        return [];
    }

    const tags = await prisma.tag.findMany({
        where: {
            id: {
                in: tagIds,
            },
        },
        select: {
            id: true,
        },
    });

    return tags.map((tag) => tag.id);
}

module.exports = {
    getOwnedRestaurant,
    getNextSectionSortOrder,
    getNextItemSortOrder,
    getValidTagIdsForMenuItems,
};