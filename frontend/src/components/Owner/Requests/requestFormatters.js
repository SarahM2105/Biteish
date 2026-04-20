export function formatDate(value) {
    if (!value) return "Date unavailable";
    return new Date(value).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

export function formatTime(value) {
    if (!value) return "—";
    return new Date(value).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatTimeRange(start, end) {
    if (!start && !end) return "Time unavailable";
    return `${formatTime(start)}${end ? ` - ${formatTime(end)}` : ""}`;
}