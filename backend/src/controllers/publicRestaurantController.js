const {prisma} = require('../prismaClient');

async function listRestaurants(req, res) {
    try{
        const q = (req.query.q || "").trim().toLowerCase();
        const restaurants = await prisma.restaurant.findMany({
            where: {
                ...(q
                ? {
                        OR: [
                            {name: {contains: q, mode: "insensitive"}},
                            {location: {contains: q, mode: "insensitive"}},
                        ],
                    }
                    : {}),
            },
            select: {
                id: true,
                name: true,
                location: true,
                verified: true,
            },
            take: 200,
        });
        return res.json(restaurants);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

module.exports = {listRestaurants}