const { prisma } = require("../../prismaClient");

async function listFavouriteRestaurants(req, res) {
    try {
        const userId = req.user?.userId || req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorised user" });
        }

        const favourites = await prisma.favorite.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                restaurantId: true,
                createdAt: true,
                restaurant: {
                    select: {
                        id: true,
                        name: true,
                        location: true,
                        latitude: true,
                        longitude: true,
                        verified: true,
                        estimatedSpendMin: true,
                        estimatedSpendMax: true,
                        images: {
                            where: {
                                isPrimary: true,
                            },
                            select: {
                                id: true,
                                imageUrl: true,
                                altText: true,
                            },
                            take: 1,
                        },
                        tags: {
                            select: {
                                tag: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                        accessibility: {
                            select: {
                                option: {
                                    select: {
                                        optionName: true,
                                    },
                                },
                            },
                        },
                        reviews: {
                            select: {
                                rating: true,
                            },
                        },
                    },
                },
            },
        });

        const formatted = favourites.map((item) => {
            const reviewCount = item.restaurant.reviews.length;
            const averageRating =
                reviewCount > 0
                    ? item.restaurant.reviews.reduce(
                    (sum, review) => sum + review.rating,
                    0
                ) / reviewCount
                    : 0;

            return {
                favouriteId: item.id,
                createdAt: item.createdAt,
                id: item.restaurant.id,
                name: item.restaurant.name,
                location: item.restaurant.location,
                latitude: item.restaurant.latitude,
                longitude: item.restaurant.longitude,
                verified: item.restaurant.verified,
                estimatedSpendMin: item.restaurant.estimatedSpendMin,
                estimatedSpendMax: item.restaurant.estimatedSpendMax,
                imageUrl: item.restaurant.images[0]?.imageUrl || null,
                imageAltText: item.restaurant.images[0]?.altText || null,
                tags: item.restaurant.tags.map((tagItem) => tagItem.tag.name),
                accessibilityOptions: item.restaurant.accessibility.map(
                    (accessItem) => accessItem.option.optionName
                ),
                averageRating: Number(averageRating.toFixed(1)),
                reviewCount,
                isFavourite: true,
            };
        });

        return res.json(formatted);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function addFavouriteRestaurant(req, res) {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { restaurantId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorised user" });
        }

        const restaurant = await prisma.restaurant.findFirst({
            where: {
                id: restaurantId,
                verified: true,
            },
            select: { id: true },
        });

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        const favourite = await prisma.favorite.upsert({
            where: {
                userId_restaurantId: {
                    userId,
                    restaurantId,
                },
            },
            update: {},
            create: {
                userId,
                restaurantId,
            },
        });

        return res.status(201).json({
            message: "Restaurant added to favourites",
            favourite,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function removeFavouriteRestaurant(req, res) {
    try {
        const userId = req.user?.userId || req.user?.id;
        const { restaurantId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorised user" });
        }

        await prisma.favorite.deleteMany({
            where: {
                userId,
                restaurantId,
            },
        });

        return res.json({
            message: "Restaurant removed from favourites",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    listFavouriteRestaurants,
    addFavouriteRestaurant,
    removeFavouriteRestaurant,
};