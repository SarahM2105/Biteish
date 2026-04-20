import React from "react";

export default function Hero({ pendingNewCount, pendingChangesCount }) {
    return (
        <section className="owner-requests-hero dashboard-panel">
            <div className="owner-requests-hero__copy">
                <p className="owner-requests-hero__eyebrow">Owner workflow</p>
                <h1 className="owner-requests-hero__title">Requests</h1>
                <p className="owner-requests-hero__text">
                    Review new bookings and booking change requests from one place.
                </p>
            </div>

            <div className="owner-requests-hero__chips">
                <span className="owner-chip">{pendingNewCount} pending bookings</span>
                <span className="owner-chip">{pendingChangesCount} booking update requests</span>
            </div>
        </section>
    );
}