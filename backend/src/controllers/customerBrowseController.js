const { prisma } = require("../prismaClient");

async function listZonesForRestaurant(req, res) {
    try {
        const { restaurantId } = req.params;

        const zones = await prisma.zone.findMany({
            where: { restaurantId },
            select: {
                id: true,
                name: true,
            },
            orderBy: { name: "asc" },
        });

        return res.json(zones);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function listTablesForZone(req, res) {
    try {
        const { zoneId } = req.params;

        const tables = await prisma.table.findMany({
            where: {
                zoneId,
                active: true,
                reservable: true,
            },
            select: {
                id: true,
                name: true,
                capacity: true,
            },
            orderBy: { name: "asc" },
        });

        return res.json(tables);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    listZonesForRestaurant,
    listTablesForZone,
};