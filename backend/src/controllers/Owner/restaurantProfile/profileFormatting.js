function buildRestaurantImageResponse(image) {
    return {
        id: image.id,
        imageUrl: image.imageUrl,
        altText: image.altText,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
        createdAt: image.createdAt,
    };
}

module.exports = {
    buildRestaurantImageResponse,
};