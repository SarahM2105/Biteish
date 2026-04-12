import React from "react";

export default function DashboardHero({ name, dashboard }) {
    return (
        <section className="owner-dashboard-header">
            <div className="owner-dashboard-header__copy dashboard-panel">
                <p className="owner-dashboard-header__eyebrow">Owner dashboard</p>
                <h1 className="owner-dashboard-header__title">Welcome back, {name}</h1>
                <p className="owner-dashboard-header__text">
                    {dashboard.restaurant?.name
                        ? `${dashboard.restaurant.name}${dashboard.restaurant.location ? ` · ${dashboard.restaurant.location}` : ""}`
                        : "Your restaurant dashboard"}
                </p>

                <div className="owner-dashboard-header__chips">
                    <span className="owner-chip">
                        {dashboard.summary.occupiedGuests} guests checked in
                    </span>
                    <span className="owner-chip">
                        {dashboard.summary.occupiedTables} tables occupied
                    </span>
                    <span className="owner-chip">
                        {dashboard.summary.pendingBookingsCount} pending bookings
                    </span>
                    <span className="owner-chip">
                        {dashboard.summary.pendingChangeRequestsCount} change requests
                    </span>
                </div>
            </div>

            <div className="dashboard-panel owner-live-card">
                <p className="owner-panel-kicker">Live summary</p>
                <div className="owner-live-card__grid">
                    <div>
                        <span>Checked-in guests</span>
                        <strong>{dashboard.summary.occupiedGuests}</strong>
                    </div>
                    <div>
                        <span>Occupied tables</span>
                        <strong>{dashboard.summary.occupiedTables}</strong>
                    </div>
                    <div>
                        <span>Pending bookings</span>
                        <strong>{dashboard.summary.pendingBookingsCount}</strong>
                    </div>
                    <div>
                        <span>Change requests</span>
                        <strong>{dashboard.summary.pendingChangeRequestsCount}</strong>
                    </div>
                </div>
            </div>
        </section>
    );
}