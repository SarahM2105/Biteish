export function formatDate(dateString) {
    if (!dateString) return "Date Unavailable";
    return new Date(dateString).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
//the one with no year
export function formatShortDate(dateString) {
    if (!dateString) return "Date Unavailable";
    return new Date(dateString).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}
export function formatTime(dateString) {
    if (!dateString) return "Time Unavailable";
    return new Date(dateString).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
}
