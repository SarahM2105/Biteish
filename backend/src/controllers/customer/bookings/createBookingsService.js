const { prisma } = require("../../../prismaClient");
const { bookingsOverlap } = require("../../../utils/bookingsOverlap");

function getBookingDayName(date) {
    return date
        .toLocaleDateString("en-GB", { weekday: "long" })
        .toUpperCase();
}

function buildOpeningWindow(openingHour, bookingStart) {
    const [openHour, openMinute] = String(openingHour.opensAt).split(":").map(Number);
    const [closeHour, closeMinute] = String(openingHour.closesAt).split(":").map(Number);

    const opensAt = new Date(bookingStart);
    opensAt.setHours(openHour, openMinute, 0, 0);

    const closesAt = new Date(bookingStart);
    closesAt.setHours(closeHour, closeMinute, 0, 0);

    if (closesAt <= opensAt) {
        closesAt.setDate(closesAt.getDate() + 1);
    }

    return { opensAt, closesAt };
}

function validateCreateBookingInput({ startsAt, partySize }) {
    if (!startsAt || !partySize) {
        return {
            error: {
                status: 400,
                message: "startsAt and partySize are required",
            },
        };
    }

    const bookingStart = new Date(startsAt);

    if (Number.isNaN(bookingStart.getTime())) {
        return {
            error: {
                status: 400,
                message: "Invalid booking start date or time",
            },
        };
    }

    if (bookingStart <= new Date()) {
        return {
            error: {
                status: 400,
                message: "Bookings must be made for a future date and time",
            },
        };
    }

    const numericPartySize = Number(partySize);

    if (!Number.isInteger(numericPartySize) || numericPartySize < 1) {
        return {
            error: {
                status: 400,
                message: "Party size must be a whole number of at least 1",
            },
        };
    }

    return {
        bookingStart,
        numericPartySize,
    };
}

async function createBookingReservation({
                                            tableId,
                                            userId,
                                            bookingStart,
                                            numericPartySize,
                                            notes,
                                        }) {
    return prisma.$transaction(
        async (tx) => {
            const table = await tx.table.findUnique({
                where: { id: tableId },
                include: {
                    restaurant: {
                        include: {
                            bookingRule: true,
                            openingHours: true,
                        },
                    },
                },
            });

            if (!table) {
                return {
                    error: { status: 404, message: "tableId not found" },
                };
            }

            if (!table.active) {
                return {
                    error: { status: 400, message: "This table is currently inactive" },
                };
            }

            if (!table.reservable) {
                return {
                    error: {
                        status: 400,
                        message: "This table is not available for online booking",
                    },
                };
            }

            if (table.restaurant.ownerId === userId) {
                return {
                    error: {
                        status: 403,
                        message: "you cannot book your own table",
                    },
                };
            }

            if (numericPartySize > Number(table.capacity)) {
                return {
                    error: {
                        status: 400,
                        message: "Selected table is too small for this party size",
                    },
                };
            }

            const bookingRule = table.restaurant.bookingRule;
            const slotMinutes = bookingRule?.slotMinutes ?? 120;
            const turnoverMinutes = bookingRule?.turnoverMinutes ?? 15;
            const maxPartySize = bookingRule?.maxPartySize;
            const daysAhead = bookingRule?.daysAhead;

            if (
                maxPartySize !== undefined &&
                maxPartySize !== null &&
                numericPartySize > Number(maxPartySize)
            ) {
                return {
                    error: {
                        status: 400,
                        message: `This restaurant accepts bookings up to ${maxPartySize} guests`,
                    },
                };
            }

            if (
                daysAhead !== undefined &&
                daysAhead !== null &&
                Number.isFinite(Number(daysAhead))
            ) {
                const latestBookableDate = new Date();
                latestBookableDate.setHours(23, 59, 59, 999);
                latestBookableDate.setDate(
                    latestBookableDate.getDate() + Number(daysAhead)
                );

                if (bookingStart > latestBookableDate) {
                    return {
                        error: {
                            status: 400,
                            message: `Bookings can only be made up to ${daysAhead} days in advance`,
                        },
                    };
                }
            }

            const bookingEnd = new Date(
                bookingStart.getTime() + slotMinutes * 60000
            );

            const hours = table.restaurant.openingHours || [];
            const bookingDay = getBookingDayName(bookingStart);

            if (hours.length > 0) {
                const openingHour = hours.find((h) => h.day === bookingDay);

                if (!openingHour) {
                    return {
                        error: {
                            status: 400,
                            message: `Restaurant is closed on ${bookingDay}`,
                        },
                    };
                }

                const { opensAt, closesAt } = buildOpeningWindow(
                    openingHour,
                    bookingStart
                );

                if (bookingStart < opensAt || bookingEnd > closesAt) {
                    return {
                        error: {
                            status: 400,
                            message: `Booking must be within opening hours: ${openingHour.opensAt.slice(
                                0,
                                5
                            )} - ${openingHour.closesAt.slice(0, 5)}`,
                        },
                    };
                }
            }

            const turnoverMs = turnoverMinutes * 60000;
            const expandedRequestedStart = new Date(
                bookingStart.getTime() - turnoverMs
            );
            const expandedRequestedEnd = new Date(
                bookingEnd.getTime() + turnoverMs
            );

            const existingReservations = await tx.reservation.findMany({
                where: {
                    tableId,
                    status: { in: ["PENDING", "CONFIRMED"] },
                    startsAt: { lt: expandedRequestedEnd },
                    endsAt: { gt: expandedRequestedStart },
                },
                select: {
                    startsAt: true,
                    endsAt: true,
                },
            });

            const reservationConflict = existingReservations.some((reservation) =>
                bookingsOverlap(
                    bookingStart,
                    bookingEnd,
                    new Date(new Date(reservation.startsAt).getTime() - turnoverMs),
                    new Date(new Date(reservation.endsAt).getTime() + turnoverMs)
                )
            );

            if (reservationConflict) {
                return {
                    error: {
                        status: 409,
                        message: "This timeslot has just been taken",
                    },
                };
            }

            const unavailabilityRows = await tx.tableUnavailability.findMany({
                where: {
                    tableId,
                    startsAt: { lt: bookingEnd },
                    endsAt: { gt: bookingStart },
                },
                select: {
                    startsAt: true,
                    endsAt: true,
                    reason: true,
                },
            });

            const unavailable = unavailabilityRows.some((row) =>
                bookingsOverlap(
                    bookingStart,
                    bookingEnd,
                    new Date(row.startsAt),
                    new Date(row.endsAt)
                )
            );

            if (unavailable) {
                return {
                    error: {
                        status: 409,
                        message: "This table is unavailable for the selected time",
                    },
                };
            }

            const reservation = await tx.reservation.create({
                data: {
                    userId,
                    tableId,
                    restaurantId: table.restaurantId,
                    startsAt: bookingStart,
                    endsAt: bookingEnd,
                    partySize: numericPartySize,
                    status: "PENDING",
                    notes: notes?.trim() || null,
                },
            });

            return {
                reservation,
                table,
            };
        },
        {
            isolationLevel: "Serializable",
        }
    );
}

module.exports = {
    validateCreateBookingInput,
    createBookingReservation,
};