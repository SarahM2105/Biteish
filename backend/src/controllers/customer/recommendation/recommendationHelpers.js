function addWeight(map, value, amount) {
    const key = String(value || "").trim().toLowerCase();
    if (!key) return;
    map.set(key, (map.get(key) || 0) + amount);
}

function incrementCount(map, value, amount = 1) {
    const key = String(value || "").trim();
    if (!key) return;
    map.set(key, (map.get(key) || 0) + amount);
}

function getWeightedAmount(baseWeight, index) {
    const recencyMultiplier = Math.max(0.55, 1 - index * 0.05);
    return baseWeight * recencyMultiplier;
}

function normalise(value, max) {
    if (!max || max <= 0) return 0;
    return value / max;
}

function timeToMinutes(value) {
    if (!value || typeof value !== "string") return null;

    const [hours, minutes] = value.split(":").map(Number);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return null;
    }

    return hours * 60 + minutes;
}

function isRestaurantOpenNow(openingHours = [], now = new Date()) {
    const days = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
    ];

    const today = days[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return openingHours
        .filter((slot) => slot.day === today)
        .some((slot) => {
            const opensAt = timeToMinutes(slot.opensAt);
            const closesAt = timeToMinutes(slot.closesAt);

            if (opensAt === null || closesAt === null) return false;

            if (closesAt <= opensAt) {
                return currentMinutes >= opensAt || currentMinutes < closesAt;
            }

            return currentMinutes >= opensAt && currentMinutes < closesAt;
        });
}

function splitPreferenceText(value) {
    if (!value || typeof value !== "string") return [];

    return value
        .split(/[,/&|;]+/)
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean);
}

function makeSignal(prefix, value) {
    const cleaned = String(value || "").trim().toLowerCase();
    if (!cleaned) return null;
    return `${prefix}:${cleaned}`;
}

function humaniseSignal(signal) {
    return String(signal || "")
        .replace(/^(diet|menu-tag|access|table-access|query):/, "")
        .trim();
}

module.exports = {
    addWeight,
    incrementCount,
    getWeightedAmount,
    normalise,
    timeToMinutes,
    isRestaurantOpenNow,
    splitPreferenceText,
    makeSignal,
    humaniseSignal,
};