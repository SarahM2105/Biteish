const {prisma} = require("../prismaClient");
async function createZone(req, res) {
    try {
        const {restaurantId} = req.params;
        const {name,description} = req.body;
        if (!name) {
            return res.status(400).json({error: 'name is required'});
        }
        const restaurant = await prisma.restaurant.findUnique({where: {id: restaurantId}});
        if (!restaurant) {
            return res.status(404).json({error: 'No restaurant found with this id'});
        }
        if (restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({error:"not your restaurant"});
        }
        const zone = await prisma.zone.create({
            data: {restaurantId, name, description: description ?? null},
        });
        return res.status(201).json(zone);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"server error"});
    }
}

async function listZones(req, res) {
    try {
        const { restaurantId } = req.params;
        const restaurant = await prisma.restaurant.findUnique({where: {id: restaurantId}});
        if (!restaurant) {
            return res.status(404).json({error: 'No restaurant found with this id'});
        }
        if (restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({error:"not your restaurant"});
        }
        const zones = await prisma.zone.findMany({
            where: {restaurantId},
        });
        return res.json(zones);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"server error"});
    }
}

async function updateZone(req, res) {
    try{
        const { zoneId} = req.params;
        const {name, description} = req.body;

        const zone = await prisma.zone.findUnique({where: {id: zoneId}, include: {restaurant: true}});
        if (!zone) {
            return res.status(404).json({error: 'No zone found with this id'});
        }
        if (zone.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({error:"not your zone"});
        }
        const updated = await prisma.zone.update({
            where: {id: zoneId},
            data: {
                name: name ?? zone.name,
                description: description ?? zone.description,
            },
        });
        return res.json(updated);
    } catch (error){
        console.error(error);
        return res.status(500).json({error:"server error"});
    }
}

async function deleteZone(req, res) {
    try {
        const { zoneId } = req.params;

        const zone = await prisma.zone.findUnique({where: {id: zoneId}, include: {restaurant: true}});
        if(!zone) {
            return res.status(404).json({error: 'zone not found with id'});
        }
        if(zone.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({error:"not your zone"});
        }
        await prisma.zone.delete({where: {id: zoneId}});
        return res.json({message: "zone deleted"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:"server error"});
    }
}

module.exports = { createZone, listZones, updateZone, deleteZone };