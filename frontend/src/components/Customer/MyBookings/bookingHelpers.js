export const CLOSED_STATUSES = ["CANCELLED", "COMPLETED", "NO_SHOW"];

export function formatTableLabel(table) {
    if (!table) return "No change";
    if (table.name) return table.name;
    if (table.tableNumber) return `Table ${table.tableNumber}`;
    return "Assigned table";
}

export function formatNotes(value) {
    if (!value || !String(value).trim()) return "No notes";
    return value;
}

export function getOutgoingChangeRequest(booking, userId) {
    return (
        booking?.ReservationChangeRequest?.find(
            (request) =>
                request.status === "PENDING" &&
                String(request.requestedById) === String(userId)
        ) || null
    );
}

export function hasOutgoingChangeRequest(booking, userId) {
    return Boolean(getOutgoingChangeRequest(booking, userId));
}

export function isPastBooking(booking, now) {
    return new Date(booking.startsAt).getTime() < now;
}

export function canEditBooking(booking, now) {
    return !isPastBooking(booking, now) && !CLOSED_STATUSES.includes(booking.status);
}

export function canCancelBooking(booking, now) {
    return !isPastBooking(booking, now) && !CLOSED_STATUSES.includes(booking.status);
}

export function canShowQrForBooking(booking) {
    return booking.status === "CONFIRMED";
}

export function getMarkers(daySummary) {
    if (!daySummary) return [];

    const markers = [];

    if (daySummary.confirmed > 0) {
        markers.push("confirmed");
    }

    if (daySummary.pending > 0) {
        markers.push("pending");
    }

    if (daySummary.completed > 0) {
        markers.push("completed");
    }

    return markers.slice(0, 3);
}