const {prisma} = require('../prismaClient');
async function upsertOpeningHours(req, res) {
    try{
        const {restaurantId} = req.params;
        const ownerId = req.params.userId;
        const {day, opensAt, closesAt } = req.body;

        const restaurant = await prisma.restaurant.findUnique({where: {id: restaurantId} });
        if (!restaurant || restaurant.ownerId !== ownerId) {
            return res.status(403).json({ error: "you dont own this restaurant"});
        }
        const updated = await prisma.openingHour.upsert({
            where: {
                restaurantId_day: {
                    restaurantId,
                    day
                }
            },
            update: { opensAt, closesAt },
            create: {
                restaurantId,
                day,
                opensAt,
                closesAt
            }
        });
        return res.status(200).json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

async function listOpeningHours(req, res) {
    try{
        const {restaurantId} = req.params;
        const ownerId = req.user.userId;
        const restaurant = await prisma.restaurant.findUnique({
            where: {id: restaurantId},
            include: {openingHours: true}
        });
        if (!restaurant || restaurant.ownerId !== ownerId) {
            return res.status(403).json({ error: "you dont own this restaurant"});
        }
        return res.status(200).json(restaurant.openingHours);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

module.exports = {upsertOpeningHours, listOpeningHours};