const {prisma} = require("../prismaClient");

function bookingsOverlap(startA, endA, startB, endB){
    return startA < endB && startB < endA;
}

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
        const bookingDay = bookingStart.toLocaleDateString("en-GB",{weekday:"long"}).toUpperCase();
        const openingHour = table.restaurant.openingHours.find(
            h => h.day === bookingDay
        );
        if (!openingHour) {
            return res.status(404).json({error: `restaurant is closed on ${bookingDay}`});
        }

        const [openHour, openMinute] = openingHour.opensAt.split(":").map(Number);
        const [closeHour, closeMinute] = openHour.closesAt.split(":").map(Number);

        const opensAt = new Date(bookingStart);
        opensAt.setHours(openHour, openMinute, 0);

        const closesAt = new Date(bookingStart);
        closesAt.setHours(closeHour, closeMinute, 0);

        if (bookingStart < opensAt || new Date(endsAt) > closesAt) {
            return res.status(400).json({error: "booking is outside of opening hours"});
        }

        if (table.restaurant.ownerId === req.user.userId) {
            return res.status(403).json({error: "you cannot book your own table"})
        }

        const TURNOVER_MINUTES = table.restaurant.bookingRule?.slotMinutes ?? 15;
        const existingReservation = await prisma.reservation.findMany({
            where: {
                tableId,
                status: "CONFIRMED"
            }
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
        });
        if (!reservation) {
            return res.status(404).json({error: 'No reservation with this id'});
        }
        if (reservation.userId !== req.user.userId) {
            return res.status(403).json({error: "you can only update your own reservations"});
        }
        if (reservation.status !== "CONFIRMED"){
            return res.status(400).json({error: "only confirmed reservations"});
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
            data: { status: "CANCELLED"},
        });
        return res.status(200).json({ message: "Cancelled" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

async function approveReservation(req, res) {
    try {
        const {reservationId} = req.params;
        const reservation = await prisma.reservation.findUnique({
            where: {id: reservationId},
            include: {table: {include: {restaurant: true}}}
        });
        if (!reservation || reservation.table.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({error: "Not authorised"});
        }
        if (reservation.status !== "PENDING") {
            return res.status(400).json({error: "only confirmed reservations"});
        }
        await prisma.reservation.update({
            where: {id: reservationId},
            data: {status: "CONFIRMED"}
        });
        return res.status(200).json({message: "Approved reservation"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

async function declineReservation(req, res) {
    try {
        const {reservationId} = req.params;
        const reservation = await prisma.reservation.findUnique({
            where: {id: reservationId},
            include: {table: {include: {restaurant: true}}}
        });
        if (!reservation || reservation.table.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({error: "Not authorised"});
        }
        if (reservation.status !== "PENDING") {
            return res.status(400).json({error: "only confirmed reservationspending reservations can be declined"});
        }
        await prisma.reservation.update({
            where: {id: reservationId},
            data: {status: "DECLINED"}
        });
        return res.status(200).json({message: "Declined reservation"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }
}

module.exports = {createBooking, listUserReservations, updateReservation, cancelReservation, approveReservation, declineReservation};