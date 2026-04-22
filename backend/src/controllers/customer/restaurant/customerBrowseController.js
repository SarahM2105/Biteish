const { prisma } = require("../../../prismaClient");
const {
    buildTableResponse,
    buildReviewResponse,
    buildRestaurantDetailsResponse,
} = require("./restaurantResponseHelpers");
const { uploadReviewImages } = require("./reviewImageHelpers");

async function listZonesForRestaurant(req, res) {
    try {
        const { restaurantId } = req.params;

        const zones = await prisma.zone.findMany({
            where: { restaurantId },
            select: {
                id: true,
                name: true,
            },
            orderBy: { name: "asc" },
        });

        return res.json(zones);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function listTablesForZone(req, res) {
    try {
        const { zoneId } = req.params;

        const tables = await prisma.table.findMany({
            where: {
                zoneId,
                active: true,
                reservable: true,
            },
            include: {
                tableTags: {
                    include: {
                        tag: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: [{ capacity: "asc" }, { name: "asc" }],
        });

        return res.json(tables.map(buildTableResponse));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getRestaurantDetails(req, res) {
    try {
        const { restaurantId } = req.params;

        const restaurant = await prisma.restaurant.findFirst({
            where: {
                id: restaurantId,
                verified: true,
            },
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
                tags: {
                    include: {
                        tag: true,
                    },
                },
                images: {
                    orderBy: [
                        { isPrimary: "desc" },
                        { sortOrder: "asc" },
                        { createdAt: "asc" },
                    ],
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                name: true,
                            },
                        },
                        images: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                menuSections: {
                    where: {
                        isActive: true,
                    },
                    orderBy: {
                        sortOrder: "asc",
                    },
                    include: {
                        items: {
                            where: {
                                isAvailable: true,
                            },
                            orderBy: {
                                sortOrder: "asc",
                            },
                        },
                    },
                },
            },
        });

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        return res.json(buildRestaurantDetailsResponse(restaurant));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function createRestaurantReview(req, res) {
    try {
        const userId = req.user.userId;
        const { restaurantId } = req.params;
        const { rating, comment } = req.body;
        const numericRating = Number(rating);

        if (!numericRating || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5",
            });
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { id: true },
        });

        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        const existingReview = await prisma.review.findFirst({
            where: {
                userId,
                restaurantId,
            },
            select: {
                id: true,
            },
        });

        if (existingReview) {
            return res.status(409).json({
                message: "You have already reviewed this restaurant",
            });
        }

        const completedReservation = await prisma.reservation.findFirst({
            where: {
                userId,
                restaurantId,
                status: "COMPLETED",
            },
            select: {
                id: true,
            },
        });

        const uploadedImages = await uploadReviewImages(req.files);

        const review = await prisma.review.create({
            data: {
                userId,
                restaurantId,
                rating: numericRating,
                comment: comment?.trim() || null,
                verifiedVisit: Boolean(completedReservation),
                images: uploadedImages.length
                    ? {
                        create: uploadedImages.map((image) => ({
                            imageUrl: image.secure_url,
                        })),
                    }
                    : undefined,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                images: true,
            },
        });

        return res.status(201).json({
            message: "Review created successfully",
            review: buildReviewResponse(review),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getMyRestaurantReview(req, res) {
    try {
        const userId = req.user.userId;
        const { restaurantId } = req.params;

        const review = await prisma.review.findFirst({
            where: {
                userId,
                restaurantId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                images: true,
            },
        });

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        return res.json(buildReviewResponse(review));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function updateRestaurantReview(req, res) {
    try {
        const userId = req.user.userId;
        const { restaurantId } = req.params;
        const { rating, comment } = req.body;
        const numericRating = Number(rating);

        if (!numericRating || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5",
            });
        }

        const existingReview = await prisma.review.findFirst({
            where: {
                userId,
                restaurantId,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                images: true,
            },
        });

        if (!existingReview) {
            return res.status(404).json({ message: "Review not found" });
        }

        const uploadedImages = await uploadReviewImages(req.files);

        const updatedReview = await prisma.review.update({
            where: {
                id: existingReview.id,
            },
            data: {
                rating: numericRating,
                comment: comment?.trim() || null,
                images: uploadedImages.length
                    ? {
                        deleteMany: {},
                        create: uploadedImages.map((image) => ({
                            imageUrl: image.secure_url,
                        })),
                    }
                    : undefined,
            },
            include: {
                user: {
                    select: {
                        name: true,
                    },
                },
                images: true,
            },
        });

        return res.json({
            message: "Review updated successfully",
            review: buildReviewResponse(updatedReview),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = {
    listZonesForRestaurant,
    listTablesForZone,
    getRestaurantDetails,
    createRestaurantReview,
    getMyRestaurantReview,
    updateRestaurantReview,
};