const { prisma } = require("../../../prismaClient");
const {
    createChangeRequest,
    cancelChangeRequest: cancelChangeRequestService,
} = require("../../../utils/reservationChangeRequest");

async function createOwnerChangeRequest(req, res) {
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

        const ownerId = req.user.userId;

        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                table: {
                    include: {
                        restaurant: true,
                    },
                },
            },
        });

        if (!reservation) {
            return res.status(404).json({
                error: "Reservation not found",
            });
        }

        if (!reservation.table || reservation.table.restaurant.ownerId !== ownerId) {
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
            requestedById: ownerId,
            startsAt,
            endsAt,
            partySize,
            notes,
            tableId,
            replaceActive,
        });

        return res.status(201).json({
            message: "Owner change request created",
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

async function cancelChangeRequest(req, res) {
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
                error: "Not authorised to cancel this change request",
            });
        }

        if (request.requestedById !== ownerId) {
            return res.status(403).json({
                error: "You can only cancel your own outgoing change requests",
            });
        }

        const result = await cancelChangeRequestService(requestId, ownerId);

        return res.status(200).json({
            message: "Change request cancelled",
            ...result,
        });
    } catch (error) {
        console.error(error);

        if (error.message === "Change request not found") {
            return res.status(404).json({ error: error.message });
        }

        if (
            error.message === "Not authorised to cancel this change request" ||
            error.message === "Only pending change requests can be cancelled"
        ) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(500).json({
            error: "Server error",
        });
    }
}

module.exports = {
    createOwnerChangeRequest,
    cancelChangeRequest,
};