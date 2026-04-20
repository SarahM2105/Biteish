import React from "react";
import {
    formatFullDate,
    formatTimeOnly,
} from "./editBookingHelpers";

export default function CurrentBookingPanel({ booking }) {
    if (!booking) return null;

    return (
        <section className="edit-booking-current">
            <div className="edit-booking-current__top">
                <div>
                    <p className="edit-booking-current__eyebrow">Current booking</p>
                    <h2 className="edit-booking-current__title">
                        {booking.restaurant?.name || "Restaurant"}
                    </h2>
                </div>

                <div className="edit-booking-current__status">
                    {booking.status || "BOOKING"}
                </div>
            </div>

            <div className="edit-booking-current__grid">
                <div className="edit-booking-current__item">
                    <span className="edit-booking-current__label">Date</span>
                    <span className="edit-booking-current__value">
                        {formatFullDate(booking.startsAt)}
                    </span>
                </div>

                <div className="edit-booking-current__item">
                    <span className="edit-booking-current__label">Time</span>
                    <span className="edit-booking-current__value">
                        {formatTimeOnly(booking.startsAt)}
                    </span>
                </div>

                <div className="edit-booking-current__item">
                    <span className="edit-booking-current__label">Party size</span>
                    <span className="edit-booking-current__value">
                        {booking.partySize}
                    </span>
                </div>

                <div className="edit-booking-current__item">
                    <span className="edit-booking-current__label">Table</span>
                    <span className="edit-booking-current__value">
                        {booking.table?.name || "Not assigned"}
                    </span>
                </div>
            </div>
        </section>
    );
}