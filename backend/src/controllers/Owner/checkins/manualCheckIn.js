const { prisma } = require("../../../prismaClient");
const { getIO } = require("../../../socket");
const { getRestaurantOccupancy } = require("../../../utils/occupancy");
const { bookingsOverlap } = require("../../../utils/bookingsOverlap");

async function manualCheckIn(req, res) {
    try {
        const ownerId = req.user.userId;
        const { guestName, partySize, tableId, notes } = req.body;

        if (!guestName?.trim()) {
            return res.status(400).json({
                error: "Guest name is required",
            });
        }

        if (!tableId) {
            return res.status(400).json({
                error: "tableId is required",
            });
        }

        const size = Math.max(Number(partySize) || 1, 1);

        const restaurant = await prisma.restaurant.findFirst({
            where: { ownerId },
            include: {
                bookingRule: true,
            },
        });

        if (!restaurant) {
            return res.status(404).json({
                error: "Restaurant not found",
            });
        }

        const table = await prisma.table.findFirst({
            where: {
                id: tableId,
                restaurantId: restaurant.id,
                active: true,
                reservable: true,
                capacity: {
                    gte: size,
                },
            },
            include: {
                reservations: {
                    where: {
                        status: {
                            in: ["PENDING", "CONFIRMED"],
                        },
                    },
                    select: {
                        id: true,
                        startsAt: true,
                        endsAt: true,
                        checkedInAt: true,
                        status: true,
                    },
                },
            },
        });

        if (!table) {
            return res.status(404).json({
                error: "Table not found or unavailable",
            });
        }

        const now = new Date();
        const slotMinutes = restaurant.bookingRule?.slotMinutes ?? 90;
        const turnoverMinutes = restaurant.bookingRule?.turnoverMinutes ?? 15;
        const endsAt = new Date(now.getTime() + slotMinutes * 60 * 1000);

        const occupied = table.reservations.some(
            (reservation) => reservation.checkedInAt
        );

        if (occupied) {
            return res.status(400).json({
                error: "That table is currently occupied",
            });
        }

        const walkInConflict = table.reservations.some((reservation) =>
            bookingsOverlap(
                now,
                endsAt,
                new Date(new Date(reservation.startsAt).getTime() - turnoverMinutes * 60000),
                new Date(new Date(reservation.endsAt).getTime() + turnoverMinutes * 60000)
            )
        );

        if (walkInConflict) {
            return res.status(400).json({
                error: "That table is not available for a walk-in during that time",
            });
        }

        const reservation = await prisma.reservation.create({
            data: {
                restaurantId: restaurant.id,
                userId: null,
                guestName: guestName.trim(),
                isWalkIn: true,
                tableId: table.id,
                startsAt: now,
                endsAt,
                partySize: size,
                notes: notes?.trim() || null,
                checkedInAt: now,
                status: "CONFIRMED",
            },
        });

        try {
            const io = getIO();
            const occupancy = await getRestaurantOccupancy(restaurant.id);

            io.to(`user:${ownerId}`).emit("occupancy:updated", {
                restaurantId: restaurant.id,
                ...occupancy,
            });
        } catch (error) {
            console.error("Failed to emit occupancy update:", error);
        }

        return res.status(201).json({
            message: "Walk-in guest checked in successfully",
            reservation: {
                id: reservation.id,
                startsAt: reservation.startsAt,
                endsAt: reservation.endsAt,
                partySize: reservation.partySize,
                notes: reservation.notes,
                checkedInAt: reservation.checkedInAt,
                isWalkIn: reservation.isWalkIn,
                guestName: reservation.guestName,
            },
            customer: {
                name: reservation.guestName || "Guest",
            },
            table: {
                id: table.id,
                name: table.name,
            },
            restaurant: {
                id: restaurant.id,
                name: restaurant.name,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Server error",
        });
    }
}

module.exports = { manualCheckIn };