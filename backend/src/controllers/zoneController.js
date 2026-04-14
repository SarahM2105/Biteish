const { prisma } = require("../prismaClient");

function normaliseZoneName(value) {
    return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

async function createZone(req, res) {
    try {
        const { restaurantId } = req.params;
        const { name, description } = req.body;

        const trimmedName = String(name || "").trim();

        if (!trimmedName) {
            return res.status(400).json({ error: "name is required" });
        }

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
        });

        if (!restaurant) {
            return res.status(404).json({ error: "No restaurant found with this id" });
        }

        if (restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "not your restaurant" });
        }

        const existingZones = await prisma.zone.findMany({
            where: { restaurantId },
            select: { id: true, name: true },
        });

        const duplicateZone = existingZones.find(
            (zone) => normaliseZoneName(zone.name) === normaliseZoneName(trimmedName)
        );

        if (duplicateZone) {
            return res.status(409).json({
                error: "A zone with this name already exists for this restaurant.",
            });
        }

        const zone = await prisma.zone.create({
            data: {
                restaurantId,
                name: trimmedName,
                description: description?.trim() || null,
            },
        });

        return res.status(201).json(zone);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "server error" });
    }
}

async function listZones(req, res) {
    try {
        const { restaurantId } = req.params;

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
        });

        if (!restaurant) {
            return res.status(404).json({ error: "No restaurant found with this id" });
        }

        if (restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "not your restaurant" });
        }

        const zones = await prisma.zone.findMany({
            where: { restaurantId },
        });

        return res.json(zones);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "server error" });
    }
}

async function updateZone(req, res) {
    try {
        const { zoneId } = req.params;
        const { name, description } = req.body;

        const zone = await prisma.zone.findUnique({
            where: { id: zoneId },
            include: { restaurant: true },
        });

        if (!zone) {
            return res.status(404).json({ error: "No zone found with this id" });
        }

        if (zone.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "not your zone" });
        }

        const nextName = name == null ? zone.name : String(name).trim();

        if (!nextName) {
            return res.status(400).json({ error: "name is required" });
        }

        const siblingZones = await prisma.zone.findMany({
            where: {
                restaurantId: zone.restaurantId,
                NOT: { id: zoneId },
            },
            select: { id: true, name: true },
        });

        const duplicateZone = siblingZones.find(
            (item) => normaliseZoneName(item.name) === normaliseZoneName(nextName)
        );

        if (duplicateZone) {
            return res.status(409).json({
                error: "A zone with this name already exists for this restaurant.",
            });
        }

        const updated = await prisma.zone.update({
            where: { id: zoneId },
            data: {
                name: nextName,
                description: description == null ? zone.description : description.trim() || null,
            },
        });

        return res.json(updated);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "server error" });
    }
}

async function deleteZone(req, res) {
    try {
        const { zoneId } = req.params;

        const zone = await prisma.zone.findUnique({
            where: { id: zoneId },
            include: { restaurant: true },
        });

        if (!zone) {
            return res.status(404).json({ error: "zone not found" });
        }

        if (zone.restaurant.ownerId !== req.user.userId) {
            return res.status(403).json({ error: "not your zone" });
        }

        const tables = await prisma.table.findMany({
            where: { zoneId },
            select: { id: true },
        });

        const tableIds = tables.map((t) => t.id);

        if (tableIds.length > 0) {
            const blockingReservation = await prisma.reservation.findFirst({
                where: {
                    tableId: { in: tableIds },
                    status: { in: ["PENDING", "CONFIRMED"] },
                },
                select: { id: true },
            });

            if (blockingReservation) {
                return res.status(409).json({
                    error: "This zone still has pending or confirmed reservations. Cancel them first before deleting the zone.",
                });
            }
        }

        await prisma.$transaction(async (tx) => {
            if (tableIds.length > 0) {
                const reservations = await tx.reservation.findMany({
                    where: { tableId: { in: tableIds } },
                    select: { id: true },
                });

                const reservationIds = reservations.map((r) => r.id);

                if (reservationIds.length > 0) {
                    await tx.reservationChangeRequest.deleteMany({
                        where: { reservationId: { in: reservationIds } },
                    });

                    await tx.qrToken.deleteMany({
                        where: { reservationId: { in: reservationIds } },
                    });

                    await tx.reservation.deleteMany({
                        where: { id: { in: reservationIds } },
                    });
                }

                await tx.tableUnavailability.deleteMany({
                    where: { tableId: { in: tableIds } },
                });

                await tx.table.deleteMany({
                    where: { id: { in: tableIds } },
                });
            }

            await tx.zone.delete({
                where: { id: zoneId },
            });
        });

        return res.status(204).send();
    } catch (error) {
        if (error.code === "P2003") {
            return res.status(409).json({
                error: "This zone still has related reservation records. Cancel the reservations first before deleting the zone.",
            });
        }

        console.error(error);
        return res.status(500).json({ error: "server error" });
    }
}

module.exports = { createZone, listZones, updateZone, deleteZone };