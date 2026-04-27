const { prisma } = require("../../../prismaClient");

async function getUserRecommendationData(userId) {
    return Promise.all([
        prisma.reservation.findMany({
            where: {
                userId,
                status: {
                    in: ["COMPLETED", "CONFIRMED"],
                },
            },
            select: {
                status: true,
                restaurant: {
                    select: {
                        id: true,
                        location: true,
                        tags: {
                            select: {
                                tag: { select: { name: true } },
                            },
                        },
                        accessibility: {
                            select: {
                                option: { select: { optionName: true } },
                            },
                        },
                        menuItems: {
                            where: { isAvailable: true },
                            select: {
                                dietaryInfo: true,
                                menuItemTags: {
                                    select: {
                                        tag: { select: { name: true } },
                                    },
                                },
                            },
                        },
                    },
                },
                table: {
                    select: {
                        tableAccessibilities: {
                            select: {
                                option: { select: { optionName: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        }),

        prisma.favorite.findMany({
            where: { userId },
            select: {
                restaurant: {
                    select: {
                        id: true,
                        location: true,
                        tags: {
                            select: {
                                tag: { select: { name: true } },
                            },
                        },
                        accessibility: {
                            select: {
                                option: { select: { optionName: true } },
                            },
                        },
                        menuItems: {
                            where: { isAvailable: true },
                            select: {
                                dietaryInfo: true,
                                menuItemTags: {
                                    select: {
                                        tag: { select: { name: true } },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        }),

        prisma.userInteraction.findMany({
            where: { userId },
            select: {
                restaurantId: true,
                searchQuery: true,
                eventType: true,
                source: true,
                weight: true,
                metadata: true,
                tag: { select: { name: true } },
                option: { select: { optionName: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        }),

        prisma.restaurant.findMany({
            where: { verified: true },
            select: {
                id: true,
                name: true,
                description: true,
                location: true,
                latitude: true,
                longitude: true,
                verified: true,
                estimatedSpendMin: true,
                estimatedSpendMax: true,
                images: {
                    where: { isPrimary: true },
                    select: { imageUrl: true, altText: true },
                    take: 1,
                },
                tags: {
                    select: {
                        tag: { select: { name: true } },
                    },
                },
                accessibility: {
                    select: {
                        option: { select: { optionName: true } },
                    },
                },
                menuItems: {
                    where: { isAvailable: true },
                    select: {
                        dietaryInfo: true,
                        menuItemTags: {
                            select: {
                                tag: { select: { name: true } },
                            },
                        },
                    },
                },
                reviews: {
                    select: { rating: true },
                },
                favorites: {
                    select: { userId: true },
                },
                tables: {
                    where: {
                        active: true,
                        reservable: true,
                    },
                    select: {
                        id: true,
                        tableAccessibilities: {
                            select: {
                                option: { select: { optionName: true } },
                            },
                        },
                    },
                },
                openingHours: {
                    select: {
                        day: true,
                        opensAt: true,
                        closesAt: true,
                    },
                },
            },
            take: 200,
        }),
    ]);
}

module.exports = {
    getUserRecommendationData,
};