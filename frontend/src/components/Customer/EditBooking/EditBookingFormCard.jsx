import React from "react";

export default function EditBookingFormCard({
                                                activePendingRequest,
                                                isOwnPendingRequest,
                                                status,
                                                submitting,
                                                date,
                                                setDate,
                                                time,
                                                setTime,
                                                durationMins,
                                                setDurationMins,
                                                partySize,
                                                setPartySize,
                                                notes,
                                                setNotes,
                                                onSubmit,
                                                onCancelCurrentRequest,
                                                onBackToBookings,
                                            }) {
    return (
        <form onSubmit={onSubmit} className="edit-booking-form-card">
            <div className="edit-booking-form-card__heading">
                <p className="edit-booking-form-card__eyebrow">Requested changes</p>
                <h2 className="edit-booking-form-card__title">
                    Update your booking details
                </h2>
            </div>

            {activePendingRequest && (
                <div className="edit-booking-feedback edit-booking-feedback--status">
                    {isOwnPendingRequest
                        ? "You already have a pending change request for this reservation. Cancel the current request before submitting a new one."
                        : "The restaurant already has a pending change request for this reservation. Please review that request from your My Bookings page before submitting your own."}
                </div>
            )}

            <div className="edit-booking-form">
                <label className="edit-booking-field">
                    <span className="edit-booking-field__label">New date</span>
                    <input
                        className="edit-booking-field__input"
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        disabled={Boolean(activePendingRequest)}
                    />
                </label>

                <label className="edit-booking-field">
                    <span className="edit-booking-field__label">New time</span>
                    <input
                        className="edit-booking-field__input"
                        type="time"
                        value={time}
                        onChange={(event) => setTime(event.target.value)}
                        disabled={Boolean(activePendingRequest)}
                    />
                </label>

                <label className="edit-booking-field">
                    <span className="edit-booking-field__label">Duration (minutes)</span>
                    <input
                        className="edit-booking-field__input"
                        type="number"
                        min="15"
                        step="15"
                        value={durationMins}
                        onChange={(event) => setDurationMins(Number(event.target.value))}
                        disabled={Boolean(activePendingRequest)}
                    />
                </label>

                <label className="edit-booking-field">
                    <span className="edit-booking-field__label">Party size</span>
                    <input
                        className="edit-booking-field__input"
                        type="number"
                        min="1"
                        value={partySize}
                        onChange={(event) => setPartySize(Number(event.target.value))}
                        disabled={Boolean(activePendingRequest)}
                    />
                </label>

                <label className="edit-booking-field edit-booking-field--full">
                    <span className="edit-booking-field__label">
                        Notes for the restaurant
                    </span>
                    <textarea
                        className="edit-booking-field__input edit-booking-field__textarea"
                        rows={4}
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Add any updates or explanation for your request..."
                        disabled={Boolean(activePendingRequest)}
                    />
                </label>
            </div>

            <div className="edit-booking-notice">
                Your original reservation remains unchanged until the restaurant
                reviews and approves this request.
            </div>

            <div className="edit-booking-actions">
                <button
                    className="edit-booking-button edit-booking-button--primary"
                    type="submit"
                    disabled={submitting || Boolean(activePendingRequest)}
                >
                    {submitting ? "Submitting..." : "Submit change request"}
                </button>

                {isOwnPendingRequest && (
                    <button
                        className="edit-booking-button edit-booking-button--secondary"
                        type="button"
                        onClick={onCancelCurrentRequest}
                        disabled={submitting}
                    >
                        Cancel current request
                    </button>
                )}

                <button
                    className="edit-booking-button edit-booking-button--secondary"
                    type="button"
                    onClick={onBackToBookings}
                    disabled={submitting}
                >
                    Back to bookings
                </button>
            </div>

            {status && (
                <div className="edit-booking-feedback edit-booking-feedback--status">
                    {status}
                </div>
            )}
        </form>
    );
}