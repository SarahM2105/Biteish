const { prisma } = require("../../../prismaClient");
const {
    approveChangeRequest: approveChangeRequestService,
    declineChangeRequest: declineChangeRequestService,
} = require("../../../utils/reservationChangeRequest");

async function listChangeRequest(req, res) {
    try {
        const ownerId = req.user.userId;

        const requests = await prisma.reservationChangeRequest.findMany({
            where: {
                reservation: {
                    table: {
                        restaurant: {
                            ownerId,
                        },
                    },
                },
                status: "PENDING",
                NOT: {
                    requestedById: ownerId,
                },
            },
            include: {
                reservation: {
                    include: {
                        user: true,
                        table: {
                            include: {
                                zone: true,
                                restaurant: true,
                            },
                        },
                    },
                },
                requestedBy: true,
                newTable: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Server error",
        });
    }
}

async function approveChangeRequest(req, res) {
    try {
        const { requestId } = req.params;
        const ownerId = req.user.userId;

        const request = await prisma.reservationChangeRequest.findUnique({
            where: { id: requestId },
            include: {
                reservation: {
                    include: {
                        table: {
                            include: {
                                restaurant: true,
                            },
                        },
                    },
                },
            },
        });

        if (!request) {
            return res.status(404).json({
                error: "Change request not found",
            });
        }

        if (
            !request.reservation.table ||
            request.reservation.table.restaurant.ownerId !== ownerId
        ) {
            return res.status(403).json({
                error: "Not authorised to approve this change request",
            });
        }

        if (request.requestedById === ownerId) {
            return res.status(403).json({
                error: "You cannot approve your own change request",
            });
        }

        const result = await approveChangeRequestService(requestId);

        return res.status(200).json({
            message: "Change request approved",
            ...result,
        });
    } catch (error) {
        console.error(error);

        if (error.message === "Change request not found") {
            return res.status(404).json({ error: error.message });
        }

        if (
            error.message === "This change request is no longer active" ||
            error.message === "Only confirmed bookings can be changed" ||
            error.message === "Invalid booking date or time" ||
            error.message === "End time must be after start time" ||
            error.message === "Party size must be at least 1" ||
            error.message === "Requested table not found" ||
            error.message === "Requested table does not belong to this restaurant" ||
            error.message === "Requested table is not available for online bookings" ||
            error.message === "Requested table does not fit the party size" ||
            error.message === "Requested table is not available for that time"
        ) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(500).json({
            error: "Server error",
        });
    }
}

async function declineChangeRequest(req, res) {
    try {
        const { requestId } = req.params;
        const ownerId = req.user.userId;

        const request = await prisma.reservationChangeRequest.findUnique({
            where: { id: requestId },
            include: {
                reservation: {
                    include: {
                        table: {
                            include: {
                                restaurant: true,
                            },
                        },
                    },
                },
            },
        });

        if (!request) {
            return res.status(404).json({
                error: "Change request not found",
            });
        }

        if (
            !request.reservation.table ||
            request.reservation.table.restaurant.ownerId !== ownerId
        ) {
            return res.status(403).json({
                error: "Not authorised to decline this change request",
            });
        }

        if (request.requestedById === ownerId) {
            return res.status(403).json({
                error: "You cannot decline your own change request",
            });
        }

        const result = await declineChangeRequestService(requestId);

        return res.status(200).json({
            message: "Change request declined",
            ...result,
        });
    } catch (error) {
        console.error(error);

        if (error.message === "Change request not found") {
            return res.status(404).json({ error: error.message });
        }

        if (error.message === "This change request is no longer active") {
            return res.status(400).json({ error: error.message });
        }

        return res.status(500).json({
            error: "Server error",
        });
    }
}

module.exports = {
    listChangeRequest,
    approveChangeRequest,
    declineChangeRequest,
};