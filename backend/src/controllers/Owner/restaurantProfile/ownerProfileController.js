const { prisma } = require("../../../prismaClient");
const { buildRestaurantImageResponse } = require("./ProfileFormatting");
const {
    parseOptionalWholeNumber,
    refreshAutomaticSpendCalculation,
} = require("./Pricing");
const { uploadRestaurantImages } = require("./Images");
const {
    getImageOrderBy,
    getOwnerRestaurantByUserId,
    getOwnerRestaurantProfileData,
    getUpdatedOwnerRestaurantProfile,
    getRestaurantImagesForOwner,
    getRestaurantImageUploadTarget,
} = require("./Queries");
const {
    buildRestaurantUpdateData,
    buildValidOpeningHours,
} = require("./Update");

async function getOwnerRestaurantProfile(req, res) {
    try {
        const restaurant = await getOwnerRestaurantProfileData(req.user.userId);

        if (!restaurant) {
            return res.status(404).json({ error: "No restaurant found" });
        }

        return res.status(200).json({
            ...restaurant,
            images: restaurant.images.map(buildRestaurantImageResponse),
        });
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
            estimatedSpendMin,
            estimatedSpendMax,
            bookingRule,
            openingHours,
        } = req.body;

        const restaurant = await getOwnerRestaurantByUserId(ownerId);

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        const parsedEstimatedSpendMin = parseOptionalWholeNumber(estimatedSpendMin);
        const parsedEstimatedSpendMax = parseOptionalWholeNumber(estimatedSpendMax);

        if (
            parsedEstimatedSpendMin === undefined ||
            parsedEstimatedSpendMax === undefined
        ) {
            return res.status(400).json({
                error: "Estimated spend values must be whole numbers of 0 or more",
            });
        }

        const onlyOneProvided =
            (parsedEstimatedSpendMin === null && parsedEstimatedSpendMax !== null) ||
            (parsedEstimatedSpendMin !== null && parsedEstimatedSpendMax === null);

        if (onlyOneProvided) {
            return res.status(400).json({
                error: "Please provide both estimated spend min and max, or leave both empty",
            });
        }

        if (
            parsedEstimatedSpendMin !== null &&
            parsedEstimatedSpendMax !== null &&
            parsedEstimatedSpendMax < parsedEstimatedSpendMin
        ) {
            return res.status(400).json({
                error: "Estimated spend max must be greater than or equal to min",
            });
        }

        const spendFieldsWereSent =
            estimatedSpendMin !== undefined || estimatedSpendMax !== undefined;

        const updateData = buildRestaurantUpdateData({
            restaurant,
            name,
            location,
            description,
            bookingRule,
            spendFieldsWereSent,
            parsedEstimatedSpendMin,
            parsedEstimatedSpendMax,
        });

        await prisma.restaurant.update({
            where: { id: restaurant.id },
            data: updateData,
        });

        if (Array.isArray(openingHours)) {
            await prisma.openingHour.deleteMany({
                where: { restaurantId: restaurant.id },
            });

            const validOpeningHours = buildValidOpeningHours(
                openingHours,
                restaurant.id
            );

            if (validOpeningHours.length > 0) {
                await prisma.openingHour.createMany({
                    data: validOpeningHours,
                });
            }
        }

        if (
            spendFieldsWereSent &&
            parsedEstimatedSpendMin === null &&
            parsedEstimatedSpendMax === null
        ) {
            await refreshAutomaticSpendCalculation(restaurant.id);
        }

        const updatedRestaurant = await getUpdatedOwnerRestaurantProfile(
            restaurant.id
        );

        return res.status(200).json({
            message: "Restaurant profile updated successfully",
            restaurant: {
                ...updatedRestaurant,
                images: updatedRestaurant.images.map(buildRestaurantImageResponse),
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function getOwnerRestaurantImages(req, res) {
    try {
        const restaurant = await getRestaurantImagesForOwner(req.user.userId);

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        return res.status(200).json({
            restaurantId: restaurant.id,
            images: restaurant.images.map(buildRestaurantImageResponse),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function addOwnerRestaurantImages(req, res) {
    try {
        const restaurant = await getRestaurantImageUploadTarget(req.user.userId);

        if (!restaurant) {
            return res.status(404).json({ error: "Restaurant not found" });
        }

        if (!Array.isArray(req.files) || req.files.length === 0) {
            return res.status(400).json({ error: "Please upload at least one image" });
        }

        const existingPrimary = await prisma.restaurantImage.findFirst({
            where: {
                restaurantId: restaurant.id,
                isPrimary: true,
            },
            select: { id: true },
        });

        const startingSortOrder =
            restaurant.images[0]?.sortOrder !== undefined
                ? restaurant.images[0].sortOrder + 1
                : 0;

        const uploadedImages = await uploadRestaurantImages(req.files);

        const createdImages = await prisma.$transaction(async (tx) => {
            const output = [];

            for (let index = 0; index < uploadedImages.length; index += 1) {
                const image = await tx.restaurantImage.create({
                    data: {
                        restaurantId: restaurant.id,
                        imageUrl: uploadedImages[index].secure_url,
                        altText: null,
                        sortOrder: startingSortOrder + index,
                        isPrimary: !existingPrimary && index === 0,
                    },
                });

                output.push(image);
            }

            return output;
        });

        return res.status(201).json({
            message: "Restaurant images uploaded successfully",
            images: createdImages.map(buildRestaurantImageResponse),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function setPrimaryRestaurantImage(req, res) {
    try {
        const { imageId } = req.params;

        const image = await prisma.restaurantImage.findUnique({
            where: { id: imageId },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        ownerId: true,
                    },
                },
            },
        });

        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }

        if (image.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "Not your restaurant image" });
        }

        await prisma.$transaction([
            prisma.restaurantImage.updateMany({
                where: {
                    restaurantId: image.restaurantId,
                    isPrimary: true,
                },
                data: {
                    isPrimary: false,
                },
            }),
            prisma.restaurantImage.update({
                where: { id: imageId },
                data: {
                    isPrimary: true,
                },
            }),
        ]);

        const images = await prisma.restaurantImage.findMany({
            where: { restaurantId: image.restaurantId },
            orderBy: getImageOrderBy(),
        });

        return res.status(200).json({
            message: "Primary image updated successfully",
            images: images.map(buildRestaurantImageResponse),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

async function deleteOwnerRestaurantImage(req, res) {
    try {
        const { imageId } = req.params;

        const image = await prisma.restaurantImage.findUnique({
            where: { id: imageId },
            include: {
                restaurant: {
                    select: {
                        id: true,
                        ownerId: true,
                    },
                },
            },
        });

        if (!image) {
            return res.status(404).json({ error: "Image not found" });
        }

        if (image.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "Not your restaurant image" });
        }

        await prisma.restaurantImage.delete({
            where: { id: imageId },
        });

        if (image.isPrimary) {
            const nextImage = await prisma.restaurantImage.findFirst({
                where: {
                    restaurantId: image.restaurantId,
                },
                orderBy: [
                    { sortOrder: "asc" },
                    { createdAt: "asc" },
                ],
            });

            if (nextImage) {
                await prisma.restaurantImage.update({
                    where: { id: nextImage.id },
                    data: { isPrimary: true },
                });
            }
        }

        const remainingImages = await prisma.restaurantImage.findMany({
            where: { restaurantId: image.restaurantId },
            orderBy: getImageOrderBy(),
        });

        return res.status(200).json({
            message: "Restaurant image deleted successfully",
            images: remainingImages.map(buildRestaurantImageResponse),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Server error" });
    }
}

module.exports = {
    getOwnerRestaurantProfile,
    updateOwnerRestaurantProfile,
    getOwnerRestaurantImages,
    addOwnerRestaurantImages,
    setPrimaryRestaurantImage,
    deleteOwnerRestaurantImage,
};