export function getSelectedBookingDateTime(date, time) {
    if (!date || !time) return null;

    const safeTime = String(time).length === 5 ? `${time}:00` : String(time);
    const selected = new Date(`${date}T${safeTime}`);

    if (Number.isNaN(selected.getTime())) {
        return null;
    }

    return selected;
}

const DAY_NAMES = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
];

function parseTimeToMinutes(value) {
    if (!value) return null;

    const [hoursRaw, minutesRaw] = String(value).split(":");
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return null;
    }

    return hours * 60 + minutes;
}

function formatTimeLabel(value) {
    if (!value) return "";
    return String(value).slice(0, 5);
}

function getDayNameFromDate(dateValue) {
    const date = new Date(`${dateValue}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return DAY_NAMES[date.getDay()];
}

function getOpeningHoursForDay(openingHours, dateValue) {
    const dayName = getDayNameFromDate(dateValue);

    if (!dayName || !Array.isArray(openingHours)) {
        return null;
    }

    return openingHours.find((entry) => entry.day === dayName) || null;
}

export function validateBookingStep1Input({ form, restaurant }) {
    if (!form.date || !form.time || !form.partySize) {
        return "Please fill in date, time and party size";
    }

    const partySize = Number(form.partySize);

    if (!Number.isFinite(partySize) || partySize < 1) {
        return "Party size must be at least 1";
    }

    const selectedDateTime = getSelectedBookingDateTime(form.date, form.time);

    if (!selectedDateTime) {
        return "Please enter a valid date and time";
    }

    if (selectedDateTime <= new Date()) {
        return "Bookings must be made for a future date and time";
    }

    const bookingRule = restaurant?.bookingRule;

    if (
        bookingRule?.maxPartySize !== undefined &&
        bookingRule?.maxPartySize !== null &&
        partySize > Number(bookingRule.maxPartySize)
    ) {
        return `This restaurant accepts bookings up to ${bookingRule.maxPartySize} guests`;
    }

    if (
        bookingRule?.daysAhead !== undefined &&
        bookingRule?.daysAhead !== null &&
        Number.isFinite(Number(bookingRule.daysAhead))
    ) {
        const latestBookableDate = new Date();
        latestBookableDate.setHours(23, 59, 59, 999);
        latestBookableDate.setDate(
            latestBookableDate.getDate() + Number(bookingRule.daysAhead)
        );

        if (selectedDateTime > latestBookableDate) {
            return `Bookings can only be made up to ${bookingRule.daysAhead} days in advance`;
        }
    }

    const openingHours = Array.isArray(restaurant?.openingHours)
        ? restaurant.openingHours
        : [];

    if (openingHours.length > 0) {
        const openingForDay = getOpeningHoursForDay(openingHours, form.date);

        if (!openingForDay) {
            return "This restaurant is closed on the selected date";
        }

        const bookingMinutes = parseTimeToMinutes(form.time);
        const openMinutes = parseTimeToMinutes(openingForDay.opensAt);
        const closeMinutes = parseTimeToMinutes(openingForDay.closesAt);
        const slotMinutes = Number(bookingRule?.slotMinutes) || 90;

        if (
            bookingMinutes === null ||
            openMinutes === null ||
            closeMinutes === null
        ) {
            return "Unable to validate the restaurant opening hours";
        }

        if (bookingMinutes < openMinutes || bookingMinutes >= closeMinutes) {
            return `Bookings must be within opening hours: ${formatTimeLabel(
                openingForDay.opensAt
            )} - ${formatTimeLabel(openingForDay.closesAt)}`;
        }

        if (bookingMinutes + slotMinutes > closeMinutes) {
            return `This booking would finish after closing time. Please choose an earlier time`;
        }
    }

    return "";
}