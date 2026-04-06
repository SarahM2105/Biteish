const {prisma} = require("../prismaClient");
const {getRestaurantOccupancy} = require("../utils/occupancy");

async function getOwnerOccupancy(req, res) {
    try{
        const ownerId = req.user.userId;
        const restaurant = await prisma.restaurant.findFirst({
            where: {ownerId},
            select: {
                id: true,
                name: true,
            },
        });
        if (!restaurant){
            return res.status(404).json({error: 'No restaurant with this id'});
        }
        const occupancy = await getRestaurantOccupancy(restaurant.id);
        return res.status(200).json({
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            ...occupancy,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Server error"});
    }
}

module.exports = {  getOwnerOccupancy };