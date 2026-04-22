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