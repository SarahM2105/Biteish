const { prisma } = require("../../prismaClient");

const ALLOWED_EVENT_TYPES = new Set([
    "RESTAURANT_VIEW",
    "RECOMMENDATION_CLICK",
    "FAVOURITE_ADDED",
    "FAVOURITE_REMOVED",
    "BOOKING_CREATED",
    "BOOKING_COMPLETED",
    "REVIEW_CREATED",
    "SEARCH_PERFORMED",
    "FILTER_APPLIED",
]);

const ALLOWED_SOURCES = new Set([
    "DASHBOARD",
    "SEARCH",
    "RESTAURANT_PAGE",
    "FAVOURITES",
    "RECOMMENDATIONS",
    "BOOKING_FLOW",
]);

function normaliseString(value) {
    const text = String(value || "").trim();
    return text || null;
}

async function createCustomerInteraction(req, res) {
    try {
        const userId = req.user?.userId || req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorised user" });
        }

        const {
            restaurantId,
            tagId,
            optionId,
            searchQuery,
            eventType,
            source,
            weight,
            metadata,
        } = req.body || {};

        if (!ALLOWED_EVENT_TYPES.has(eventType)) {
            return res.status(400).json({ error: "Invalid eventType" });
        }

        if (source && !ALLOWED_SOURCES.has(source)) {
            return res.status(400).json({ error: "Invalid source" });
        }

        const cleanedRestaurantId = normaliseString(restaurantId);
        const cleanedTagId = normaliseString(tagId);
        const cleanedOptionId = normaliseString(optionId);
        const cleanedSearchQuery = normaliseString(searchQuery);

        let nextWeight = 1;

        if (weight !== undefined) {
            const numericWeight = Number(weight);

            if (Number.isNaN(numericWeight) || numericWeight <= 0) {
                return res.status(400).json({ error: "Invalid weight" });
            }

            nextWeight = numericWeight;
        }

        const interaction = await prisma.userInteraction.create({
            data: {
                userId,
                restaurantId: cleanedRestaurantId,
                tagId: cleanedTagId,
                optionId: cleanedOptionId,
                searchQuery: cleanedSearchQuery,
                eventType,
                source: source || null,
                weight: nextWeight,
                metadata:
                    metadata && typeof metadata === "object" && !Array.isArray(metadata)
                        ? metadata
                        : null,
            },
        });

        return res.status(201).json(interaction);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    createCustomerInteraction,
};