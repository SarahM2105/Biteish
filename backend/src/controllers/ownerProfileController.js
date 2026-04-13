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
            if (restaurant.bookingRule) {
                updateData.bookingRule = {
                    update: {
                        daysAhead: Number(bookingRule.daysAhead),
                        slotMinutes: Number(bookingRule.slotMinutes),
                        cancellationCutoffMinutes: Number(
                            bookingRule.cancellationCutoffMinutes
                        ),
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