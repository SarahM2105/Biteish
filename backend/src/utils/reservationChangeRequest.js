const { prisma } = require("../prismaClient");
const { createNotification } = require("./notificationHelper");

const ACTIVE_RESERVATION_STATUSES = ["PENDING", "CONFIRMED"];

function buildFinalValues(reservation, changes = {}) {
    const finalStartsAt = changes.startsAt
        ? new Date(changes.startsAt)
        : reservation.startsAt;

    const finalEndsAt = changes.endsAt
        ? new Date(changes.endsAt)
        : reservation.endsAt;

    const finalPartySize =
        changes.partySize !== undefined && changes.partySize !== null
            ? Number(changes.partySize)
            : reservation.partySize;

    const finalNotes =
        changes.notes !== undefined
            ? changes.notes
            : reservation.notes;

    const finalTableId = changes.tableId || reservation.tableId;

    return {
        finalStartsAt,
        finalEndsAt,
        finalPartySize,
        finalNotes,
        finalTableId,
    };
}

function getOwnerIdFromReservation(reservation) {
    return (
        reservation?.table?.restaurant?.ownerId ||
        reservation?.restaurant?.ownerId ||
        null
    );
}

function isCustomerRequester(reservation, requestedById) {
    return String(reservation?.userId) === String(requestedById);
}

async function validateRequestedTable({
                                          reservation,
                                          tableId,
                                          startsAt,
                                          endsAt,
                                          partySize,
                                          tx = prisma,
                                      }) {
    const table = await tx.table.findUnique({
        where: { id: tableId },
        include: {
            restaurant: {
                include: {
                    bookingRule: true,
                },
            },
        },
    });

    if (!table) {
        throw new Error("Requested table not found");
    }

    if (table.restaurantId !== reservation.restaurantId) {
        throw new Error("Requested table does not belong to this restaurant");
    }

    if (!table.active || !table.reservable) {
        throw new Error("Requested table is not available for online bookings");
    }

    if (table.capacity < partySize) {
        throw new Error("Requested table does not fit the party size");
    }

    const turnoverMinutes = table.restaurant?.bookingRule?.turnoverMinutes ?? 15;

    const bufferedStart = new Date(
        new Date(startsAt).getTime() - turnoverMinutes * 60 * 1000
    );

    const bufferedEnd = new Date(
        new Date(endsAt).getTime() + turnoverMinutes * 60 * 1000
    );

    const conflict = await tx.reservation.findFirst({
        where: {
            id: { not: reservation.id },
            tableId,
            status: { in: ACTIVE_RESERVATION_STATUSES },
            startsAt: { lt: bufferedEnd },
            endsAt: { gt: bufferedStart },
        },
    });

    if (conflict) {
        throw new Error("Requested table is not available for that time");
    }

    return table;
}

async function createChangeRequest({
                                       reservationId,
                                       requestedById,
                                       startsAt,
                                       endsAt,
                                       partySize,
                                       notes,
                                       tableId,
                                       replaceActive = false,
                                   }) {
    const reservation = await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: {
            table: {
                include: {
                    restaurant: true,
                },
            },
            user: true,
            restaurant: true,
        },
    });

    if (!reservation) {
        throw new Error("Reservation not found");
    }

    if (reservation.status !== "CONFIRMED") {
        throw new Error("Only confirmed bookings can be changed");
    }

    const { finalStartsAt, finalEndsAt, finalPartySize, finalTableId } =
        buildFinalValues(reservation, {
            startsAt,
            endsAt,
            partySize,
            tableId,
        });

    if (Number.isNaN(finalStartsAt.getTime()) || Number.isNaN(finalEndsAt.getTime())) {
        throw new Error("Invalid booking date or time");
    }

    if (finalStartsAt >= finalEndsAt) {
        throw new Error("End time must be after start time");
    }

    if (!Number.isInteger(finalPartySize) || finalPartySize < 1) {
        throw new Error("Party size must be at least 1");
    }

    if (finalTableId) {
        await validateRequestedTable({
            reservation,
            tableId: finalTableId,
            startsAt: finalStartsAt,
            endsAt: finalEndsAt,
            partySize: finalPartySize,
        });
    }

    const activeRequest = await prisma.reservationChangeRequest.findFirst({
        where: {
            reservationId,
            status: "PENDING",
        },
    });

    if (activeRequest && !replaceActive) {
        throw new Error("This booking already has an active change request");
    }

    const request = await prisma.$transaction(async (tx) => {
        if (activeRequest && replaceActive) {
            await tx.reservationChangeRequest.update({
                where: { id: activeRequest.id },
                data: {
                    status: "DECLINED",
                    reviewedAt: new Date(),
                },
            });
        }

        return tx.reservationChangeRequest.create({
            data: {
                reservationId,
                requestedById,
                newStartsAt: startsAt ? new Date(startsAt) : null,
                newEndsAt: endsAt ? new Date(endsAt) : null,
                newPartySize:
                    partySize !== undefined && partySize !== null
                        ? Number(partySize)
                        : null,
                newNotes: notes !== undefined ? notes : null,
                newTableId: tableId ?? null,
            },
            include: {
                reservation: true,
                requestedBy: true,
                newTable: true,
            },
        });
    });

    const ownerId = getOwnerIdFromReservation(reservation);
    const requesterIsCustomer = isCustomerRequester(reservation, requestedById);
    const recipientUserId = requesterIsCustomer ? ownerId : reservation.userId;

    if (recipientUserId) {
        await createNotification({
            userId: recipientUserId,
            reservationId: reservation.id,
            title: "Booking change request received",
            message: requesterIsCustomer
                ? `A customer requested a booking update for ${reservation.restaurant?.name || "your restaurant"}.`
                : `The restaurant proposed a booking update for your booking at ${reservation.restaurant?.name || "the restaurant"}.`,
        });
    }

    return { reservation, request };
}

