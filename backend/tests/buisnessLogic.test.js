const test = require("node:test");
const assert = require("node:assert/strict");

const { bookingsOverlap } = require("../src/utils/bookingsOverlap");
const {
    getWeightedAmount,
    timeToMinutes,
    isRestaurantOpenNow,
} = require("../src/controllers/customer/recommendation/recommendationHelpers");

test("bookingsOverlap returns true when bookings overlap", () => {
    const bookingAStart = new Date("2026-05-01T12:00:00.000Z");
    const bookingAEnd = new Date("2026-05-01T13:00:00.000Z");

    const bookingBStart = new Date("2026-05-01T12:30:00.000Z");
    const bookingBEnd = new Date("2026-05-01T13:30:00.000Z");

    assert.equal(
        bookingsOverlap(bookingAStart, bookingAEnd, bookingBStart, bookingBEnd),
        true
    );
});

test("bookingsOverlap returns false when bookings only touch at the boundary", () => {
    const bookingAStart = new Date("2026-05-01T12:00:00.000Z");
    const bookingAEnd = new Date("2026-05-01T13:00:00.000Z");

    const bookingBStart = new Date("2026-05-01T13:00:00.000Z");
    const bookingBEnd = new Date("2026-05-01T14:00:00.000Z");

    assert.equal(
        bookingsOverlap(bookingAStart, bookingAEnd, bookingBStart, bookingBEnd),
        false
    );
});

test("bookingsOverlap returns false when bookings are separate", () => {
    const bookingAStart = new Date("2026-05-01T12:00:00.000Z");
    const bookingAEnd = new Date("2026-05-01T13:00:00.000Z");

    const bookingBStart = new Date("2026-05-01T14:00:00.000Z");
    const bookingBEnd = new Date("2026-05-01T15:00:00.000Z");

    assert.equal(
        bookingsOverlap(bookingAStart, bookingAEnd, bookingBStart, bookingBEnd),
        false
    );
});

test("getWeightedAmount reduces recommendation weight by recency index", () => {
    assert.equal(getWeightedAmount(10, 0), 10);
    assert.equal(getWeightedAmount(10, 1), 9.5);
    assert.equal(getWeightedAmount(10, 5), 7.5);
});

test("getWeightedAmount does not reduce below the minimum multiplier", () => {
    assert.equal(getWeightedAmount(10, 20), 5.5);
});

test("timeToMinutes converts valid time strings", () => {
    assert.equal(timeToMinutes("00:00"), 0);
    assert.equal(timeToMinutes("09:30"), 570);
    assert.equal(timeToMinutes("23:59"), 1439);
});

test("timeToMinutes returns null for invalid values", () => {
    assert.equal(timeToMinutes("bad-time"), null);
    assert.equal(timeToMinutes(""), null);
    assert.equal(timeToMinutes(null), null);
});

test("isRestaurantOpenNow returns true when current time is inside opening hours", () => {
    const openingHours = [
        {
            day: "FRIDAY",
            opensAt: "12:00",
            closesAt: "22:00",
        },
    ];

    const now = new Date("2026-05-01T15:00:00");

    assert.equal(isRestaurantOpenNow(openingHours, now), true);
});

test("isRestaurantOpenNow returns false when current time is outside opening hours", () => {
    const openingHours = [
        {
            day: "FRIDAY",
            opensAt: "12:00",
            closesAt: "22:00",
        },
    ];

    const now = new Date("2026-05-01T23:00:00");

    assert.equal(isRestaurantOpenNow(openingHours, now), false);
});

test("isRestaurantOpenNow handles overnight opening hours", () => {
    const openingHours = [
        {
            day: "FRIDAY",
            opensAt: "18:00",
            closesAt: "02:00",
        },
    ];

    const now = new Date("2026-05-01T23:00:00");

    assert.equal(isRestaurantOpenNow(openingHours, now), true);
});