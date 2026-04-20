export const CLOSED_STATUSES = ["CANCELLED", "DECLINED", "COMPLETED", "NO_SHOW"];
export const DAY_WINDOW = 7;
export const FUTURE_DISABLED_STATUS_FILTERS = ["CHECKED_IN", "COMPLETED", "NO_SHOW"];

export const BROWSER_STATUS_FILTERS = [
    { value: "ALL", label: "All" },
    { value: "WALK_IN", label: "Walk-in" },
    { value: "ONLINE", label: "Online" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "CHECKED_IN", label: "Checked in" },
    { value: "COMPLETED", label: "Completed" },
    { value: "NO_SHOW", label: "No show" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "DECLINED", label: "Declined" },
];

export function startOfDay(value = new Date()) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}

export function addDays(value, days) {
    const date = new Date(value);
    date.setDate(date.getDate() + days);
    return date;
}

export function toDateKey(value) {
    const date = value instanceof Date ? value : new Date(value);
    return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
}

export function formatDayLabel(value) {
    const date = value instanceof Date ? value : new Date(value);
    const todayKey = toDateKey(new Date());
    const yesterdayKey = toDateKey(addDays(new Date(), -1));
    const tomorrowKey = toDateKey(addDays(new Date(), 1));
    const dateKey = toDateKey(date);

    if (dateKey === todayKey) return "Today";
    if (dateKey === yesterdayKey) return "Yesterday";
    if (dateKey === tomorrowKey) return "Tomorrow";

    return date.toLocaleDateString("en-GB", { weekday: "short" });
}

export function formatDateLabel(value) {
    return new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
    });
}

export function formatFullDate(value) {
    return new Date(value).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function formatDate(value) {
    return new Date(value).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function formatTime(value) {
    return new Date(value).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatDateTime(value) {
    return new Date(value).toLocaleString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatTableLabel(table) {
    if (!table) return "Not assigned";
    if (table.name) return table.name;
    if (table.tableNumber) return `Table ${table.tableNumber}`;
    return "Assigned table";
}

export function getDisplayName(booking) {
    return booking.guestName || booking.user?.name || "Guest";
}

export function getBookingSourceLabel(booking) {
    return booking.isWalkIn || booking.guestName ? "Walk-in" : "Online";
}

export function getBookingStatus(booking) {
    return booking.status;
}

export function getStatusClass(booking) {
    if (booking.status === "CONFIRMED") return "owner-bookings-card__status--confirmed";
    if (booking.status === "PENDING") return "owner-bookings-card__status--pending";
    if (booking.status === "COMPLETED") return "owner-bookings-card__status--completed";
    if (booking.status === "NO_SHOW") return "owner-bookings-card__status--no-show";
    if (booking.status === "CANCELLED") return "owner-bookings-card__status--cancelled";
    if (booking.status === "DECLINED") return "owner-bookings-card__status--declined";
    return "";
}

export function matchesStatusFilter(booking, filterValue) {
    if (filterValue === "ALL") return true;
    if (filterValue === "WALK_IN") return Boolean(booking.isWalkIn || booking.guestName);
    if (filterValue === "ONLINE") return !booking.isWalkIn && !booking.guestName;
    if (filterValue === "CHECKED_IN") return Boolean(booking.checkedInAt);
    if (filterValue === "CONFIRMED") return booking.status === "CONFIRMED" && !booking.checkedInAt;
    if (filterValue === "COMPLETED") return booking.status === "COMPLETED";
    if (filterValue === "NO_SHOW") return booking.status === "NO_SHOW";
    if (filterValue === "CANCELLED") return booking.status === "CANCELLED";
    if (filterValue === "DECLINED") return booking.status === "DECLINED";
    return true;
}

export function matchesSpecificTime(booking, selectedTime) {
    if (!selectedTime) return true;

    const bookingDate = new Date(booking.startsAt);
    const hours = `${bookingDate.getHours()}`.padStart(2, "0");
    const minutes = `${bookingDate.getMinutes()}`.padStart(2, "0");
    const bookingTime = `${hours}:${minutes}`;

    return bookingTime === selectedTime;
}

export function getHistoryReferenceDate(booking) {
    return booking.checkedOutAt || booking.checkedInAt || booking.startsAt || booking.createdAt;
}

export function isHistoryBooking(booking, todayStart) {
    const referenceDate = getHistoryReferenceDate(booking);

    if (!referenceDate) return false;
    if (CLOSED_STATUSES.includes(booking.status)) return true;
    if (booking.checkedInAt) return true;

    return startOfDay(referenceDate).getTime() < todayStart.getTime();
}