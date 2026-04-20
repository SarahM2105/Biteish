const { prisma } = require("../../../prismaClient");
const {
    createChangeRequest,
    approveChangeRequest: approveChangeRequestService,
    declineChangeRequest: declineChangeRequestService,
} = require("../../../utils/reservationChangeRequest");

async function updateReservation(req, res) {
    try {
        const { reservationId } = req.params;
        const {
            startsAt,
            endsAt,
            partySize,
            notes,
            tableId,
            replaceActive = false,
        } = req.body;

        const userId = req.user.userId;

        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
        });

        if (!reservation) {
            return res.status(404).json({
                error: "Reservation not found",
            });
        }

        if (reservation.userId !== userId) {
            return res.status(403).json({
                error: "Not authorised to update this reservation",
            });
        }

        const hasChanges =
            startsAt ||
            endsAt ||
            partySize !== undefined ||
            notes !== undefined ||
            tableId;

        if (!hasChanges) {
            return res.status(400).json({
                error: "Please provide at least one change",
            });
        }

        const { request } = await createChangeRequest({
            reservationId,
            requestedById: userId,
            startsAt,
            endsAt,
            partySize,
            notes,
            tableId,
            replaceActive,
        });

        return res.status(201).json({
            message: "Reservation change request created",
            request,
        });
    } catch (error) {
        console.error(error);

        if (
            error.message === "Reservation not found" ||
            error.message === "Requested table not found"
        ) {
            return res.status(404).json({ error: error.message });
        }

        if (
            error.message === "Only confirmed bookings can be changed" ||
            error.message === "This booking already has an active change request" ||
            error.message === "Invalid booking date or time" ||
            error.message === "End time must be after start time" ||
            error.message === "Party size must be at least 1" ||
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

async function listIncomingChangeRequests(req, res) {
    try {
        const userId = req.user.userId;

        const requests = await prisma.reservationChangeRequest.findMany({
            where: {
                reservation: {
                    userId,
                },
                status: "PENDING",
                NOT: {
                    requestedById: userId,
                },
            },
            include: {
                reservation: {
                    include: {
                        table: true,
                        restaurant: true,
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

async function approveIncomingChangeRequest(req, res) {
    try {
        const { requestId } = req.params;
        const userId = req.user.userId;

        const request = await prisma.reservationChangeRequest.findUnique({
            where: { id: requestId },
            include: {
                reservation: true,
            },
        });

        if (!request) {
            return res.status(404).json({
                error: "Change request not found",
            });
        }

        if (request.reservation.userId !== userId) {
            return res.status(403).json({
                error: "Not authorised to approve this change request",
            });
        }

        if (request.requestedById === userId) {
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

async function declineIncomingChangeRequest(req, res) {
    try {
        const { requestId } = req.params;
        const userId = req.user.userId;

        const request = await prisma.reservationChangeRequest.findUnique({
            where: { id: requestId },
            include: {
                reservation: true,
            },
        });

        if (!request) {
            return res.status(404).json({
                error: "Change request not found",
            });
        }

        if (request.reservation.userId !== userId) {
            return res.status(403).json({
                error: "Not authorised to decline this change request",
            });
        }

        if (request.requestedById === userId) {
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
    updateReservation,
    listIncomingChangeRequests,
    approveIncomingChangeRequest,
    declineIncomingChangeRequest,
};