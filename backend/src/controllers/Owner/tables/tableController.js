const { prisma } = require("../../../prismaClient");
const { buildTableResponse } = require("./formatting");
const {
    getValidatedTags,
    syncRestaurantTagsFromTables,
} = require("./tagHelpers");
const {
    getTableName,
    getTableCapacity,
    getTableDuplicateError,
} = require("./validation");

async function listTableFeatureTags(req, res) {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { name: "asc" },
            select: {
                id: true,
                name: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return res.json({
            categoryName: null,
            tags: tags.map((tag) => ({
                id: tag.id,
                name: tag.name,
                categoryId: tag.category?.id || null,
                categoryName: tag.category?.name || null,
            })),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "server error" });
    }
}

async function createTable(req, res) {
    try {
        const { zoneId } = req.params;
        const { name, capacity, reservable, active, tagIds } = req.body;

        const trimmedName = getTableName(name);
        const numericCapacity = getTableCapacity(capacity);

        if (numericCapacity === null) {
            return res.status(400).json({ error: "capacity must be >= 1" });
        }

        if (!trimmedName) {
            return res.status(400).json({ error: "name required" });
        }

        const zone = await prisma.zone.findUnique({
            where: { id: zoneId },
            include: { restaurant: true },
        });

        if (!zone) {
            return res.status(404).json({ error: "zone not found" });
        }

        if (zone.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "not your zone to add a table" });
        }

        const existingTable = await prisma.table.findFirst({
            where: {
                restaurantId: zone.restaurantId,
                name: trimmedName,
            },
            select: { id: true },
        });

        if (existingTable) {
            return res.status(409).json(getTableDuplicateError());
        }

        let validatedTags = [];

        if (tagIds !== undefined) {
            try {
                validatedTags = await getValidatedTags(tagIds);
            } catch (error) {
                if (error.message === "INVALID_TAGS") {
                    return res.status(400).json({
                        error: "One or more selected tags are invalid.",
                    });
                }
                throw error;
            }
        }

        const table = await prisma.table.create({
            data: {
                zoneId,
                restaurantId: zone.restaurantId,
                name: trimmedName,
                capacity: numericCapacity,
                reservable: typeof reservable === "boolean" ? reservable : true,
                active: typeof active === "boolean" ? active : true,
                ...(validatedTags.length > 0
                    ? {
                        tableTags: {
                            create: validatedTags.map((tag) => ({
                                tagId: tag.id,
                            })),
                        },
                    }
                    : {}),
            },
            include: {
                tableTags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        await syncRestaurantTagsFromTables(zone.restaurantId);

        return res.status(201).json(buildTableResponse(table));
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json(getTableDuplicateError());
        }

        console.error(error);
        return res.status(500).json({
            error: "server error",
        });
    }
}

async function listTablesByZone(req, res) {
    try {
        const { zoneId } = req.params;

        const zone = await prisma.zone.findUnique({
            where: { id: zoneId },
            include: { restaurant: true },
        });

        if (!zone) {
            return res.status(404).json({ error: "zone not found" });
        }

        if (zone.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "not your zone" });
        }

        const tables = await prisma.table.findMany({
            where: { zoneId },
            include: {
                tableTags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: [{ capacity: "asc" }, { name: "asc" }],
        });

        return res.json(tables.map(buildTableResponse));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "server error" });
    }
}

async function updateTable(req, res) {
    try {
        const { tableId } = req.params;
        const { name, capacity, reservable, active, tagIds } = req.body;

        const table = await prisma.table.findUnique({
            where: { id: tableId },
            include: {
                restaurant: true,
                tableTags: true,
            },
        });

        if (!table) {
            return res.status(404).json({ error: "No table found with this id" });
        }

        if (table.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "not your table" });
        }

        const nextName = typeof name === "string" ? name.trim() : table.name;

        if (!nextName) {
            return res.status(400).json({ error: "name required" });
        }

        let nextCapacity = table.capacity;

        if (capacity !== undefined) {
            const numericCapacity = getTableCapacity(capacity);

            if (numericCapacity === null) {
                return res.status(400).json({ error: "capacity must be >= 1" });
            }

            nextCapacity = numericCapacity;
        }

        const duplicateTable = await prisma.table.findFirst({
            where: {
                restaurantId: table.restaurantId,
                name: nextName,
                NOT: { id: tableId },
            },
            select: { id: true },
        });

        if (duplicateTable) {
            return res.status(409).json(getTableDuplicateError());
        }

        let validatedTags = null;

        if (tagIds !== undefined) {
            try {
                validatedTags = await getValidatedTags(tagIds);
            } catch (error) {
                if (error.message === "INVALID_TAGS") {
                    return res.status(400).json({
                        error: "One or more selected tags are invalid.",
                    });
                }
                throw error;
            }
        }

        const updated = await prisma.table.update({
            where: { id: tableId },
            data: {
                name: nextName,
                capacity: nextCapacity,
                reservable:
                    typeof reservable === "boolean" ? reservable : table.reservable,
                active: typeof active === "boolean" ? active : table.active,
                ...(validatedTags !== null
                    ? {
                        tableTags: {
                            deleteMany: {},
                            ...(validatedTags.length > 0
                                ? {
                                    create: validatedTags.map((tag) => ({
                                        tagId: tag.id,
                                    })),
                                }
                                : {}),
                        },
                    }
                    : {}),
            },
            include: {
                tableTags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        await syncRestaurantTagsFromTables(table.restaurantId);

        return res.json(buildTableResponse(updated));
    } catch (error) {
        if (error.code === "P2002") {
            return res.status(409).json(getTableDuplicateError());
        }

        console.error(error);
        return res.status(500).json({ error: "server error" });
    }
}

async function deleteTable(req, res) {
    try {
        const { tableId } = req.params;

        const table = await prisma.table.findUnique({
            where: { id: tableId },
            include: { restaurant: true },
        });

        if (!table) {
            return res.status(404).json({ error: "No table found with this id" });
        }

        if (table.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "not your table" });
        }

        await prisma.table.delete({ where: { id: tableId } });

        await syncRestaurantTagsFromTables(table.restaurantId);

        return res.json({ message: "table deleted" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "server error" });
    }
}

module.exports = {
    createTable,
    listTablesByZone,
    updateTable,
    deleteTable,
    listTableFeatureTags,
};