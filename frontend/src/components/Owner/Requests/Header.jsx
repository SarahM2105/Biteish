import React from "react";

export default function header({ pendingNewCount, pendingChangesCount }) {
    return (
        <section className="owner-requests-header dashboard-panel">
            <div className="owner-requests-header__copy">
                <p className="owner-requests-header__eyebrow">Owner workflow</p>
                <h1 className="owner-requests-header__title">Requests</h1>
                <p className="owner-requests-header__text">
                    Review new bookings and booking change requests from one place.
                </p>
            </div>

            <div className="owner-requests-header__chips">
                <span className="owner-chip">{pendingNewCount} pending bookings</span>
                <span className="owner-chip">{pendingChangesCount} booking update requests</span>
            </div>
        </section>
    );
}