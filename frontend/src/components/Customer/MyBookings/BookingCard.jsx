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

    const activeChangeRequest =
        Array.isArray(b.ReservationChangeRequest)
            ? b.ReservationChangeRequest.find((request) => request.status === "PENDING")
            : null;

    const hasChangeRequest = Boolean(activeChangeRequest);

    return (
        <article className="booking-card">
            <div className="booking-card__top">
                <div className="booking-card__identity">
                    <div className="booking-card__avatar">
                        {(b.restaurant?.name || "R").slice(0, 1).toUpperCase()}
                    </div>

                    <div className="booking-card__content">
                        <h3 className="booking-card__title">
                            {b.restaurant?.name || "Restaurant"}
                        </h3>

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

                        <p className="booking-card__summary">
                            Party of {b.partySize} · Table {b.table?.name || "Not assigned"}
                        </p>
                    </div>
                </div>

                <div className="booking-card__status-wrap">
                    <div className={`booking-card__status ${getStatusClass(b.status)}`}>
                        {b.status}
                    </div>

                    {hasChangeRequest && (
                        <div className="booking-card__status booking-card__status--change">
                            Change pending
                        </div>
                    )}
                </div>
            </div>

            {b.notes && <div className="booking-card__notes">{b.notes}</div>}

            <div className="booking-card__actions">
                {canShowQr(b) && (
                    <button
                        type="button"
                        className="booking-card__button booking-card__button--primary"
                        onClick={() => handleShowQr(b.id)}
                    >
                        View QR
                    </button>
                )}

                {canEdit(b) && (
                    <button
                        type="button"
                        className="booking-card__button booking-card__button--secondary"
                        onClick={() => handleRequestChange(b.id)}
                    >
                        {hasChangeRequest ? "View change request" : "Request change"}
                    </button>
                )}

                {canCancel(b) && (
                    <button
                        type="button"
                        className="booking-card__button booking-card__button--ghost"
                        onClick={() => handleCancel(b.id)}
                    >
                        Cancel
                    </button>
                )}
            </div>
        </article>
    );
}