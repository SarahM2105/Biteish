const { prisma } = require("../prismaClient");

async function listRestaurants(req, res) {
    try {
        const q = (req.query.q || "").trim().toLowerCase();
        const userId = req.user?.userId || req.user?.id;

        const searchWords = q
            .split(/\s+/)
            .map((word) => word.trim())
            .filter(Boolean);

        const restaurants = await prisma.restaurant.findMany({
            where: {
                verified: true,
                ...(searchWords.length > 0
                    ? {
                        AND: searchWords.map((word) => ({
                            OR: [
                                {
                                    name: {
                                        contains: word,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    location: {
                                        contains: word,
                                        mode: "insensitive",
                                    },
                                },
                                {
                                    tags: {
                                        some: {
                                            tag: {
                                                name: {
                                                    contains: word,
                                                    mode: "insensitive",
                                                },
                                            },
                                        },
                                    },
                                },
                                {
                                    menuItems: {
                                        some: {
                                            OR: [
                                                {
                                                    name: {
                                                        contains: word,
                                                        mode: "insensitive",
                                                    },
                                                },
                                                {
                                                    dietaryInfo: {
                                                        contains: word,
                                                        mode: "insensitive",
                                                    },
                                                },
                                                {
                                                    menuItemTags: {
                                                        some: {
                                                            tag: {
                                                                name: {
                                                                    contains: word,
                                                                    mode: "insensitive",
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                            ],
                        })),
                    }
                    : {}),
            },
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
                automaticSpendCalculation: true,
                bookingRule: {
                    select: {
                        daysAhead: true,
                        slotMinutes: true,
                        cancellationCutoffMinutes: true,
                    },
                },
                zones: {
                    select: {
                        tables: {
                            where: {
                                active: true,
                                reservable: true,
                            },
                            select: {
                                capacity: true,
                            },
                        },
                    },
                },
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
                menuItems: {
                    where: {
                        isAvailable: true,
                    },
                    select: {
                        name: true,
                        dietaryInfo: true,
                        menuItemTags: {
                            select: {
                                tag: {
                                    select: {
                                        name: true,
                                    },
                                },
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
                    ? restaurant.reviews.reduce(
                    (sum, review) => sum + review.rating,
                    0
                ) / reviewCount
                    : 0;

            const allTables = (restaurant.zones || []).flatMap(
                (zone) => zone.tables || []
            );

            const largestTableCapacity =
                allTables.length > 0
                    ? Math.max(...allTables.map((table) => Number(table.capacity) || 0))
                    : null;

            return {
                id: restaurant.id,
                name: restaurant.name,
                description: restaurant.description,
                location: restaurant.location,
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
                verified: restaurant.verified,
                estimatedSpendMin: restaurant.estimatedSpendMin,
                estimatedSpendMax: restaurant.estimatedSpendMax,
                automaticSpendCalculation: restaurant.automaticSpendCalculation,
                bookingRule: {
                    daysAhead: restaurant.bookingRule?.daysAhead ?? null,
                    slotMinutes: restaurant.bookingRule?.slotMinutes ?? null,
                    cancellationCutoffMinutes:
                        restaurant.bookingRule?.cancellationCutoffMinutes ?? null,
                },
                maxPartySize: largestTableCapacity,
                imageUrl: restaurant.images[0]?.imageUrl || null,
                imageAltText: restaurant.images[0]?.altText || null,
                tags: restaurant.tags.map((item) => item.tag.name),
                accessibilityOptions: restaurant.accessibility.map(
                    (item) => item.option.optionName
                ),
                averageRating: Number(averageRating.toFixed(1)),
                reviewCount,
                isFavourite:
                    Array.isArray(restaurant.favorites) &&
                    restaurant.favorites.length > 0,
            };
        });

        return res.json(formattedRestaurants);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = { listRestaurants };