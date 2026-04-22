import React from "react";

export default function NotificationsHeader({ title, subtitle }) {
    return (
        <section className="dashboard-panel notifications-header">
            <div>
                <h1 className="notifications-header__title">{title}</h1>
                <p className="notifications-header__subtitle">{subtitle}</p>
            </div>
        </section>
    );
}