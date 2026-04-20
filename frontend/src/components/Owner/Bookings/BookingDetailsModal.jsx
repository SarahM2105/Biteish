import React from "react";
import {
    formatDateTime,
    formatFullDate,
    formatTableLabel,
    getBookingSourceLabel,
    getBookingStatus,
    getDisplayName,
    getStatusClass,
} from "./BookingHelpers";

export default function BookingDetailsModal({ booking, isOpen, onClose }) {
    if (!isOpen || !booking) return null;

    return (
        <div className="owner-bookings-modal-backdrop" onClick={onClose}>
            <div
                className="owner-bookings-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="owner-bookings-modal__header">
                    <div>
                        <p className="owner-bookings-modal__eyebrow">
                            {booking.restaurant?.name || "Restaurant"}
                        </p>
                        <h3>{getDisplayName(booking)}</h3>
                        <p className="owner-bookings-modal__subtext">
                            {formatFullDate(booking.startsAt)}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="owner-bookings-modal__close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="owner-bookings-modal__status-row">
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

                <div className="owner-bookings-modal__grid">
                    <div className="owner-bookings-modal__item">
                        <span>Booking type</span>
                        <strong>{getBookingSourceLabel(booking)}</strong>
                    </div>

                    <div className="owner-bookings-modal__item">
                        <span>Customer</span>
                        <strong>{getDisplayName(booking)}</strong>
                    </div>

                    <div className="owner-bookings-modal__item">
                        <span>Start time</span>
                        <strong>{formatDateTime(booking.startsAt)}</strong>
                    </div>

                    <div className="owner-bookings-modal__item">
                        <span>End time</span>
                        <strong>{formatDateTime(booking.endsAt)}</strong>
                    </div>

                    <div className="owner-bookings-modal__item">
                        <span>Party size</span>
                        <strong>{booking.partySize}</strong>
                    </div>

                    <div className="owner-bookings-modal__item">
                        <span>Table</span>
                        <strong>{formatTableLabel(booking.table)}</strong>
                    </div>

                    <div className="owner-bookings-modal__item">
                        <span>Zone</span>
                        <strong>{booking.table?.zone?.name || "No zone"}</strong>
                    </div>

                    <div className="owner-bookings-modal__item">
                        <span>Customer email</span>
                        <strong>{booking.user?.email || "No linked account"}</strong>
                    </div>

                    <div className="owner-bookings-modal__item">
                        <span>Checked in at</span>
                        <strong>
                            {booking.checkedInAt
                                ? formatDateTime(booking.checkedInAt)
                                : "Not checked in"}
                        </strong>
                    </div>

                    <div className="owner-bookings-modal__item">
                        <span>Reservation status</span>
                        <strong>{booking.status}</strong>
                    </div>
                </div>

                <div className="owner-bookings-modal__notes">
                    <span>Notes</span>
                    <p>{booking.notes || "No notes for this booking."}</p>
                </div>

                <div className="owner-bookings-modal__actions">
                    <button
                        type="button"
                        className="owner-bookings-modal__button"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}