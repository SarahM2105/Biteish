const { prisma } = require("../../../prismaClient");

function normalizeTagIds(tagIds) {
    if (!Array.isArray(tagIds)) return [];

    return [
        ...new Set(
            tagIds
                .map((id) => String(id || "").trim())
                .filter(Boolean)
        ),
    ];
}

async function getValidatedTags(tagIds) {
    const ids = normalizeTagIds(tagIds);

    if (!ids.length) {
        return [];
    }

    const tags = await prisma.tag.findMany({
        where: {
            id: { in: ids },
        },
        select: {
            id: true,
            name: true,
        },
    });

    if (tags.length !== ids.length) {
        throw new Error("INVALID_TAGS");
    }

    return tags;
}

async function syncRestaurantTagsFromTables(restaurantId) {
    const tableTagLinks = await prisma.tableTag.findMany({
        where: {
            table: {
                restaurantId,
            },
        },
        select: {
            tagId: true,
        },
    });

    const tagIdsFromTables = [...new Set(tableTagLinks.map((item) => item.tagId))];

    if (!tagIdsFromTables.length) {
        return;
    }

    const existingRestaurantTags = await prisma.restaurantTag.findMany({
        where: {
            restaurantId,
            tagId: {
                in: tagIdsFromTables,
            },
        },
        select: {
            tagId: true,
        },
    });

    const existingTagIdSet = new Set(existingRestaurantTags.map((item) => item.tagId));

    const tagIdsToAdd = tagIdsFromTables.filter((tagId) => !existingTagIdSet.has(tagId));

    if (tagIdsToAdd.length > 0) {
        await prisma.restaurantTag.createMany({
            data: tagIdsToAdd.map((tagId) => ({
                restaurantId,
                tagId,
            })),
            skipDuplicates: true,
        });
    }
}

module.exports = {
    getValidatedTags,
    syncRestaurantTagsFromTables,
};