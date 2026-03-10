const {prisma}= require('../prismaClient');
const res = require("express/lib/response");
const {listMyRestaurants} = require("./restaurantController");
const {buildEmailLayout, sendEmail} = require("../utils/emailService");
const {updateReservation} = require("./bookingController");

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
                        user: true,
                        restaurant: true,
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

        try{
            const updatedReservation = await prisma.reservation.findUnique({
                where: {id: request.reservationId},
                include:{
                    user:true,
                    restaurant: true
                }
            });
            const html = buildEmailLayout({
                title: "Reservation Change Approved",
                greeting: `Hello ${updatedReservation.user?.name || "customer"},`,
                intro: `Your reservation change request for ${updatedReservation.restaurant?.name || "the restaurant"} has been approved.`,
                content: `<p><strong>New Date:</strong> ${new Date(updatedReservation.startsAt).toLocaleDateString("en-GB")}</p>
                <p><strong>Time:</strong> ${new Date(updatedReservation.startsAt).toLocaleTimeString("en-GB",{
                    hour: "2-digit",
                    minute:"2-digit"}
                )}</p>
                <p><strong>Party Size:</strong> ${updatedReservation.partySize}</p>
                <p><strong>Notes:</strong> ${updatedReservation.notes || "None"}</p>
                <p><strong>Status:</strong> Change Approved</p>`,
                actionText: "view my bookings",
                actionUrl: `${process.env.FRONTEND_URL}/customer/bookings`
            });
            if (updatedReservation.user?.email) {
                await sendEmail({
                    to: updatedReservation.user.email,
                    subject: "your reservation change request was now approved ",
                    text: `Your  reservation change request for  ${updatedReservation.restaurant?.name || "the restaurant"} was approved .`,
                    html
                });
            }
        } catch (error){
            console.error("failed to send new booking approval email: ", error )
        }
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
                        user: true,
                        restaurant: true,
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

        try{
            const html = buildEmailLayout({
                title: "Reservation Change Declined",
                greeting: `Hello ${request.reservation.user?.name || "customer"},`,
                intro: `Unfortunately your request change reuest for ${request.reservation.restaurant?.name || "the restaurant"} was declined however your orginal bookinhg still stands.`,
                content: `
                <p><strong>Requested Date:</strong> ${request.newStartsAt ? new Date(request.newStartsAt).toLocaleDateString("en-GB") : "No change"}</p>
                <p><strong>Requested Time:</strong> ${request.newStartsAt ? new Date(request.newStartsAt).toLocaleTimeString("en-GB",{
                    hour: "2-digit",
                    minute:"2-digit"}
                )  : "no change"}</p>
                <p><strong>Requested Party Size:</strong> ${request.newPartySize ?? "No change"}</p>
                <br/>
                <p> this change request has been declined your booking still remains as:</p>
                <p><strong>Original Date:</strong> ${new Date(request.reservation.startsAt).toLocaleDateString("en-GB")}</p>
                <p><strong>Original Time:</strong> ${new Date(request.reservation.startsAt).toLocaleTimeString("en-GB",{
                    hour: "2-digit",
                    minute:"2-digit"}
                )}</p>
                <p><strong>Party Size:</strong> ${request.reservation.partySize}</p>
                <p><strong>Notes:</strong> ${request.reservation.notes || "None"}</p>
                <p><strong>Status:</strong> Change declined</p>`,
                actionText: "view my bookings",
                actionUrl: `${process.env.FRONTEND_URL}/customer/bookings`
            });
            if (request.reservation.user?.email) {
                await sendEmail({
                    to: request.reservation.user.email,
                    subject: "your reservation change request was declined",
                    text: `Your  reservation change request for  ${request.reservation.restaurant?.name || "the restaurant"} wasdeclined but your original booking is still confirmed  .`,
                    html
                });
            }
        } catch (error){
            console.error("failed to send new booking approval email: ", error )
        }

        return res.status(200).json({message: "Declined reservation and confirmed"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

module.exports = {listChangeRequest, approveChangeRequest, declineChangeRequest};