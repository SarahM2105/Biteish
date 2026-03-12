const {prisma}= require('../prismaClient');

async function checkinCustomer(req,res) {
    try{
        const{qrToken}= req.body;
        if (!qrToken){
            return res.status(400).json({
                error: "QR token not provided"
            });
        }
         const tokenRow = await prisma.qrToken.findUnique({
             where: {
                 token: qrToken
             },
            include: {
                 reservation: {
                include: {
                    user: true,
                    table: {
                        include:{
                            restaurant: true
                        },
                    },
                },
                },
             },
         });
        if (!tokenRow || !tokenRow.reservation){
            return res.status(400).json({
                error: "invalid QR Token"
            });
        }
        const reservation = tokenRow.reservation;
        const restaurant = reservation.table?.restaurant;
        if (!restaurant){
            return res.status(400).json({ error: "restaurant not found for reservation"})
        }
        if(restaurant.ownerId !== req.user.userId){
            return res.status(403).json({
                error: "qr code not for your restaurant"
            });
        }
        if (reservation.status !== "CONFIRMED"){
            return res.status(400).json({error: "only confirmed reservations can be checked "})
        }

        if(tokenRow.used){
            return res.status(400).json({
                error: "QR token already used"
            });
        }

        if (new Date(tokenRow.expiresAt) < new Date()){
            return res.status(400).json({
                error: "QR Token expired"
            });
        }

        if (reservation.checkedInAt){
            return res.status(400).json({error: "reservation already checked in"});
        }

        const now = new Date();

        const updatedReservation = await prisma.reservation.update({
            where: {id: reservation.id},
            data: {
                checkedInAt: now,
            },
            include: {
                user:true,
                table: {
                    include: { restaurant: true },
                },
            },
        });

        await prisma.qrToken.update({
            where:{id:tokenRow.id},
            data:{ used: true},
        });
        return res.json({
            message: "Customer checked in successfully",
            reservation: {
                id: updatedReservation.id,
                starts: updatedReservation.startsAt,
                partySize: updatedReservation.partySize,
                notes: updatedReservation.notes,
                checkedInAt: updatedReservation.checkedInAt,
            },
            customer:{
                name: updatedReservation.user?.name || "customer",
            },
            table: {
                name: updatedReservation.table?.name || "table",
            },
            restaurant: {
                name: updatedReservation.table?.restaurant?.name || "restaurant",
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "Server error"});
    }

}

module.exports = {checkinCustomer}