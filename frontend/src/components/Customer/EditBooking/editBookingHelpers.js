export function toLocalDateInput(value) {
    if (!value) return "";
    const date = new Date(value);
    return date.toISOString().slice(0, 10);
}

export function toLocalTimeInput(value) {
    if (!value) return "";
    const date = new Date(value);
    return date.toISOString().slice(11, 16);
}

export function formatDateTime(value) {
    if (!value) return "No change";
    return new Date(value).toLocaleString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatFullDate(value) {
    if (!value) return "No date";
    return new Date(value).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function formatTimeOnly(value) {
    if (!value) return "No time";
    return new Date(value).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
}