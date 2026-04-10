import React from "react";

function getStatusClass(status) {
    if (status === "CONFIRMED") return "status-confirmed";
    if (status === "PENDING") return "status-pending";
    if (status === "CANCELLED") return "status-cancelled";
    if (status === "DECLINED") return "status-declined";
    if (status === "COMPLETED") return "status-completed";
    if (status === "NO_SHOW") return "status-no-show";
    return "";
}

export default function BookingCard({
                                        b,
                                        canEdit,
                                        canCancel,
                                        canShowQr,
                                        handleRequestChange,
                                        handleShowQr,
                                        handleCancel,
                                    }) {
    const bookingDate = new Date(b.startsAt);
    const hasChangeRequest =
        Array.isArray(b.reservationChangeRequests) &&
        b.reservationChangeRequests.length > 0;
    return (
        <article className="booking-card">
            <div className="booking-card__top">
                <div className="booking-card__identity">
                    <div className="booking-card__avatar">
                        {(b.restaurant?.name || "R").slice(0, 1).toUpperCase()}
                    </div>

                    <div>
                        <h3 className="booking-card__title">{b.restaurant?.name || "Restaurant"}</h3>
                        <p className="booking-card__subtitle">
                            {bookingDate.toLocaleDateString("en-GB", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                            {" · "}
                            {bookingDate.toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>
                </div>

                <div className="booking-card__status-wrap">
                    <div className={`booking-card__status ${getStatusClass(b.status)}`}>
                        {b.status}
                    </div>

                    {hasChangeRequest && (
                        <div className="booking-card__status booking-card__status--change">
                            CHANGE REQUEST
                        </div>
                    )}
                </div>
            </div>

            <div className="booking-card__meta">
                <div className="booking-card__meta-item">
                    <span className="booking-card__meta-label">Party size</span>
                    <span className="booking-card__meta-value">{b.partySize}</span>
                </div>

                <div className="booking-card__meta-item">
                    <span className="booking-card__meta-label">Table</span>
                    <span className="booking-card__meta-value">{b.table?.name || "Not assigned"}</span>
                </div>

                <div className="booking-card__meta-item">
                    <span className="booking-card__meta-label">Booking ID</span>
                    <span className="booking-card__meta-value">{b.id}</span>
                </div>
            </div>

            {b.notes && (
                <div className="booking-card__notes">
                    <span className="booking-card__notes-label">Notes</span>
                    <p className="booking-card__notes-text">{b.notes}</p>
                </div>
            )}

            <div className="booking-card__actions">
                {canEdit(b) && (
                    <button
                        type="button"
                        className="booking-card__button booking-card__button--secondary"
                        onClick={() => handleRequestChange(b.id)}
                    >
                        Request change
                    </button>
                )}

                {canShowQr(b) && (
                    <button
                        type="button"
                        className="booking-card__button booking-card__button--primary"
                        onClick={() => handleShowQr(b.id)}
                    >
                        View QR
                    </button>
                )}

                {canCancel(b) && (
                    <button
                        type="button"
                        className="booking-card__button booking-card__button--ghost"
                        onClick={() => handleCancel(b.id)}
                    >
                        Cancel booking
                    </button>
                )}
            </div>
        </article>
    );
}