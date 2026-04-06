const { prisma } = require("../prismaClient");

async function getOwnerRestaurantProfile(req, res) {
    try {
        const ownerId = req.user.userId;

        const restaurant = await prisma.restaurant.findFirst({
            where: { ownerId },
            include: {
                bookingRule: true,
                openingHours: {
                    orderBy: { day: "asc" },
                },
                accessibility: {
                    include: {
                        option: true,
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
            bookingRule,
            openingHours,
        } = req.body;

        const restaurant = await prisma.restaurant.findFirst({
            where: { ownerId },
            select: { id: true },
        });

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: {
                name: name ?? undefined,
                location: location ?? undefined,
                bookingRule: bookingRule
                    ? {
                        upsert: {
                            update: {
                                maxPartySize: Number(bookingRule.maxPartySize),
                                daysAhead: Number(bookingRule.daysAhead),
                                slotMinutes: Number(bookingRule.slotMinutes),
                                cancellationCutoffMinutes: Number(
                                    bookingRule.cancellationCutoffMinutes
                                ),
                            },
                            create: {
                                maxPartySize: Number(bookingRule.maxPartySize),
                                daysAhead: Number(bookingRule.daysAhead),
                                slotMinutes: Number(bookingRule.slotMinutes),
                                cancellationCutoffMinutes: Number(
                                    bookingRule.cancellationCutoffMinutes
                                ),
                            },
                        },
                    }
                    : undefined,
            },
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
                bookingRule: true,
                openingHours: {
                    orderBy: { day: "asc" },
                },
                accessibility: {
                    include: { option: true },
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