import React from "react";

export default function NotificationsHeader({ title, subtitle }) {
    return (
        <section className="dashboard-panel notifications-hero">
            <div>
                <h1 className="notifications-hero__title">{title}</h1>
                <p className="notifications-hero__subtitle">{subtitle}</p>
            </div>
        </section>
    );
}