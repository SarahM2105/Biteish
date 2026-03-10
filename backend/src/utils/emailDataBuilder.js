const {prisma} = require("../prismaClient");
async function buildBookingEmailData({ reservation, table, bookingStart}) {
    const owner = await prisma.user.findUnique({
        where: {id: table.restaurant.ownerId},
        select: { id:true, email:true, name:true}
    });
    const customer = await prisma.user.findUnique({
        where: {id: reservation.userId},
        select : { id: true, email:true, name:true}
    });
    return {
        owner,
        customer,
        restaurantName: table.restaurant.name,
        partySize:reservation.partySize,
        notes: reservation.notes,
        date: bookingStart.toLocaleDateString("en-GB"),
        time: bookingStart.toLocaleTimeString("en-GB",{
            hour: "2-digit",
            minute: "2-digit"
    })
    };
}

module.exports = { buildBookingEmailData}