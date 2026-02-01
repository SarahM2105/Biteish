const { prisma } = require("../prismaClient");
async function createRestaurant(req, res) {
    try {
        const {name, location} = req.body;
        if (!name || !location) {
            return res.status(400).json({error:"name and location is required"});
        }
        const ownerId = req.user.userId
        const existingRestaurant = await prisma.restaurant.findFirst({
            where: {
                name,
                location,
            },
        });
        if (existingRestaurant) {
            return res.status(409).json({error: 'restaurant already created with this name and address',
            });
        }
        const restaurant = await prisma.restaurant.create({
            data: {
                ownerId: req.user.userId,
                name,
                location,
                verified: false,
            },
        });
        return res.status(201).json(restaurant);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

async function listMyRestaurants(req, res) {
    try {
        const restaurants = await prisma.restaurant.findMany({
            where: {ownerId: req.user.userId},
            orderBy: {name: "asc"},
        });
        return res.json(restaurants);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}
async function updateRestaurant(req, res) {
    try{
        const { restaurantId } = req.params;
        const {name, location, verified} = req.body;

        const restaurant = await prisma.restaurant.findUnique({
            where: {id: restaurantId}
        });
        if (!restaurant) {
            return res.status(404).send({error: 'No restaurant found with this id'});
        }
        if (restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({error:"not your restaurant"});
        }
        const updated = await prisma.restaurant.update({
            where: {id: restaurantId},
            data: {
                name: name ?? restaurant.name,
                location: location ?? restaurant.location,
                verified: typeof verified === "boolean" ? verified : restaurant.verified,
            },
        });
        return res.json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

async function deleteRestaurant(req, res) {
    try{
        const { restaurantId } = req.params;
        const restaurant = await prisma.restaurant.findUnique({
            where: {id: restaurantId},
        });
        if (!restaurant) {
            return res.status(404).send({error: "No restaurant found with this id"});
        }
        if(restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({error:"not your restaurant"});
        }
        await prisma.restaurant.delete({
            where: {id: restaurantId},
        });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({message: "Server error"});
    }
}

module.exports = {createRestaurant, listMyRestaurants, updateRestaurant, deleteRestaurant};