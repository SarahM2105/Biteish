import React from "react";

function formatDate(value) {
    if (!value) return "Date unavailable";
    return new Date(value).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}

function formatTime(value) {
    if (!value) return "—";
    return new Date(value).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatTimeRange(start, end) {
    if (!start && !end) return "Time unavailable";
    return `${formatTime(start)}${end ? ` - ${formatTime(end)}` : ""}`;
}

export default function ChangeRequestCard({
                                                      request,
                                                      acting,
                                                      onApprove,
                                                      onDecline,
                                                      onProposeDifferentChange,
                                                  }) {
    const reservation = request.reservation;

    return (
        <article className="owner-request-card">
            <div className="owner-request-card__top">
                <div>
                    <p className="owner-request-card__kicker">Owner update</p>
                    <h3>{reservation?.restaurant?.name || "Restaurant"}</h3>
                    <p className="owner-request-card__subtext">
                        Review the proposed booking change from the restaurant.
                    </p>
                </div>

                <span className="owner-request-card__badge">{request.status}</span>
            </div>

            <div className="owner-request-compare">
                <div className="owner-request-compare__card">
                    <span className="owner-request-compare__label">Current</span>
                    <div className="owner-request-compare__row">
                        <strong>Date</strong>
                        <span>{formatDate(reservation?.startsAt)}</span>
                    </div>
                    <div className="owner-request-compare__row">
                        <strong>Time</strong>
                        <span>{formatTimeRange(reservation?.startsAt, reservation?.endsAt)}</span>
                    </div>
                    <div className="owner-request-compare__row">
                        <strong>Party</strong>
                        <span>{reservation?.partySize ?? "—"}</span>
                    </div>
                    <div className="owner-request-compare__row">
                        <strong>Notes</strong>
                        <span>{reservation?.notes || "—"}</span>
                    </div>
                </div>

                <div className="owner-request-compare__card owner-request-compare__card--accent">
                    <span className="owner-request-compare__label">Proposed</span>
                    <div className="owner-request-compare__row">
                        <strong>Date</strong>
                        <span>{formatDate(request.newStartsAt || reservation?.startsAt)}</span>
                    </div>
                    <div className="owner-request-compare__row">
                        <strong>Time</strong>
                        <span>
                            {formatTimeRange(
                                request.newStartsAt || reservation?.startsAt,
                                request.newEndsAt || reservation?.endsAt
                            )}
                        </span>
                    </div>
                    <div className="owner-request-compare__row">
                        <strong>Party</strong>
                        <span>{request.newPartySize ?? reservation?.partySize ?? "—"}</span>
                    </div>
                    <div className="owner-request-compare__row">
                        <strong>Notes</strong>
                        <span>{request.newNotes ?? reservation?.notes ?? "—"}</span>
                    </div>
                </div>
            </div>

            <div className="owner-request-actions">
                <button
                    type="button"
                    className="owner-request-button owner-request-button--primary"
                    onClick={onApprove}
                    disabled={acting}
                >
                    {acting ? "Working..." : "Accept change"}
                </button>

                <button
                    type="button"
                    className="owner-request-button owner-request-button--secondary"
                    onClick={onDecline}
                    disabled={acting}
                >
                    {acting ? "Working..." : "Decline change"}
                </button>

                <button
                    type="button"
                    className="owner-request-button owner-request-button--secondary"
                    onClick={onProposeDifferentChange}
                    disabled={acting}
                >
                    {acting ? "Working..." : "Propose different change"}
                </button>
            </div>
        </article>
    );
}