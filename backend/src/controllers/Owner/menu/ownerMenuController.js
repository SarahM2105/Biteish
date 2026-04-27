const { prisma } = require("../../../prismaClient");
const {
    buildMenuItemResponse,
    buildMenuSectionResponse,
} = require("./menuFormatting");
const {
    parseMenuItemPrice,
    refreshEstimatedSpendIfAutomatic,
} = require("./menuPricing");
const {
    getOwnedRestaurant,
    getNextSectionSortOrder,
    getNextItemSortOrder,
    getValidTagIdsForMenuItems,
} = require("./menuQueries");

function normaliseTagIds(tagIds) {
    if (!Array.isArray(tagIds)) {
        return [];
    }

    return [
        ...new Set(
            tagIds
                .map((id) => String(id || "").trim())
                .filter(Boolean)
        ),
    ];
}

async function getOwnerMenu(req, res) {
    try {
        const restaurant = await prisma.restaurant.findFirst({
            where: { ownerId: req.user.userId },
            select: {
                id: true,
                name: true,
                menuSections: {
                    orderBy: { sortOrder: "asc" },
                    include: {
                        items: {
                            orderBy: { sortOrder: "asc" },
                            include: {
                                menuItemTags: {
                                    include: {
                                        tag: true,
                                    },
                                    orderBy: {
                                        createdAt: "asc",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        return res.status(200).json({
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            sections: restaurant.menuSections.map(buildMenuSectionResponse),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function createMenuSection(req, res) {
    try {
        const { name, description, isActive } = req.body;
        const trimmedName = String(name || "").trim();

        if (!trimmedName) {
            return res.status(400).json({ error: "Section name is required" });
        }

        const restaurant = await getOwnedRestaurant(req.user.userId);

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        const duplicate = await prisma.menuSection.findFirst({
            where: {
                restaurantId: restaurant.id,
                name: trimmedName,
            },
            select: { id: true },
        });

        if (duplicate) {
            return res.status(409).json({
                error: "A section with this name already exists",
            });
        }

        const section = await prisma.menuSection.create({
            data: {
                restaurantId: restaurant.id,
                name: trimmedName,
                description: description?.trim() || null,
                isActive: typeof isActive === "boolean" ? isActive : true,
                sortOrder: await getNextSectionSortOrder(restaurant.id),
            },
        });

        await refreshEstimatedSpendIfAutomatic(restaurant.id);

        return res.status(201).json(section);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function updateMenuSection(req, res) {
    try {
        const { sectionId } = req.params;
        const { name, description, isActive, sortOrder } = req.body;

        const section = await prisma.menuSection.findUnique({
            where: { id: sectionId },
            include: {
                restaurant: {
                    select: {
                        ownerId: true,
                        id: true,
                    },
                },
            },
        });

        if (!section) {
            return res.status(404).json({ error: "Section not found" });
        }

        if (section.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "Not your menu section" });
        }

        const nextName =
            typeof name === "string" ? name.trim() : section.name;

        if (!nextName) {
            return res.status(400).json({ error: "Section name is required" });
        }

        const duplicate = await prisma.menuSection.findFirst({
            where: {
                restaurantId: section.restaurant.id,
                name: nextName,
                NOT: { id: sectionId },
            },
            select: { id: true },
        });

        if (duplicate) {
            return res.status(409).json({
                error: "A section with this name already exists",
            });
        }

        const updated = await prisma.menuSection.update({
            where: { id: sectionId },
            data: {
                name: nextName,
                description:
                    description !== undefined
                        ? description?.trim() || null
                        : section.description,
                isActive:
                    typeof isActive === "boolean" ? isActive : section.isActive,
                sortOrder:
                    Number.isInteger(sortOrder) && sortOrder >= 0
                        ? sortOrder
                        : section.sortOrder,
            },
        });

        await refreshEstimatedSpendIfAutomatic(section.restaurant.id);

        return res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function deleteMenuSection(req, res) {
    try {
        const { sectionId } = req.params;

        const section = await prisma.menuSection.findUnique({
            where: { id: sectionId },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        ownerId: true,
                    },
                },
            },
        });

        if (!section) {
            return res.status(404).json({ error: "Section not found" });
        }

        if (section.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "Not your menu section" });
        }

        await prisma.menuSection.delete({
            where: { id: sectionId },
        });

        await refreshEstimatedSpendIfAutomatic(section.restaurant.id);

        return res.status(200).json({ message: "Section deleted" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function createMenuItem(req, res) {
    try {
        const {
            sectionId,
            name,
            description,
            price,
            dietaryInfo,
            isAvailable,
            tagIds,
        } = req.body;

        const trimmedName = String(name || "").trim();

        if (!sectionId) {
            return res.status(400).json({ error: "sectionId is required" });
        }

        if (!trimmedName) {
            return res.status(400).json({ error: "Item name is required" });
        }

        const parsedPrice = parseMenuItemPrice(price);

        if (parsedPrice === null) {
            return res.status(400).json({ error: "Valid price is required" });
        }

        const section = await prisma.menuSection.findUnique({
            where: { id: sectionId },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        ownerId: true,
                    },
                },
            },
        });

        if (!section) {
            return res.status(404).json({ error: "Section not found" });
        }

        if (section.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "Not your menu section" });
        }

        const normalisedTagIds = normaliseTagIds(tagIds);
        const validTagIds = await getValidTagIdsForMenuItems(normalisedTagIds);

        const item = await prisma.menuItem.create({
            data: {
                restaurantId: section.restaurant.id,
                sectionId: section.id,
                name: trimmedName,
                description: description?.trim() || null,
                price: parsedPrice,
                dietaryInfo: dietaryInfo?.trim() || null,
                isAvailable:
                    typeof isAvailable === "boolean" ? isAvailable : true,
                sortOrder: await getNextItemSortOrder(section.id),
                menuItemTags: {
                    create: validTagIds.map((tagId) => ({
                        tagId,
                    })),
                },
            },
            include: {
                menuItemTags: {
                    include: {
                        tag: true,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });

        await refreshEstimatedSpendIfAutomatic(section.restaurant.id);

        return res.status(201).json(buildMenuItemResponse(item));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function updateMenuItem(req, res) {
    try {
        const { itemId } = req.params;
        const {
            sectionId,
            name,
            description,
            price,
            dietaryInfo,
            isAvailable,
            sortOrder,
            tagIds,
        } = req.body;

        const item = await prisma.menuItem.findUnique({
            where: { id: itemId },
            select: {
                id: true,
                restaurantId: true,
                sectionId: true,
                name: true,
                description: true,
                price: true,
                dietaryInfo: true,
                isAvailable: true,
                sortOrder: true,
                menuItemTags: {
                    select: {
                        tagId: true,
                    },
                },
                restaurant: {
                    select: {
                        id: true,
                        ownerId: true,
                    },
                },
            },
        });

        if (!item) {
            return res.status(404).json({ error: "Menu item not found" });
        }

        if (item.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "Not your menu item" });
        }

        let targetSectionId = item.sectionId;

        if (sectionId && sectionId !== item.sectionId) {
            const targetSection = await prisma.menuSection.findUnique({
                where: { id: sectionId },
                select: {
                    id: true,
                    restaurant: {
                        select: {
                            id: true,
                            ownerId: true,
                        },
                    },
                },
            });

            if (!targetSection) {
                return res.status(404).json({ error: "Target section not found" });
            }

            if (
                targetSection.restaurant.ownerId !== req.user.userId ||
                targetSection.restaurant.id !== item.restaurant.id
            ) {
                return res.status(403).json({
                    error: "Target section does not belong to your restaurant",
                });
            }

            targetSectionId = targetSection.id;
        }

        const nextName =
            typeof name === "string" ? name.trim() : item.name;

        if (!nextName) {
            return res.status(400).json({ error: "Item name is required" });
        }

        const shouldUpdateTags = tagIds !== undefined;
        const normalisedTagIds = shouldUpdateTags ? normaliseTagIds(tagIds) : [];
        const validTagIds = shouldUpdateTags
            ? await getValidTagIdsForMenuItems(normalisedTagIds)
            : [];

        let nextPrice = item.price;

        if (price !== undefined) {
            const parsedPrice = parseMenuItemPrice(price);

            if (parsedPrice === null) {
                return res.status(400).json({ error: "Valid price is required" });
            }

            nextPrice = parsedPrice;
        }

        const nextSortOrder =
            Number.isInteger(sortOrder) && sortOrder >= 0
                ? sortOrder
                : targetSectionId !== item.sectionId
                    ? await getNextItemSortOrder(targetSectionId)
                    : item.sortOrder;

        const updated = await prisma.menuItem.update({
            where: { id: itemId },
            data: {
                sectionId: targetSectionId,
                name: nextName,
                description:
                    description !== undefined
                        ? description?.trim() || null
                        : item.description,
                price: nextPrice,
                dietaryInfo:
                    dietaryInfo !== undefined
                        ? dietaryInfo?.trim() || null
                        : item.dietaryInfo,
                isAvailable:
                    typeof isAvailable === "boolean"
                        ? isAvailable
                        : item.isAvailable,
                sortOrder: nextSortOrder,
                ...(shouldUpdateTags
                    ? {
                        menuItemTags: {
                            deleteMany: {},
                            create: validTagIds.map((tagId) => ({
                                tagId,
                            })),
                        },
                    }
                    : {}),
            },
            include: {
                menuItemTags: {
                    include: {
                        tag: true,
                    },
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });

        await refreshEstimatedSpendIfAutomatic(item.restaurant.id);

        return res.status(200).json(buildMenuItemResponse(updated));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function deleteMenuItem(req, res) {
    try {
        const { itemId } = req.params;

        const item = await prisma.menuItem.findUnique({
            where: { id: itemId },
            select: {
                id: true,
                restaurant: {
                    select: {
                        id: true,
                        ownerId: true,
                    },
                },
            },
        });

        if (!item) {
            return res.status(404).json({ error: "Menu item not found" });
        }

        if (item.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "Not your menu item" });
        }

        await prisma.menuItem.delete({
            where: { id: itemId },
        });

        await refreshEstimatedSpendIfAutomatic(item.restaurant.id);

        return res.status(200).json({ message: "Menu item deleted" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getOwnerMenu,
    createMenuSection,
    updateMenuSection,
    deleteMenuSection,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
};