const { prisma } = require("../prismaClient");

async function createTable(req, res) {
    try {
        const { zoneId } = req.params;
        const { name, capacity, reservable, active } = req.body;

        if (!capacity || capacity < 1) {
            return res.status(400).json({ error: "capacity must be >= 1" });
        }
        if (!name || typeof name !== "string"){
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

        const table = await prisma.table.create({
            data: {
                zoneId,
                restaurantId: zone.restaurantId,
                name,
                capacity,
                reservable: typeof reservable === "boolean" ? reservable : true,
                active: typeof active === "boolean" ? active : true,
            },
        });

        return res.status(201).json(table);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: error.message,
            code: error.code,
            meta: error.meta,
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

        const tables = await prisma.table.findMany({ where: { zoneId } });
        return res.json(tables);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "server error" });
    }
}

async function updateTable(req, res) {
    try {
        const { tableId } = req.params;
        const { name, capacity, reservable, active } = req.body;

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

        const updated = await prisma.table.update({
            where: { id: tableId },
            data: {
                name: name?? table.name,
                capacity: capacity ?? table.capacity,
                reservable: typeof reservable === "boolean" ? reservable : table.reservable,
                active: typeof active === "boolean" ? active : table.active,
            },
        });

        return res.json(updated);
    } catch (error) {
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
        return res.json({ message: "table deleted" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "server error" });
    }
}

module.exports = { createTable, listTablesByZone, updateTable, deleteTable };
