const { prisma } = require("../prismaClient");

async function getOwnerRestaurantProfile(req, res) {
    try {
        const ownerId = req.user.userId;

        const restaurant = await prisma.restaurant.findFirst({
            where: { ownerId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                bookingRule: true,
                openingHours: {
                    orderBy: { day: "asc" },
                },
                accessibility: {
                    include: {
                        option: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        if (!restaurant) {
            return res.status(404).json({ error: "No restaurant found" });
        }

        return res.status(200).json(restaurant);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function updateOwnerRestaurantProfile(req, res) {
    try {
        const ownerId = req.user.userId;
        const {
            name,
            location,
            description,
            bookingRule,
            openingHours,
        } = req.body;

        const restaurant = await prisma.restaurant.findFirst({
            where: { ownerId },
            select: {
                id: true,
                bookingRule: true,
            },
        });

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        const updateData = {
            name: name ?? undefined,
            location: location ?? undefined,
            description: description ?? undefined,
        };

        if (bookingRule) {
            const bookingRuleData = {
                maxPartySize:
                    bookingRule.maxPartySize !== undefined
                        ? Number(bookingRule.maxPartySize)
                        : undefined,
                daysAhead:
                    bookingRule.daysAhead !== undefined
                        ? Number(bookingRule.daysAhead)
                        : undefined,
                slotMinutes:
                    bookingRule.slotMinutes !== undefined
                        ? Number(bookingRule.slotMinutes)
                        : undefined,
                turnoverMinutes:
                    bookingRule.turnoverMinutes !== undefined
                        ? Number(bookingRule.turnoverMinutes)
                        : undefined,
                cancellationCutoffMinutes:
                    bookingRule.cancellationCutoffMinutes !== undefined
                        ? Number(bookingRule.cancellationCutoffMinutes)
                        : undefined,
                graceMinutes:
                    bookingRule.graceMinutes !== undefined
                        ? Number(bookingRule.graceMinutes)
                        : undefined,
            };

            if (restaurant.bookingRule) {
                updateData.bookingRule = {
                    update: bookingRuleData,
                };
            } else {
                updateData.bookingRule = {
                    create: {
                        maxPartySize: bookingRuleData.maxPartySize ?? 6,
                        daysAhead: bookingRuleData.daysAhead ?? 30,
                        slotMinutes: bookingRuleData.slotMinutes ?? 120,
                        turnoverMinutes: bookingRuleData.turnoverMinutes ?? 15,
                        cancellationCutoffMinutes:
                            bookingRuleData.cancellationCutoffMinutes ?? 120,
                        graceMinutes: bookingRuleData.graceMinutes ?? 15,
                    },
                };
            }
        }

        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: updateData,
        });

        if (Array.isArray(openingHours)) {
            await prisma.openingHour.deleteMany({
                where: { restaurantId: restaurant.id },
            });

            const validOpeningHours = openingHours
                .filter(
                    (hour) =>
                        hour &&
                        hour.day &&
                        typeof hour.opensAt === "string" &&
                        typeof hour.closesAt === "string"
                )
                .map((hour) => ({
                    restaurantId: restaurant.id,
                    day: hour.day,
                    opensAt: hour.opensAt,
                    closesAt: hour.closesAt,
                }));

            if (validOpeningHours.length > 0) {
                await prisma.openingHour.createMany({
                    data: validOpeningHours,
                });
            }
        }

        const updatedRestaurant = await prisma.restaurant.findUnique({
            where: { id: restaurant.id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                bookingRule: true,
                openingHours: {
                    orderBy: { day: "asc" },
                },
                accessibility: {
                    include: { option: true },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        });

        return res.status(200).json({
            message: "Restaurant profile updated successfully",
            restaurant: updatedRestaurant,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getOwnerRestaurantProfile,
    updateOwnerRestaurantProfile,
};