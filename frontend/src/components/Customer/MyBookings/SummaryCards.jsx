import React from "react";

export default function BookingsSummaryCards({
                                                 upcomingCount,
                                                 pendingCount,
                                                 completedCount,
                                                 pastCount,
                                             }) {
    return (
        <section className="bookings-summary">
            <article className="bookings-summary-card">
                <div className="bookings-summary-card__label">Upcoming</div>
                <div className="bookings-summary-card__value">{upcomingCount}</div>
                <div className="bookings-summary-card__text">Confirmed future bookings</div>
            </article>

            <article className="bookings-summary-card">
                <div className="bookings-summary-card__label">Pending</div>
                <div className="bookings-summary-card__value">{pendingCount}</div>
                <div className="bookings-summary-card__text">Pending and change requests</div>
            </article>

            <article className="bookings-summary-card">
                <div className="bookings-summary-card__label">Completed</div>
                <div className="bookings-summary-card__value">{completedCount}</div>
                <div className="bookings-summary-card__text">Past dining visits</div>
            </article>

            <article className="bookings-summary-card">
                <div className="bookings-summary-card__label">Past</div>
                <div className="bookings-summary-card__value">{pastCount}</div>
                <div className="bookings-summary-card__text">Older reservations</div>
            </article>
        </section>
    );
}