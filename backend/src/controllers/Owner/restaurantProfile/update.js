function buildBookingRuleData(bookingRule = {}) {
    return {
        maxPartySize:
            bookingRule.maxPartySize !== undefined
                ? Number(bookingRule.maxPartySize)
                : undefined,
        daysAhead:
            bookingRule.daysAhead !== undefined
                ? Number(bookingRule.daysAhead)
                : undefined,
        slotMinutes:
            bookingRule.slotMinutes !== undefined
                ? Number(bookingRule.slotMinutes)
                : undefined,
        turnoverMinutes:
            bookingRule.turnoverMinutes !== undefined
                ? Number(bookingRule.turnoverMinutes)
                : undefined,
        cancellationCutoffMinutes:
            bookingRule.cancellationCutoffMinutes !== undefined
                ? Number(bookingRule.cancellationCutoffMinutes)
                : undefined,
        graceMinutes:
            bookingRule.graceMinutes !== undefined
                ? Number(bookingRule.graceMinutes)
                : undefined,
    };
}

function buildRestaurantUpdateData({
                                       restaurant,
                                       name,
                                       location,
                                       description,
                                       bookingRule,
                                       spendFieldsWereSent,
                                       parsedEstimatedSpendMin,
                                       parsedEstimatedSpendMax,
                                   }) {
    const updateData = {
        name: name ?? undefined,
        location: location ?? undefined,
        description: description ?? undefined,
    };

    if (spendFieldsWereSent) {
        if (
            parsedEstimatedSpendMin !== null &&
            parsedEstimatedSpendMax !== null
        ) {
            updateData.estimatedSpendMin = parsedEstimatedSpendMin;
            updateData.estimatedSpendMax = parsedEstimatedSpendMax;
            updateData.automaticSpendCalculation = false;
        } else {
            updateData.estimatedSpendMin = null;
            updateData.estimatedSpendMax = null;
            updateData.automaticSpendCalculation = true;
        }
    }

    if (bookingRule) {
        const bookingRuleData = buildBookingRuleData(bookingRule);

        if (restaurant.bookingRule) {
            updateData.bookingRule = {
                update: bookingRuleData,
            };
        } else {
            updateData.bookingRule = {
                create: {
                    maxPartySize: bookingRuleData.maxPartySize ?? 6,
                    daysAhead: bookingRuleData.daysAhead ?? 30,
                    slotMinutes: bookingRuleData.slotMinutes ?? 120,
                    turnoverMinutes: bookingRuleData.turnoverMinutes ?? 15,
                    cancellationCutoffMinutes:
                        bookingRuleData.cancellationCutoffMinutes ?? 120,
                    graceMinutes: bookingRuleData.graceMinutes ?? 15,
                },
            };
        }
    }

    return updateData;
}

function buildValidOpeningHours(openingHours, restaurantId) {
    if (!Array.isArray(openingHours)) {
        return [];
    }

    return openingHours
        .filter(
            (hour) =>
                hour &&
                hour.day !== undefined &&
                hour.day !== null &&
                hour.day !== "" &&
                typeof hour.opensAt === "string" &&
                typeof hour.closesAt === "string"
        )
        .map((hour) => ({
            restaurantId,
            day: hour.day,
            opensAt: hour.opensAt,
            closesAt: hour.closesAt,
        }));
}

module.exports = {
    buildRestaurantUpdateData,
    buildValidOpeningHours,
};