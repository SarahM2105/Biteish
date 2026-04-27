function formatPrice(value) {
    if (value == null) return null;
    if (typeof value?.toString === "function") {
        return value.toString();
    }
    return String(value);
}

function buildMenuItemResponse(item) {
    return {
        ...item,
        price: formatPrice(item.price),
        tags: (item.menuItemTags || []).map((entry) => ({
            id: entry.tag?.id || entry.tagId,
            name: entry.tag?.name || null,
            categoryId: entry.tag?.categoryId || null,
        })),
    };
}

function buildMenuSectionResponse(section) {
    return {
        ...section,
        items: (section.items || []).map(buildMenuItemResponse),
    };
}

module.exports = {
    buildMenuItemResponse,
    buildMenuSectionResponse,
};