const { prisma } = require("../../prismaClient");
const cloudinary = require("../../config/cloudinary");
const streamifier = require("streamifier");

function uploadBufferToCloudinary(buffer, folder= "restaurant-reviews") {
    return new Promise((resolve, reject)=> {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            });
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

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
            select:{
                id: true,
                name: true,
                capacity: true,
            },
            orderBy: { name: "asc" },
        });
        return res.json(tables);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getRestaurantDetails(req, res) {
    try {
        const { restaurantId }= req.params;

        const restaurant= await prisma.restaurant.findFirst({
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
            },
        });
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        const averageRating =
            restaurant.reviews.length > 0
                ? restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) / restaurant.reviews.length
                : 0;
        return res.json({
            id: restaurant.id,
            name: restaurant.name,
            location: restaurant.location,
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
            verified: restaurant.verified,
            bookingRule: restaurant.bookingRule,
            openingHours: restaurant.openingHours,
            accessibilityOptions: restaurant.accessibility.map((item) => ({
                id: item.option.id,
                name: item.option.optionName,
                description: item.option.description,
                icon: item.option.icon,
            })),
            tags: restaurant.tags.map((item)=> ({
                id: item.tag.id,
                name: item.tag.name,
            })),
            reviews: restaurant.reviews.map((review)=> ({
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                verifiedVisit: review.verifiedVisit,
                createdAt: review.createdAt,
                userName: review.user?.name || "Anonymous",
                images: review.images.map((image)=> ({
                    id: image.id,
                    imageUrl: image.imageUrl,
                })),
            })),
            averageRating: Number(averageRating.toFixed(1)),
            reviewCount: restaurant.reviews.length,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function createRestaurantReview(req, res){
    try {
        const userId = req.user.userId;
        const { restaurantId } = req.params;
        const { rating, comment } = req.body;
        const numericRating = Number(rating);
        if (!numericRating || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
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
        let uploadedImages = [];
        if (Array.isArray(req.files) && req.files.length > 0) {
            uploadedImages = await Promise.all(
                req.files.map((file) => uploadBufferToCloudinary(file.buffer))
            );
        }
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
            review: {
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                verifiedVisit: review.verifiedVisit,
                createdAt: review.createdAt,
                userName: review.user?.name || "Anonymous",
                images: review.images.map((image) => ({
                    id: image.id,
                    imageUrl: image.imageUrl,
                })),
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

async function getMyRestaurantReview(req, res){
    try {
        const userId = req.user.userId;
        const { restaurantId } = req.params;
        const review = await prisma.review.findFirst({
            where: {
                userId,
                restaurantId,
            },
            include: {
                images: true,
            },
        });

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        return res.json({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            verifiedVisit: review.verifiedVisit,
            images: review.images.map((image) => ({
                id: image.id,
                imageUrl: image.imageUrl,
            })),
        });
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
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
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

        let uploadedImages = [];

        if (Array.isArray(req.files) && req.files.length > 0) {
            uploadedImages = await Promise.all(
                req.files.map((file) => uploadBufferToCloudinary(file.buffer))
            );
        }

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
            review: {
                id: updatedReview.id,
                rating: updatedReview.rating,
                comment: updatedReview.comment,
                verifiedVisit: updatedReview.verifiedVisit,
                createdAt: updatedReview.createdAt,
                userName: updatedReview.user?.name || "Anonymous",
                images: updatedReview.images.map((image) => ({
                    id: image.id,
                    imageUrl: image.imageUrl,
                })),
            },
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