export function toDateKey(value) {
    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function fromDateKey(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

export function formatSelectedDate(value) {
    if (!value) return "";

    return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

export function formatDateTime(value) {
    if (!value) return "No change";

    return new Date(value).toLocaleString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatMonthLabel(date) {
    return date.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
    });
}

export function getDayLabel(date, index) {
    if (index === 0) return "Today";
    if (index === 1) return "Tomorrow";

    return date.toLocaleDateString("en-GB", {
        weekday: "short",
    });
}

export function getDateLabel(date) {
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
    });
}

export function isSameMonth(date, monthDate) {
    return (
        date.getFullYear() === monthDate.getFullYear() &&
        date.getMonth() === monthDate.getMonth()
    );
}

export function buildCalendarDays(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const gridStart = new Date(year, month, 1 - startOffset);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);
        return date;
    });
}