const { prisma } = require("../../prismaClient");

async function getSearchFilterOptions(req, res) {
    try {
        const accessibilityOptions = await prisma.accessibilityOption.findMany({
            orderBy: { optionName: "asc" },
            select: {
                id: true,
                optionName: true,
                icon: true,
                description: true,
            },
        });

        const tagCategories = await prisma.tagCategory.findMany({
            orderBy: { name: "asc" },
            include: {
                tags: {
                    orderBy: { name: "asc" },
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        const restaurants = await prisma.restaurant.findMany({
            where: {
                verified: true,
            },
            select: {
                location: true,
            },
            distinct: ["location"],
            orderBy: {
                location: "asc",
            },
        });

        const locations = restaurants
            .map((r) => r.location)
            .filter(Boolean);

        return res.status(200).json({
            accessibilityOptions,
            tagCategories,
            locations,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to load search filter options" });
    }
}

module.exports = {
    getSearchFilterOptions,
};