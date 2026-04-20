import React from "react";
import {
    formatDate,
    formatTimeRange,
} from "./requestFormatters";

export default function NewBookingCard({ reservation, acting, onApprove, onDecline }) {
    return (
        <article className="owner-request-card">
            <div className="owner-request-card__top">
                <div>
                    <p className="owner-request-card__kicker">New booking</p>
                    <h3>{reservation.user?.name || "Customer"}</h3>
                    <p className="owner-request-card__subtext">
                        {formatDate(reservation.startsAt)} · {formatTimeRange(reservation.startsAt, reservation.endsAt)}
                    </p>
                </div>

                <span className="owner-request-card__badge">
                    {reservation.status}
                </span>
            </div>

            <div className="owner-request-meta">
                <span className="owner-request-pill">
                    Party {reservation.partySize ?? "—"}
                </span>
                <span className="owner-request-pill">
                    {reservation.table?.name || "Table unassigned"}
                </span>
                {reservation.table?.capacity ? (
                    <span className="owner-request-pill">
                        Seats {reservation.table.capacity}
                    </span>
                ) : null}
                {reservation.table?.zone?.name ? (
                    <span className="owner-request-pill">
                        {reservation.table.zone.name}
                    </span>
                ) : null}
            </div>

            {reservation.notes ? (
                <div className="owner-request-note">
                    <strong>Notes:</strong> {reservation.notes}
                </div>
            ) : null}

            <div className="owner-request-actions">
                <button
                    type="button"
                    className="owner-request-button owner-request-button--primary"
                    onClick={onApprove}
                    disabled={acting}
                >
                    {acting ? "Working..." : "Approve"}
                </button>

                <button
                    type="button"
                    className="owner-request-button owner-request-button--secondary"
                    onClick={onDecline}
                    disabled={acting}
                >
                    {acting ? "Working..." : "Decline"}
                </button>
            </div>
        </article>
    );
}