function getTableName(value) {
    return String(value || "").trim();
}

function getTableCapacity(value) {
    const numericCapacity = Number(value);

    if (!Number.isInteger(numericCapacity) || numericCapacity < 1) {
        return null;
    }

    return numericCapacity;
}

function getTableDuplicateError() {
    return {
        error: "A table with this name already exists in your restaurant.",
    };
}

function getInvalidTagError(categoryName) {
    return {
        error: `Only valid tags from the "${categoryName}" category can be assigned to a table.`,
    };
}

module.exports = {
    getTableName,
    getTableCapacity,
    getTableDuplicateError,
    getInvalidTagError,
};