async function approveChangeRequest(requestId) {
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
                    restaurant: true,
                    user: true,
                },
            },
            requestedBy: true,
            newTable: true,
        },
    });

    if (!request) {
        throw new Error("Change request not found");
    }

    if (request.status !== "PENDING") {
        throw new Error("This change request is no longer active");
    }

    const reservation = request.reservation;

    if (reservation.status !== "CONFIRMED") {
        throw new Error("Only confirmed bookings can be changed");
    }

    const { finalStartsAt, finalEndsAt, finalPartySize, finalNotes, finalTableId } =
        buildFinalValues(reservation, {
            startsAt: request.newStartsAt,
            endsAt: request.newEndsAt,
            partySize: request.newPartySize,
            notes: request.newNotes,
            tableId: request.newTableId,
        });

    if (Number.isNaN(finalStartsAt.getTime()) || Number.isNaN(finalEndsAt.getTime())) {
        throw new Error("Invalid booking date or time");
    }

    if (finalStartsAt >= finalEndsAt) {
        throw new Error("End time must be after start time");
    }

    if (!Number.isInteger(finalPartySize) || finalPartySize < 1) {
        throw new Error("Party size must be at least 1");
    }

    const result = await prisma.$transaction(async (tx) => {
        if (finalTableId) {
            await validateRequestedTable({
                reservation,
                tableId: finalTableId,
                startsAt: finalStartsAt,
                endsAt: finalEndsAt,
                partySize: finalPartySize,
                tx,
            });
        }

        const updatedReservation = await tx.reservation.update({
            where: { id: reservation.id },
            data: {
                startsAt: finalStartsAt,
                endsAt: finalEndsAt,
                partySize: finalPartySize,
                notes: finalNotes,
                tableId: finalTableId,
            },
        });

        const updatedRequest = await tx.reservationChangeRequest.update({
            where: { id: requestId },
            data: {
                status: "APPROVED",
                reviewedAt: new Date(),
            },
            include: {
                reservation: true,
                requestedBy: true,
                newTable: true,
            },
        });

        return {
            reservation: updatedReservation,
            request: updatedRequest,
        };
    });

    await createNotification({
        userId: request.requestedById,
        reservationId: reservation.id,
        title: "Booking change approved",
        message: `Your booking change request for ${reservation.restaurant?.name || "the restaurant"} was approved.`,
    });

    return result;
}

async function declineChangeRequest(requestId) {
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
                    restaurant: true,
                    user: true,
                },
            },
            requestedBy: true,
            newTable: true,
        },
    });

    if (!request) {
        throw new Error("Change request not found");
    }

    if (request.status !== "PENDING") {
        throw new Error("This change request is no longer active");
    }

    const updatedRequest = await prisma.reservationChangeRequest.update({
        where: { id: requestId },
        data: {
            status: "DECLINED",
            reviewedAt: new Date(),
        },
        include: {
            reservation: true,
            requestedBy: true,
            newTable: true,
        },
    });

    await createNotification({
        userId: request.requestedById,
        reservationId: request.reservationId,
        title: "Booking change declined",
        message: `Your booking change request for ${request.reservation?.restaurant?.name || "the restaurant"} was declined.`,
    });

    return { request: updatedRequest };
}

async function cancelChangeRequest(requestId, requestedById) {
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
                    restaurant: true,
                    user: true,
                },
            },
            requestedBy: true,
            newTable: true,
        },
    });

    if (!request) {
        throw new Error("Change request not found");
    }

    if (request.requestedById !== requestedById) {
        throw new Error("Not authorised to cancel this change request");
    }

    if (request.status !== "PENDING") {
        throw new Error("Only pending change requests can be cancelled");
    }

    const updatedRequest = await prisma.reservationChangeRequest.update({
        where: { id: requestId },
        data: {
            status: "DECLINED",
            reviewedAt: new Date(),
        },
        include: {
            reservation: true,
            requestedBy: true,
            newTable: true,
        },
    });

    const ownerId = getOwnerIdFromReservation(request.reservation);
    const requesterIsCustomer = isCustomerRequester(request.reservation, requestedById);
    const recipientUserId = requesterIsCustomer ? ownerId : request.reservation.userId;

    if (recipientUserId) {
        await createNotification({
            userId: recipientUserId,
            reservationId: request.reservationId,
            title: "Booking change request cancelled",
            message: requesterIsCustomer
                ? `A customer cancelled their booking change request for ${request.reservation?.restaurant?.name || "the booking"}.`
                : `The restaurant cancelled its proposed booking update for your booking at ${request.reservation?.restaurant?.name || "the restaurant"}.`,
        });
    }

    return { request: updatedRequest };
}

module.exports = {
    createChangeRequest,
    approveChangeRequest,
    declineChangeRequest,
    cancelChangeRequest,
};