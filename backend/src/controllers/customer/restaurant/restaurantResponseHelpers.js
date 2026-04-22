const PRICE_FALLBACK = null;

function formatPrice(value) {
    if (value == null) return PRICE_FALLBACK;
    if (typeof value?.toString === "function") {
        return value.toString();
    }
    return String(value);
}

function buildMenuItem(item) {
    return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: formatPrice(item.price),
        dietaryInfo: item.dietaryInfo,
        isAvailable: item.isAvailable,
        sortOrder: item.sortOrder,
    };
}

function buildMenuSection(section) {
    return {
        id: section.id,
        name: section.name,
        description: section.description,
        isActive: section.isActive,
        sortOrder: section.sortOrder,
        items: (section.items || []).map(buildMenuItem),
    };
}

function buildTableResponse(table) {
    return {
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        tags: (table.tableTags || []).map((item) => ({
            id: item.tag.id,
            name: item.tag.name,
        })),
    };
}

function buildRestaurantImage(image) {
    return {
        id: image.id,
        imageUrl: image.imageUrl,
        altText: image.altText,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
        createdAt: image.createdAt,
    };
}

function buildReviewResponse(review) {
    return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        verifiedVisit: review.verifiedVisit,
        createdAt: review.createdAt,
        userName: review.user?.name || "Anonymous",
        images: (review.images || []).map((image) => ({
            id: image.id,
            imageUrl: image.imageUrl,
        })),
    };
}

function buildRestaurantDetailsResponse(restaurant) {
    const averageRating =
        restaurant.reviews.length > 0
            ? restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) /
            restaurant.reviews.length
            : 0;

    const images = (restaurant.images || []).map(buildRestaurantImage);
    const primaryImage =
        images.find((image) => image.isPrimary) || images[0] || null;

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
        primaryImageUrl: primaryImage?.imageUrl || null,
        images,
        bookingRule: restaurant.bookingRule,
        openingHours: restaurant.openingHours,
        accessibilityOptions: restaurant.accessibility.map((item) => ({
            id: item.option.id,
            name: item.option.optionName,
            description: item.option.description,
            icon: item.option.icon,
        })),
        tags: restaurant.tags.map((item) => ({
            id: item.tag.id,
            name: item.tag.name,
        })),
        menuSections: (restaurant.menuSections || []).map(buildMenuSection),
        reviews: (restaurant.reviews || []).map(buildReviewResponse),
        averageRating: Number(averageRating.toFixed(1)),
        reviewCount: restaurant.reviews.length,
    };
}

module.exports = {
    buildTableResponse,
    buildReviewResponse,
    buildRestaurantDetailsResponse,
};