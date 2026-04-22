function buildTableResponse(table) {
    return {
        id: table.id,
        zoneId: table.zoneId,
        restaurantId: table.restaurantId,
        name: table.name,
        capacity: table.capacity,
        reservable: table.reservable,
        active: table.active,
        tags: Array.isArray(table.tableTags)
            ? table.tableTags
                .map((item) => item.tag)
                .filter(Boolean)
                .map((tag) => ({
                    id: tag.id,
                    name: tag.name,
                }))
            : [],
    };
}

module.exports = {
    buildTableResponse,
};