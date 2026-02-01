 const {prisma} = require("../prismaClient");

async function addUnavailability(req, res) {
    try{
        const {tableId} = req.params;
        const {startsAt, endsAt, reason} = req.body;
        console.log("params:",req.params)


        if (!startsAt || !endsAt || !reason) {
            return res.status(400).json({error: "startsAt, endsAt, reason required"});
        }
        console.log("table id", tableId);
        const table = await prisma.table.findUnique({
            where: {id: tableId},
            include: { restaurant: true },
        });
        if (!table) {
            return res.status(404).json({error: "no table found with this id"});
        }
        if(table.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({error:"not your table"});
        }
        const block = await prisma.tableUnavailability.create({
            data: {
                tableId,
                startsAt: new Date(startsAt),
                endsAt: new Date(endsAt),
                reason,
            },
        });
        return res.status(201).json(block);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

async function listUnavailability(req, res) {
    try{
        const {tableId} = req.params;
        const table = await prisma.table.findUnique({
            where: {id: tableId},
            include: { restaurant: true },
        });
        console.log("table id", tableId);
        if (!table) {
            return res.status(404).send({error: 'No table found with this id'});
        }
        if (table.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({error:"not your restaurants table"});
        }

        const blocks = await prisma.tableUnavailability.findMany({
            where: {tableId},
            orderBy: {startsAt: "asc"},
        });
        return res.json(blocks);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

async function updateUnavailability(req, res) {
    try{
        const {unavailabilityId} = req.params;
        const { startsAt, endsAt, reason } = req.body;

        if (!startsAt || !endsAt) {
            return res.status(400).json({error: "startsAt, endsAt required"});
        }

        const existing = await prisma.tableUnavailability.findUnique({
            where: {id: unavailabilityId},
            include: {
                table: {
                    include: {
                        restaurant: true,
                    },
                },
            },
        });
        if (!existing) {
            return res.status(404).json({error: "no unavailability found with this id"});
        }
        if (existing.table.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({error:"not your table"});
        }
        const updated = await prisma.tableUnavailability.update({
            where: {id: unavailabilityId},
            data: {
                startsAt: new Date(startsAt),
                endsAt: new Date(endsAt),
                reason: reason || undefined,
            },
        });
        return res.status(201).json(updated);
    } catch (error){
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

async function deleteUnavailability(req, res) {
    try{
        const {unavailabilityId} = req.params;
        const block = await prisma.tableUnavailability.findUnique({
            where: {id: unavailabilityId},
            include: {
                table: {include: {restaurant: true}}
            },
            });
        if (!block) {
            return res.status(404).send({error: 'No unavailability found with this id'});
        }
        if (block.table.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({error:"not your restaurants table"});
        }
        await prisma.tableUnavailability.delete({where: {id: unavailabilityId}});
        return res.json({ message: "unavailability deleted"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

module.exports = { addUnavailability, updateUnavailability,  listUnavailability , deleteUnavailability };