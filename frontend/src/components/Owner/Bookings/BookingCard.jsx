import React from "react";
import {
    formatDate,
    formatTableLabel,
    formatTime,
    getBookingSourceLabel,
    getBookingStatus,
    getDisplayName,
    getStatusClass,
} from "./BookingHelpers";

export default function BookingCard({ booking, onOpen }) {
    return (
        <article className="owner-bookings-card">
            <div className="owner-bookings-card__top">
                <div>
                    <p className="owner-bookings-card__eyebrow">
                        {booking.restaurant?.name || "Restaurant"}
                    </p>
                    <h3>{getDisplayName(booking)}</h3>
                    <p className="owner-bookings-card__meta">
                        {formatDate(booking.startsAt)} · {formatTime(booking.startsAt)}
                    </p>
                </div>

                <div className="owner-bookings-card__status-wrap">
                    <span className={`owner-bookings-card__status ${getStatusClass(booking)}`}>
                        {getBookingStatus(booking)}
                    </span>

                    {booking.checkedInAt && (
                        <span className="owner-bookings-card__checkin-chip">
                            Checked in
                        </span>
                    )}
                </div>
            </div>

            <div className="owner-bookings-card__summary">
                <span>{getBookingSourceLabel(booking)}</span>
                <span>Party {booking.partySize}</span>
                <span>{formatTableLabel(booking.table)}</span>
                <span>{booking.table?.zone?.name || "No zone"}</span>
            </div>

            <div className="owner-bookings-card__actions">
                <button
                    type="button"
                    className="owner-bookings-card__button"
                    onClick={() => onOpen(booking)}
                >
                    View details
                </button>
            </div>
        </article>
    );
}