const {prisma}= require('../prismaClient');
const res = require("express/lib/response");
const {listMyRestaurants} = require("./restaurantController");

async function listChangeRequest(req, res){
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
            },
            include: {
                reservation: true,
                requestedBy: true,
            },
        });
        return res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

async function approveChangeRequest(req, res) {
    try {
        const {requestId} = req.params;
        const request = await prisma.reservationChangeRequest.findUnique({
            where: {id: requestId},
            include: {
                reservation: {
                    include: {
                        table: {
                            include: {restaurant: true},
                        },
                    },
                },
            },
        });
        if (!request || request.reservation.table.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({error: "Not authorised "});
        }

        await prisma.reservation.update({
            where: {id: request.reservationId},
            data: {
                startsAt: request.newStartsAt ?? undefined,
                endsAt: request.newEndsAt ?? undefined,
                partySize: request.newPartySize ?? undefined,
                notes: request.newNotes ?? undefined,
            },
        });

        await prisma.reservationChangeRequest.update({
            where: { id: requestId},
            data: {status: "APPROVED"},
        });
        return res.status(200).json({message: "Approved reservation and confirmed"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

async function declineChangeRequest(req, res) {
    try{
        const {requestId} = req.params;
        const request = await prisma.reservationChangeRequest.findUnique({
            where: {id: requestId},
            include: {
                reservation: {
                    include: {
                        table: {
                            include: {restaurant: true},
                        },
                    },
                },
            },
        });
        if (!request || request.reservation.table.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({error: "not authorised"});
        }
        await prisma.reservationChangeRequest.update({
            where: {id: requestId},
            data: {status: "DECLINED"}
        });
        return res.status(200).json({message: "Declined reservation and confirmed"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

module.exports = {listChangeRequest, approveChangeRequest, declineChangeRequest};