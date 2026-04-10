const { prisma } = require("../prismaClient");

async function listRestaurants(req, res) {
    try {
        const q = (req.query.q || "").trim().toLowerCase();
        const userId = req.user?.userId || req.user?.id;

        const restaurants = await prisma.restaurant.findMany({
            where: {
                verified: true,
                ...(q
                    ? {
                        OR: [
                            { name: { contains: q, mode: "insensitive" } },
                            { location: { contains: q, mode: "insensitive" } },
                        ],
                    }
                    : {}),
            },
            select: {
                id: true,
                name: true,
                location: true,
                latitude: true,
                longitude: true,
                verified: true,
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
                favorites: userId
                    ? {
                        where: {
                            userId,
                        },
                        select: {
                            id: true,
                        },
                    }
                    : false,
            },
            take: 200,
        });

        const formattedRestaurants = restaurants.map((restaurant) => {
            const reviewCount = restaurant.reviews.length;
            const averageRating =
                reviewCount > 0
                    ? restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
                    : 0;

            return {
                id: restaurant.id,
                name: restaurant.name,
                location: restaurant.location,
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
                verified: restaurant.verified,
                tags: restaurant.tags.map((item) => item.tag.name),
                accessibilityOptions: restaurant.accessibility.map(
                    (item) => item.option.optionName
                ),
                averageRating: Number(averageRating.toFixed(1)),
                reviewCount,
                isFavourite: Array.isArray(restaurant.favorites) && restaurant.favorites.length > 0,
            };
        });

        return res.json(formattedRestaurants);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = { listRestaurants };