const { humaniseSignal } = require("./recommendationHelpers");

function buildReason({
                         coldStart,
                         matchingTags,
                         matchingMenuSignals,
                         matchingAccessibilitySignals,
                         matchingSearchSignals,
                         locationMatchScore,
                         isOpenNow,
                         averageRating,
                         popularityRaw,
                         isPreviouslyVisited,
                     }) {
    if (coldStart) {
        if (isOpenNow && popularityRaw > 0) {
            return "Popular and open right now";
        }

        if (averageRating >= 4) {
            return "Strong ratings from other diners";
        }

        return "A good place to start exploring";
    }

    if (matchingSearchSignals.length > 0) {
        return `Because you searched for ${matchingSearchSignals
            .slice(0, 2)
            .map(humaniseSignal)
            .join(" and ")}`;
    }

    if (matchingMenuSignals.length > 0) {
        return `You often choose ${matchingMenuSignals
            .slice(0, 2)
            .map(humaniseSignal)
            .join(" and ")}`;
    }

    if (matchingAccessibilitySignals.length > 0) {
        return `Matches your preferences like ${matchingAccessibilitySignals
            .slice(0, 2)
            .map(humaniseSignal)
            .join(" and ")}`;
    }

    if (matchingTags.length > 0) {
        return `Similar to places you like (${matchingTags.slice(0, 2).join(" and ")})`;
    }

    if (locationMatchScore > 0 && isOpenNow) {
        return "Similar to places you've booked and open now";
    }

    if (locationMatchScore > 0) {
        return "Near places you've booked before";
    }

    if (isPreviouslyVisited) {
        return "You've been here before";
    }

    if (isOpenNow) {
        return "Open now";
    }

    return "Recommended for you";
}

function formatRestaurantPayload(restaurant, extras = {}) {
    const reviewCount = restaurant.reviews.length;
    const averageRating =
        reviewCount > 0
            ? restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
            : 0;

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
        imageUrl: restaurant.images[0]?.imageUrl || null,
        imageAltText: restaurant.images[0]?.altText || null,
        tags: restaurant.tags.map((item) => item.tag.name),
        accessibilityOptions: restaurant.accessibility.map(
            (item) => item.option.optionName
        ),
        averageRating: Number(averageRating.toFixed(1)),
        reviewCount,
        isFavourite: restaurant.favorites.some((item) => item.userId === extras.userId),
        recommendationReason: extras.reason || null,
    };
}

module.exports = {
    buildReason,
    formatRestaurantPayload,
};