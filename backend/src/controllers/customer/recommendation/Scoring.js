const {
    addWeight,
    incrementCount,
    getWeightedAmount,
    normalise,
    isRestaurantOpenNow,
} = require("./recommendationHelpers");
const {
    extractMenuSignalsFromRestaurant,
    extractRestaurantAccessibilitySignals,
    extractTableAccessibilitySignals,
    extractCandidateAccessibilitySignals,
    extractSignalsFromInteraction,
} = require("./signals");
const {
    buildReason,
    formatRestaurantPayload,
} = require("./formatting");

function scoreRecommendations({
                                  reservations,
                                  favourites,
                                  interactions,
                                  restaurants,
                                  userId,
                              }) {
    const tagWeights = new Map();
    const locationWeights = new Map();
    const menuWeights = new Map();
    const accessibilityWeights = new Map();
    const searchWeights = new Map();
    const visitedRestaurantCounts = new Map();
    const favouriteRestaurantIds = new Set();
    const interactionRestaurantBoosts = new Map();

    reservations.forEach((reservation, index) => {
        const restaurantId = reservation.restaurant?.id;
        const tagNames =
            reservation.restaurant?.tags?.map((item) => item.tag.name) || [];
        const menuSignals = extractMenuSignalsFromRestaurant(
            reservation.restaurant
        );
        const accessibilitySignals = [
            ...extractRestaurantAccessibilitySignals(reservation.restaurant),
            ...extractTableAccessibilitySignals(reservation.table),
        ];

        const baseWeight = reservation.status === "COMPLETED" ? 3.5 : 1.75;
        const weightedAmount = getWeightedAmount(baseWeight, index);

        tagNames.forEach((tagName) => addWeight(tagWeights, tagName, weightedAmount));
        menuSignals.forEach((signal) =>
            addWeight(menuWeights, signal, weightedAmount)
        );
        accessibilitySignals.forEach((signal) =>
            addWeight(accessibilityWeights, signal, weightedAmount)
        );
        addWeight(
            locationWeights,
            reservation.restaurant?.location,
            weightedAmount / 2
        );

        if (restaurantId) {
            incrementCount(visitedRestaurantCounts, restaurantId, 1);
        }
    });

    favourites.forEach((favourite, index) => {
        const restaurantId = favourite.restaurant?.id;
        const tagNames =
            favourite.restaurant?.tags?.map((item) => item.tag.name) || [];
        const menuSignals = extractMenuSignalsFromRestaurant(
            favourite.restaurant
        );
        const accessibilitySignals = extractRestaurantAccessibilitySignals(
            favourite.restaurant
        );
        const weightedAmount = getWeightedAmount(2.5, index);

        tagNames.forEach((tagName) => addWeight(tagWeights, tagName, weightedAmount));
        menuSignals.forEach((signal) =>
            addWeight(menuWeights, signal, weightedAmount)
        );
        accessibilitySignals.forEach((signal) =>
            addWeight(accessibilityWeights, signal, weightedAmount)
        );
        addWeight(locationWeights, favourite.restaurant?.location, weightedAmount / 2);

        if (restaurantId) {
            favouriteRestaurantIds.add(String(restaurantId));
        }
    });

    interactions.forEach((interaction, index) => {
        let baseWeight = Number(interaction.weight) || 1;

        if (interaction.eventType === "SEARCH_PERFORMED") {
            baseWeight *= 1.8;
        } else if (interaction.eventType === "FILTER_APPLIED") {
            baseWeight *= 1.4;
        } else if (interaction.eventType === "RESTAURANT_VIEW") {
            baseWeight *= 1.15;
        } else if (interaction.eventType === "RECOMMENDATION_CLICK") {
            baseWeight *= 1.8;
        } else if (interaction.eventType === "FAVOURITE_ADDED") {
            baseWeight *= 2.4;
        } else if (interaction.eventType === "FAVOURITE_REMOVED") {
            baseWeight *= -1.2;
        } else if (interaction.eventType === "BOOKING_CREATED") {
            baseWeight *= 2.5;
        } else if (interaction.eventType === "BOOKING_COMPLETED") {
            baseWeight *= 3;
        } else if (interaction.eventType === "REVIEW_CREATED") {
            baseWeight *= 2;
        }

        const weightedAmount = getWeightedAmount(baseWeight, index);
        const interactionSignals = extractSignalsFromInteraction(interaction);

        interactionSignals.forEach((signal) => {
            if (signal.startsWith("tag:")) {
                addWeight(tagWeights, signal.replace(/^tag:/, ""), weightedAmount);
            } else if (
                signal.startsWith("diet:") ||
                signal.startsWith("menu-tag:") ||
                signal.startsWith("query:")
            ) {
                addWeight(menuWeights, signal, weightedAmount);
                addWeight(searchWeights, signal, weightedAmount);
            } else if (
                signal.startsWith("access:") ||
                signal.startsWith("table-access:")
            ) {
                addWeight(accessibilityWeights, signal, weightedAmount);
            }
        });

        if (interaction.restaurantId) {
            addWeight(
                interactionRestaurantBoosts,
                interaction.restaurantId,
                weightedAmount
            );
            incrementCount(visitedRestaurantCounts, interaction.restaurantId, 1);
        }
    });

    const coldStart =
        tagWeights.size === 0 &&
        locationWeights.size === 0 &&
        menuWeights.size === 0 &&
        accessibilityWeights.size === 0 &&
        searchWeights.size === 0;

    const enriched = restaurants.map((restaurant) => {
        const tagNames = restaurant.tags.map((item) => item.tag.name);
        const menuSignals = extractMenuSignalsFromRestaurant(restaurant);
        const accessibilitySignals =
            extractCandidateAccessibilitySignals(restaurant);

        const reviewCount = restaurant.reviews.length;
        const averageRating =
            reviewCount > 0
                ? restaurant.reviews.reduce(
                (sum, review) => sum + review.rating,
                0
            ) / reviewCount
                : 0;

        const favouritesCount = restaurant.favorites.length;
        const availabilityRaw = restaurant.tables.length;
        const popularityRaw = favouritesCount * 2 + reviewCount;
        const isOpenNow = isRestaurantOpenNow(restaurant.openingHours);

        const locationMatchScore =
            locationWeights.get(
                String(restaurant.location || "").trim().toLowerCase()
            ) || 0;

        const interactionRestaurantBoost =
            interactionRestaurantBoosts.get(String(restaurant.id)) || 0;

        const matchingTags = tagNames.filter((tagName) =>
            tagWeights.has(String(tagName).trim().toLowerCase())
        );

        const matchingMenuSignals = menuSignals.filter((signal) =>
            menuWeights.has(signal)
        );

        const matchingAccessibilitySignals = accessibilitySignals.filter((signal) =>
            accessibilityWeights.has(signal)
        );

        const matchingSearchSignals = menuSignals.filter((signal) =>
            searchWeights.has(signal)
        );

        const tagMatchRaw = matchingTags.reduce(
            (sum, tagName) =>
                sum + (tagWeights.get(String(tagName).trim().toLowerCase()) || 0),
            0
        );

        const menuMatchRaw = matchingMenuSignals.reduce(
            (sum, signal) => sum + (menuWeights.get(signal) || 0),
            0
        );

        const accessibilityMatchRaw = matchingAccessibilitySignals.reduce(
            (sum, signal) => sum + (accessibilityWeights.get(signal) || 0),
            0
        );

        const searchMatchRaw = matchingSearchSignals.reduce(
            (sum, signal) => sum + (searchWeights.get(signal) || 0),
            0
        );

        const visitedCount =
            visitedRestaurantCounts.get(String(restaurant.id)) || 0;
        const isPreviouslyVisited = visitedCount > 0;
        const isUserFavourite = favouriteRestaurantIds.has(String(restaurant.id));

        const hasStrongSignal =
            tagMatchRaw > 0 ||
            menuMatchRaw > 0 ||
            searchMatchRaw > 0 ||
            accessibilityMatchRaw > 0;

        return {
            restaurant,
            averageRating,
            ratingNorm: averageRating / 5,
            availabilityRaw: availabilityRaw + (isOpenNow ? 2 : 0),
            popularityRaw,
            locationMatchScore,
            interactionRestaurantBoost,
            tagMatchRaw,
            menuMatchRaw,
            accessibilityMatchRaw,
            searchMatchRaw,
            matchingTags,
            matchingMenuSignals,
            matchingAccessibilitySignals,
            matchingSearchSignals,
            isOpenNow,
            visitedCount,
            isPreviouslyVisited,
            isUserFavourite,
            hasStrongSignal,
        };
    });

    const maxTag = Math.max(...enriched.map((item) => item.tagMatchRaw), 0);
    const maxMenu = Math.max(...enriched.map((item) => item.menuMatchRaw), 0);
    const maxAccessibility = Math.max(
        ...enriched.map((item) => item.accessibilityMatchRaw),
        0
    );
    const maxSearch = Math.max(...enriched.map((item) => item.searchMatchRaw), 0);
    const maxPopularity = Math.max(
        ...enriched.map((item) => item.popularityRaw),
        0
    );
    const maxAvailability = Math.max(
        ...enriched.map((item) => item.availabilityRaw),
        0
    );
    const maxLocation = Math.max(
        ...enriched.map((item) => item.locationMatchScore),
        0
    );
    const maxInteractionRestaurantBoost = Math.max(
        ...enriched.map((item) => item.interactionRestaurantBoost),
        0
    );

    const scored = enriched.map((item) => {
        const tagScore = normalise(item.tagMatchRaw, maxTag);
        const menuScore = normalise(item.menuMatchRaw, maxMenu);
        const accessibilityScore = normalise(
            item.accessibilityMatchRaw,
            maxAccessibility
        );
        const searchScore = normalise(item.searchMatchRaw, maxSearch);
        const popularityScore = normalise(item.popularityRaw, maxPopularity);
        const availabilityScore = normalise(
            item.availabilityRaw,
            maxAvailability
        );
        const locationScore = normalise(item.locationMatchScore, maxLocation);
        const interactionRestaurantScore = normalise(
            item.interactionRestaurantBoost,
            maxInteractionRestaurantBoost
        );

        const repeatPenalty = item.isPreviouslyVisited
            ? Math.max(0.72, 1 - item.visitedCount * 0.1)
            : 1;

        const discoveryBoost = !item.isPreviouslyVisited ? 0.04 : 0;
        const favouriteBoost = item.isUserFavourite ? 0.05 : 0;
        const strongSignalBoost = item.hasStrongSignal ? 0.08 : 0;
        const weakSignalPenalty =
            !coldStart &&
            !item.hasStrongSignal &&
            item.locationMatchScore <= 0 &&
            item.interactionRestaurantBoost <= 0
                ? 0.12
                : 0;

        const personalisedBaseScore = coldStart
            ? popularityScore * 0.5 +
            item.ratingNorm * 0.22 +
            availabilityScore * 0.18 +
            locationScore * 0.1
            : searchScore * 0.24 +
            menuScore * 0.22 +
            tagScore * 0.2 +
            accessibilityScore * 0.12 +
            interactionRestaurantScore * 0.08 +
            locationScore * 0.07 +
            popularityScore * 0.04 +
            availabilityScore * 0.03;

        const personalisedScore = coldStart
            ? personalisedBaseScore
            : personalisedBaseScore * repeatPenalty +
            discoveryBoost +
            favouriteBoost +
            strongSignalBoost -
            weakSignalPenalty;

        const popularScore =
            popularityScore * 0.62 +
            item.ratingNorm * 0.2 +
            availabilityScore * 0.18;

        return {
            ...item,
            personalisedScore,
            popularScore,
            reason: buildReason({
                coldStart,
                matchingTags: item.matchingTags,
                matchingMenuSignals: item.matchingMenuSignals,
                matchingAccessibilitySignals: item.matchingAccessibilitySignals,
                matchingSearchSignals: item.matchingSearchSignals,
                locationMatchScore: item.locationMatchScore,
                isOpenNow: item.isOpenNow,
                averageRating: item.averageRating,
                popularityRaw: item.popularityRaw,
                isPreviouslyVisited: item.isPreviouslyVisited,
            }),
        };
    });

    const strongPersonalisedCandidates = scored.filter(
        (item) =>
            coldStart ||
            item.searchMatchRaw > 0 ||
            item.menuMatchRaw > 0 ||
            item.tagMatchRaw > 0 ||
            item.accessibilityMatchRaw > 0 ||
            item.interactionRestaurantBoost > 0 ||
            item.isUserFavourite ||
            (item.locationMatchScore > 0 && item.isOpenNow)
    );

    const personalisedPool =
        strongPersonalisedCandidates.length > 0
            ? strongPersonalisedCandidates
            : scored;

    const personalised = [...personalisedPool]
        .sort((a, b) => b.personalisedScore - a.personalisedScore)
        .slice(0, 3)
        .map((item) =>
            formatRestaurantPayload(item.restaurant, {
                userId,
                reason: item.reason,
            })
        );

    const personalisedIds = new Set(personalised.map((item) => item.id));

    const popular = [...scored]
        .filter((item) => !personalisedIds.has(item.restaurant.id))
        .sort((a, b) => b.popularScore - a.popularScore)
        .slice(0, 3)
        .map((item) =>
            formatRestaurantPayload(item.restaurant, {
                userId,
                reason: item.isOpenNow
                    ? "Popular and open now"
                    : "Popular with other diners",
            })
        );

    return {
        personalised,
        popular,
        coldStart,
    };
}

module.exports = {
    scoreRecommendations,
};