const { prisma } = require("../prismaClient");
async function setBookingRule(req, res) {
    try {
        const { restaurantId } = req.params;
        const ownerId = req.user.userId;
        const {
            maxPartySize,
            daysAhead,
            slotMinutes,
            turnoverMinutes,
            cancellationCutoffMinutes,
            graceMinutes,
        } = req.body;

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: { bookingRule: true },
        });

        if (!restaurant || restaurant.ownerId !== ownerId) {
            return res.status(403).send({ error: "you dont own this restaurant" });
        }

        if (!restaurant.bookingRule) {
            if (
                [
                    maxPartySize,
                    daysAhead,
                    slotMinutes,
                    turnoverMinutes,
                    cancellationCutoffMinutes,
                    graceMinutes,
                ].some((val) => val == null)
            ) {
                return res.status(400).send({
                    error: "all fields required for first time setup",
                });
            }

            const rule = await prisma.bookingRule.create({
                data: {
                    restaurantId,
                    maxPartySize,
                    daysAhead,
                    slotMinutes,
                    turnoverMinutes,
                    cancellationCutoffMinutes,
                    graceMinutes,
                },
            });

            return res.status(201).json({ message: "rule created", rule });
        } else {
            const rule = await prisma.bookingRule.update({
                where: { restaurantId },
                data: {
                    maxPartySize:
                        maxPartySize ?? restaurant.bookingRule.maxPartySize,
                    daysAhead: daysAhead ?? restaurant.bookingRule.daysAhead,
                    slotMinutes:
                        slotMinutes ?? restaurant.bookingRule.slotMinutes,
                    turnoverMinutes:
                        turnoverMinutes ?? restaurant.bookingRule.turnoverMinutes,
                    cancellationCutoffMinutes:
                        cancellationCutoffMinutes ??
                        restaurant.bookingRule.cancellationCutoffMinutes,
                    graceMinutes:
                        graceMinutes ?? restaurant.bookingRule.graceMinutes,
                },
            });

            return res.status(200).json({ message: "rule updated", rule });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "server error" });
    }
}

async function getBookingRule(req, res) {
    try {
        const ownerId = req.user.userId;
        const { restaurantId } = req.params;

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            include: { bookingRule: true },
        });

        if (!restaurant || restaurant.ownerId !== ownerId) {
            return res.status(403).send({ error: "you dont own this restaurant" });
        }

        if (!restaurant.bookingRule) {
            return res
                .status(404)
                .json({ error: "no booking rule set for this restaurant" });
        }

        return res.status(200).json({
            message: "booking rules available",
            bookingRule: restaurant.bookingRule,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "server error" });
    }
}

module.exports = { setBookingRule, getBookingRule };