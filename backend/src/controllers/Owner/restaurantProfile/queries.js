const { prisma } = require("../../../prismaClient");

function getImageOrderBy() {
    return [
        { isPrimary: "desc" },
        { sortOrder: "asc" },
        { createdAt: "asc" },
    ];
}

async function getOwnerRestaurantByUserId(userId) {
    return prisma.restaurant.findFirst({
        where: { ownerId: userId },
        select: {
            id: true,
            bookingRule: true,
        },
    });
}

async function getOwnerRestaurantProfileData(userId) {
    return prisma.restaurant.findFirst({
        where: { ownerId: userId },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            bookingRule: true,
            openingHours: {
                orderBy: { day: "asc" },
            },
            accessibility: {
                include: {
                    option: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
            images: {
                orderBy: getImageOrderBy(),
            },
        },
    });
}

async function getUpdatedOwnerRestaurantProfile(restaurantId) {
    return prisma.restaurant.findUnique({
        where: { id: restaurantId },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            bookingRule: true,
            openingHours: {
                orderBy: { day: "asc" },
            },
            accessibility: {
                include: {
                    option: true,
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
            images: {
                orderBy: getImageOrderBy(),
            },
        },
    });
}

async function getRestaurantImagesForOwner(userId) {
    return prisma.restaurant.findFirst({
        where: { ownerId: userId },
        include: {
            images: {
                orderBy: getImageOrderBy(),
            },
        },
    });
}

async function getRestaurantImageUploadTarget(userId) {
    return prisma.restaurant.findFirst({
        where: { ownerId: userId },
        select: {
            id: true,
            images: {
                orderBy: [
                    { sortOrder: "desc" },
                    { createdAt: "desc" },
                ],
                take: 1,
                select: {
                    sortOrder: true,
                },
            },
        },
    });
}

module.exports = {
    getImageOrderBy,
    getOwnerRestaurantByUserId,
    getOwnerRestaurantProfileData,
    getUpdatedOwnerRestaurantProfile,
    getRestaurantImagesForOwner,
    getRestaurantImageUploadTarget,
};