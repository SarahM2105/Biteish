const { prisma } = require("../../../prismaClient");

async function getMenuItemTags(req, res) {
    try {
        const tags = await prisma.tag.findMany({
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return res.status(200).json(tags);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getMenuItemTags,
};