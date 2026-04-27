const { prisma } = require("../../../prismaClient");
const { formatRestaurantPayload } = require("./Formatting");

async function getRecentlyViewed(req, res) {
    try {
        const userId = req.user?.userId || req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorised user" });
        }

        // 1. Get recent restaurant view interactions
        const interactions = await prisma.userInteraction.findMany({
            where: {
                userId,
                eventType: "RESTAURANT_VIEW",
                restaurantId: { not: null },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 20,
        });

        // 2. Remove duplicates (keep most recent)
        const seen = new Set();
        const uniqueRestaurantIds = [];

        for (const interaction of interactions) {
            const id = String(interaction.restaurantId);
            if (!seen.has(id)) {
                seen.add(id);
                uniqueRestaurantIds.push(id);
            }
        }

        if (uniqueRestaurantIds.length === 0) {
            return res.json([]);
        }

        // 3. Fetch restaurant details
        const restaurants = await prisma.restaurant.findMany({
            where: {
                id: { in: uniqueRestaurantIds },
                verified: true,
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
                reviews: {
                    select: { rating: true },
                },
                favorites: {
                    select: { userId: true },
                },
            },
        });

        // 4. Preserve original order (important)
        const restaurantMap = new Map(
            restaurants.map((r) => [String(r.id), r])
        );

        const ordered = uniqueRestaurantIds
            .map((id) => restaurantMap.get(id))
            .filter(Boolean);

        // 5. Format output
        const result = ordered.slice(0, 4).map((restaurant) =>
            formatRestaurantPayload(restaurant, {
                userId,
                reason: "You viewed this recently",
            })
        );

        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getRecentlyViewed,
};
