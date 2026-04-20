const { prisma } = require("../prismaClient");
const { getIO } = require("../socket");

async function createNotification({
                                      userId,
                                      reservationId = null,
                                      title,
                                      message,
                                      type = "BOOKING_UPDATE",
                                  }) {
    const notification = await prisma.notification.create({
        data: {
            userId,
            reservationId,
            title,
            message,
            type,
            isRead: false,
        },
    });

    try {
        const io = getIO();
        io.to(`user:${userId}`).emit("notification:created", notification);
    } catch (error) {
        console.error("Failed to emit notification:", error);
    }

    return notification;
}

module.exports = {
    createNotification,
};