const {prisma} = require("../../prismaClient");
const {buildBookingEmailData} = require("../../utils/emailDataBuilder");
const {buildEmailLayout, sendEmail} = require("../../utils/emailService");
const {getIO} = require("../../socket");
const {bookingsOverlap} = require("../../utils/bookingsOverlap");

async function createBooking(req, res) {
    try{
        const {startsAt, endsAt, partySize, notes} = req.body;
        const {tableId}= req.params;
        if (!startsAt || !endsAt || !partySize) {
            return res.status(400).json({error: "startsAt, endsAt, partysize and reason required"});
        }
        const table = await prisma.table.findUnique({
            where: {id: tableId},
            include: {
                restaurant: {
                    include: {
                        bookingRule: true,
                        openingHours: true
                    },
                },
            },
        });
        if (!table) {
            return res.status(404).json({error: "tableId not found"});
        }
        const bookingStart = new Date(startsAt);
        const bookingEnd = new Date(endsAt);

        const hours = table.restaurant.openingHours || [];
        const bookingDay = bookingStart
            .toLocaleDateString("en-GB", { weekday: "long" })
            .toUpperCase();

        if (hours.length > 0) {
            const openingHour = hours.find(h => h.day === bookingDay);

            if (!openingHour) {
                return res.status(400).json({ error: `Restaurant is closed on ${bookingDay}` });
            }

            const [openHour, openMinute] = openingHour.opensAt.split(":").map(Number);
            const [closeHour, closeMinute] = openingHour.closesAt.split(":").map(Number);

            const opensAt = new Date(bookingStart);
            opensAt.setHours(openHour, openMinute, 0, 0);

            const closesAt = new Date(bookingStart);
            closesAt.setHours(closeHour, closeMinute, 0, 0);

            if (closesAt <= opensAt) {
                closesAt.setDate(closesAt.getDate() + 1);
            }

            if (bookingStart < opensAt || bookingEnd > closesAt) {
                return res.status(400).json({ error: "Booking is outside of opening hours" });
            }
        }


        if (table.restaurant.ownerId === req.user.userId) {
            return res.status(403).json({error: "you cannot book your own table"})
        }

        const TURNOVER_MINUTES = table.restaurant.bookingRule?.slotMinutes ?? 15;
        const existingReservation = await prisma.reservation.findMany({
            where: {
                tableId,
                status: { in: ["PENDING", "CONFIRMED"] },
                endsAt: {
                    gt: new Date(startsAt),
                },
            },
        });
        const conflict = existingReservation.some(r =>
            bookingsOverlap(
                new Date(startsAt),
                new Date(endsAt),
                new Date(new Date(r.startsAt).getTime() - TURNOVER_MINUTES*60000),
                new Date(new Date(r.endsAt).getTime() + TURNOVER_MINUTES*60000)
            )
        );
        if (conflict){
            return res.status(409).json({error: " timeslot already taken"})
        }
        const reservation = await prisma.reservation.create({
            data: {
                userId: req.user.userId,
                tableId,
                restaurantId: table.restaurantId,
                startsAt: new Date(startsAt),
                endsAt: new Date(endsAt),
                partySize,
                status: "PENDING",
                notes,
            }
        });
        try{
            const emailData = await buildBookingEmailData({
                reservation,
                table,
                bookingStart
            });

            const subject = "New Booking Request";

            const html = buildEmailLayout({
                title: "New Booking Request",
                greeting: `Hello ${emailData.owner.name|| "Owner"},`,
                intro: `You have received a new booking request for ${emailData.restaurantName}.`,
                content: `
                <p><strong> Customer: </strong> ${emailData.customer.name}</p>
                <p><strong>Date:</strong> ${emailData.date}</p>
                <p><strong>Time: </strong> ${emailData.time}</p>
                <p><strong>Party Size:</strong> ${emailData.partySize}</p>
                <p><strong>Notes:</strong> ${emailData.notes || "none"}</p>`,
                actionText:"View Requests",
                actionUrl: `${process.env.FRONTEND_URL}/owner/request`
            });
            if (emailData.owner?.email) {
                await sendEmail({
                    to: emailData.owner.email,
                    subject,
                    text: `you have a new booking request from ${emailData.customer.name}`,
                    html
                });
            }
        } catch (error) {
            console.error("Failed to send owner email:", error);
        }
        try{
            const io = getIO();
            io.to(`user:${table.restaurant.ownerId}`).emit("reservation:created", {
                reservationId: reservation.id,
                restaurantId: reservation.restaurantId,
                tableId: reservation.tableId,
                status: reservation.status,
            });
        } catch {}
        return res.status(201).json(reservation);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

async function listUserReservations(req, res) {
    try{
        const reservations = await prisma.reservation.findMany({
            where:{userId: req.user.userId},
            include: {
                restaurant: true,
                table: true,
            },
            orderBy: {startsAt: "asc"},
        });
        return res.status(200).json(reservations);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

async function updateReservation(req, res) {
    try{
        const {reservationId} = req.params;
        const{startsAt, endsAt, partySize, notes} = req.body;

        const reservation = await prisma.reservation.findUnique({
            where: {id: reservationId},
            include: {
                user: true,
                restaurant: true,
                table:{
                    include: {restaurant:true}
                }
            }
        });
        if (!reservation) {
            return res.status(404).json({error: 'No reservation with this id'});
        }
        if (reservation.userId !== req.user.userId) {
            return res.status(403).json({error: "you can only update your own reservations"});
        }
        if (["CANCELLED", "COMPLETED", "NO_SHOW"].includes(reservation.status)){
            return res.status(400).json({error: `cannot update a ${reservation.status.toLowerCase()} reservation`});
        }
        const existingRequest = await prisma.reservationChangeRequest.findFirst({
            where: {
                reservationId,
                status: "PENDING",
            },
        });
        if (existingRequest) {
            return res.status(409).json({error: "you already have a pending change request for this reservation, delete the current one to continue"});
        }
        const request = await prisma.reservationChangeRequest.create({
            data: {
                reservationId,
                newStartsAt: startsAt ? new Date(startsAt) : null,
                newEndsAt: endsAt ? new Date(endsAt): null,
                newPartySize: partySize ?? null,
                newNotes: notes ?? null,
                requestedById: req.user.userId,
            }
        });
        try{
            const owner = await prisma.user.findUnique({
                where: {id: reservation.table.restaurant.ownerId},
                select: {email:true, name: true}
            });
            const html = buildEmailLayout({
                title: "Reservation Change Request",
                greeting: `Hello ${owner?.name || "Owner"},`,
                intro: `A customer has submitted a reservation change request for ${reservation.restaurant?.name || "your restaurant"}.`,
                content: `<p><strong> Customer: </strong> ${reservation.user?.name}</p>
                <p><strong>Original Date:</strong> ${new Date(reservation.startsAt).toLocaleDateString("en-GB")}</p>
                <p><strong>Original Time: </strong> ${new Date(reservation.startsAt).toLocaleTimeString("en-GB",{
                    hour: "2-digit",
                    minute: "2-digit"
                })}</p>
                
                <p><strong>Requested New Date:</strong> ${request.newStartsAt ? new Date(request.newStartsAt).toLocaleDateString("en-GB"):"no change"}</p>
                <p><strong>Requested New Time: </strong> ${request.newStartsAt ? new Date(request.newStartsAt).toLocaleTimeString("en-GB",{
                    hour: "2-digit",
                    minute: "2-digit"
                }): "No Change"}</p>
                
                <p><strong>Requested Party Size:</strong> ${request.newPartySize ?? "No change"}</p>
                <p><strong>Request Notes:</strong> ${request.newNotes || "no Change"}</p>`,
                actionText:"View Change Requests",
                actionUrl: `${process.env.FRONTEND_URL}/owner/request`
            });
            if (owner?.email) {
                await sendEmail({
                    to: owner.email,
                    subject: "New reservation change request",
                    text: `A customer has submitted a reservation change request for ${reservation.restaurant?.name || "your restaurant"}.`,
                    html
                });
            }
        } catch (error){
            console.error("failed to send change request email: ", error )
        }

        return res.status(202).json({
            message: "Reservation change request submitted for approval",
            request: request
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

async function cancelReservation(req, res) {
    try{
        const {reservationId} = req.params;
        const reservation = await prisma.reservation.findUnique({
            where: {id: reservationId},
            include: {
                restaurant: true,
                table:{
                    include: {restaurant:true}
                }
            }
        });
        if(!reservation) {
            return res.status(404).json({error: 'No reservation with this id'});
        }
        if(reservation.userId !== req.user.userId) {
            return res.status(403).json({error: "you can only cancel your own reservations"});
        }
        if(["CANCELLED","COMPLETED", "NO_SHOW"].includes(reservation.status)){
            return res.status(400).json({error: `reservation already ${reservation.status.toLowerCase()}`});
        }
        const cancelled = await prisma.reservation.update({
            where: {id: reservationId},
            data: {status: "CANCELLED"},
        });
        try{
            const owner = await prisma.user.findUnique({
                where: {id: reservation.table.restaurant.ownerId},
                select: {email:true, name:true}
            });
            const html = buildEmailLayout({
                title: "Booking Cancelled",
                greeting: `Hello ${owner?.name || "Owner"},`,
                intro: `You have a cancellation for  ${reservation.restaurant?.name || "your restaurant"}.`,
                content: `<p><strong>Date:</strong> ${new Date(reservation.startsAt).toLocaleDateString("en-GB")}</p>
                <p><strong>Time:</strong> ${new Date(reservation.startsAt).toLocaleTimeString("en-GB",{
                    hour: "2-digit",
                    minute:"2-digit"}
                )}</p>
                <p><strong>Party Size:</strong> ${reservation.partySize}</p>
                <p><strong>Status:</strong> Cancelled</p>`,
                actionText: "view requests",
                actionUrl: `${process.env.FRONTEND_URL}/owner/request`
            });
            if (owner?.email) {
                await sendEmail({
                    to: owner.email,
                    subject: "a booking has been cancelled",
                    text: `Your booking for ${reservation.restaurant?.name || "the restaurant"} has been cancelled.`,
                    html
                });
            }
        } catch (error){
            console.error("failed to send cancellation email ", error )
        }
        return res.status(200).json({ message: "Cancelled" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

module.exports = {createBooking, listUserReservations, updateReservation, cancelReservation};