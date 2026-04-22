import React from "react";

export default function DashboardHeader({ name, dashboard }) {
    const restaurantName = dashboard.restaurant?.name || "Your restaurant";
    const restaurantLocation = dashboard.restaurant?.location || "";

    return (
        <section className="owner-dashboard-header">
            <div className="owner-dashboard-header__copy dashboard-panel">
                <div className="owner-dashboard-header__copy-inner">
                    <p className="owner-dashboard-header__eyebrow">Owner dashboard</p>

                    <h1 className="owner-dashboard-header__title">
                        Welcome back, {name}
                    </h1>

                    <p className="owner-dashboard-header__text">
                        {restaurantName}
                        {restaurantLocation ? ` · ${restaurantLocation}` : ""}
                    </p>

                    <p className="owner-dashboard-header__support">
                        Manage bookings, monitor activity, and keep your restaurant
                        running smoothly from one place.
                    </p>
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