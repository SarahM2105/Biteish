const { buildBookingEmailData } = require("../../../utils/emailDataBuilder");
const { buildEmailLayout, sendEmail } = require("../../../utils/emailService");
const { getIO } = require("../../../socket");
const { prisma } = require("../../../prismaClient");

async function notifyOwnerAboutNewBooking({ reservation, table, bookingStart }) {
    try {
        const emailData = await buildBookingEmailData({
            reservation,
            table,
            bookingStart,
        });

        const subject = "New Booking Request";

        const html = buildEmailLayout({
            title: "New Booking Request",
            greeting: `Hello ${emailData.owner.name || "Owner"},`,
            intro: `You have received a new booking request for ${emailData.restaurantName}.`,
            content: `
                <p><strong>Customer:</strong> ${emailData.customer.name}</p>
                <p><strong>Date:</strong> ${emailData.date}</p>
                <p><strong>Time:</strong> ${emailData.time}</p>
                <p><strong>Party Size:</strong> ${emailData.partySize}</p>
                <p><strong>Notes:</strong> ${emailData.notes || "none"}</p>`,
            actionText: "View Requests",
            actionUrl: `${process.env.FRONTEND_URL}/owner/request`,
        });

        if (emailData.owner?.email) {
            await sendEmail({
                to: emailData.owner.email,
                subject,
                text: `You have a new booking request from ${emailData.customer.name}`,
                html,
            });
        }
    } catch (error) {
        console.error("Failed to send owner email:", error);
    }
}

function emitOwnerBookingCreated({ reservation, table }) {
    try {
        const io = getIO();
        io.to(`user:${table.restaurant.ownerId}`).emit("reservation:created", {
            reservationId: reservation.id,
            restaurantId: reservation.restaurantId,
            tableId: reservation.tableId,
            status: reservation.status,
        });
    } catch {}
}

async function notifyOwnerAboutCancelledBooking(reservation) {
    try {
        const owner = await prisma.user.findUnique({
            where: { id: reservation.table.restaurant.ownerId },
            select: { email: true, name: true },
        });

        const html = buildEmailLayout({
            title: "Booking Cancelled",
            greeting: `Hello ${owner?.name || "Owner"},`,
            intro: `You have a cancellation for ${reservation.restaurant?.name || "your restaurant"}.`,
            content: `<p><strong>Date:</strong> ${new Date(
                reservation.startsAt
            ).toLocaleDateString("en-GB")}</p>
                <p><strong>Time:</strong> ${new Date(
                reservation.startsAt
            ).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            })}</p>
                <p><strong>Party Size:</strong> ${reservation.partySize}</p>
                <p><strong>Status:</strong> Cancelled</p>`,
            actionText: "View Requests",
            actionUrl: `${process.env.FRONTEND_URL}/owner/request`,
        });

        if (owner?.email) {
            await sendEmail({
                to: owner.email,
                subject: "A booking has been cancelled",
                text: `Your booking for ${reservation.restaurant?.name || "the restaurant"} has been cancelled.`,
                html,
            });
        }
    } catch (error) {
        console.error("failed to send cancellation email ", error);
    }
}

module.exports = {
    notifyOwnerAboutNewBooking,
    emitOwnerBookingCreated,
    notifyOwnerAboutCancelledBooking,
};