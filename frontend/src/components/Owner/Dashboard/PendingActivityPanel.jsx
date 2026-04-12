import React from "react";

export default function PendingActivityPanel({ summary }) {
    return (
        <section className="dashboard-panel owner-panel">
            <p className="owner-panel-kicker">Pending activity</p>
            <h3>What needs attention</h3>

            <div className="owner-activity-list">
                <div className="owner-activity-item">
                    <span>Pending booking requests</span>
                    <strong>{summary.pendingBookingsCount}</strong>
                </div>
                <div className="owner-activity-item">
                    <span>Pending change requests</span>
                    <strong>{summary.pendingChangeRequestsCount}</strong>
                </div>
                <div className="owner-activity-item">
                    <span>Checked-in reservations</span>
                    <strong>{summary.activeReservations}</strong>
                </div>
            </div>
        </section>
    );
}