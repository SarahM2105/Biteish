const { prisma } = require("../prismaClient");
const QRCode = require("qrcode");

async function getReservationQr(req, res) {
    try {
        const { reservationId } = req.params;

        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                qrToken: true,
            },
        });

        if (!reservation) {
            return res.status(404).json({
                error: "Reservation not found",
            });
        }

        if (reservation.userId !== req.user.userId) {
            return res.status(403).json({ error: "Not your reservation" });
        }

        if (reservation.status !== "CONFIRMED") {
            return res.status(400).json({
                error: "QR codes are only available for confirmed bookings",
            });
        }

        if (!reservation.qrToken) {
            return res.status(404).json({ error: "QR token not generated yet" });
        }
        const payload = JSON.stringify({
            type: "reservation_checkin",
            token: reservation.qrToken.token,
        });
        const qrImage = await QRCode.toDataURL(payload);

        return res.json({
            qrImage,
            expiresAt: reservation.qrToken.expiresAt,
            qrToken: reservation.qrToken.token,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}

module.exports = { getReservationQr };