import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import { logout } from "../../components/utils/logout";
import useCustomerNotifications from "../../hooks/useCustomerNotifications";
import "../../components/Customer/Notifications/CustomerNotifications.css";
export default function CustomerNotifications() {
    const name = localStorage.getItem("name") || "customer";
    const navigate = useNavigate();
    const [active, setActive] = useState("Notifications");
    const [collapsed, setCollapsed] = useState(true);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [filter, setFilter] = useState("all");

    const { notifications, loading, status, summary } = useCustomerNotifications();

    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate);
            return;
        }
        setActive(label);
    }

    const filteredNotifications = useMemo(() => {
        if (filter === "pending") {
            return notifications.filter((item) => item.kind === "pending");
        }

        if (filter === "upcoming") {
            return notifications.filter(
                (item) => item.kind === "confirmed" || item.kind === "upcoming"
            );
        }

        if (filter === "updates") {
            return notifications.filter(
                (item) =>
                    item.kind === "declined" ||
                    item.kind === "cancelled" ||
                    item.kind === "checked-in"
            );
        }

        return notifications;
    }, [filter, notifications]);

    return (
        <AppLayout
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((prev) => !prev)}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            sideNav={
                <CustomerSideNav
                    active={active}
                    onNavigate={handleNavigate}
                    collapsed={collapsed}
                />
            }
        >
            <div className="customer-notifications-page">
                <section className="dashboard-panel customer-notifications-hero">
                    <div>
                        <h1 className="customer-notifications-hero__title">Notifications</h1>
                        <p className="customer-notifications-hero__subtitle">
                            Stay updated on booking requests, confirmations, reminders and changes.
                        </p>
                    </div>

                    <div className="customer-notifications-summary">
                        <div className="customer-notifications-summary__card">
                            <span className="customer-notifications-summary__value">{summary.total}</span>
                            <span className="customer-notifications-summary__label">Total</span>
                        </div>
                        <div className="customer-notifications-summary__card">
                            <span className="customer-notifications-summary__value">{summary.pending}</span>
                            <span className="customer-notifications-summary__label">Pending</span>
                        </div>
                        <div className="customer-notifications-summary__card">
                            <span className="customer-notifications-summary__value">{summary.upcoming}</span>
                            <span className="customer-notifications-summary__label">Upcoming</span>
                        </div>
                        <div className="customer-notifications-summary__card">
                            <span className="customer-notifications-summary__value">{summary.updates}</span>
                            <span className="customer-notifications-summary__label">Updates</span>
                        </div>
                    </div>
                </section>

                <section className="dashboard-panel customer-notifications-toolbar">
                    <div className="customer-notifications-filters">
                        <button
                            type="button"
                            className={`customer-notifications-filter ${filter === "all" ? "is-active" : ""}`}
                            onClick={() => setFilter("all")}
                        >
                            All
                        </button>
                        <button
                            type="button"
                            className={`customer-notifications-filter ${filter === "pending" ? "is-active" : ""}`}
                            onClick={() => setFilter("pending")}
                        >
                            Pending
                        </button>
                        <button
                            type="button"
                            className={`customer-notifications-filter ${filter === "upcoming" ? "is-active" : ""}`}
                            onClick={() => setFilter("upcoming")}
                        >
                            Upcoming
                        </button>
                        <button
                            type="button"
                            className={`customer-notifications-filter ${filter === "updates" ? "is-active" : ""}`}
                            onClick={() => setFilter("updates")}
                        >
                            Updates
                        </button>
                    </div>
                </section>

                {status && (
                    <div className="dashboard-panel customer-notifications-status">
                        {status}
                    </div>
                )}

                {loading ? (
                    <div className="dashboard-panel customer-notifications-empty">
                        Loading notifications...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <section className="dashboard-panel customer-notifications-empty">
                        <h2>You’re all caught up</h2>
                        <p>
                            There are no customer notifications in this view right now.
                        </p>
                        <div className="customer-notifications-empty__actions">
                            <button
                                type="button"
                                className="customer-notifications-action customer-notifications-action--primary"
                                onClick={() => navigate("/customer/search")}
                            >
                                Browse restaurants
                            </button>
                            <button
                                type="button"
                                className="customer-notifications-action customer-notifications-action--secondary"
                                onClick={() => navigate("/customer/myBookings")}
                            >
                                View my bookings
                            </button>
                        </div>
                    </section>
                ) : (
                    <div className="customer-notifications-list">
                        {filteredNotifications.map((item) => (
                            <article
                                key={`${item.kind}-${item.id}`}
                                className={`dashboard-panel customer-notification-card customer-notification-card--${item.kind}`}
                            >
                                <div className="customer-notification-card__top">
                                    <div className="customer-notification-card__heading">
                                        <span className="customer-notification-card__badge">
                                            {item.kind === "pending" && "Pending"}
                                            {item.kind === "confirmed" && "Confirmed"}
                                            {item.kind === "upcoming" && "Reminder"}
                                            {item.kind === "declined" && "Declined"}
                                            {item.kind === "cancelled" && "Cancelled"}
                                            {item.kind === "checked-in" && "Checked in"}
                                        </span>
                                        <h2>{item.title}</h2>
                                    </div>

                                    <div className="customer-notification-card__meta">
                                        <span>{item.restaurantName}</span>
                                        <span>{item.bookingDate}</span>
                                        <span>{item.bookingTime}</span>
                                    </div>
                                </div>

                                <p className="customer-notification-card__message">{item.message}</p>

                                <div className="customer-notification-card__details">
                                    <span>Table: {item.tableName}</span>
                                    <span>Party size: {item.partySize}</span>
                                    <span>Status: {item.status}</span>
                                </div>

                                <div className="customer-notification-card__actions">
                                    <button
                                        type="button"
                                        className="customer-notifications-action customer-notifications-action--primary"
                                        onClick={() => navigate(item.actionTarget)}
                                    >
                                        {item.actionLabel}
                                    </button>

                                    {item.status === "CONFIRMED" && (
                                        <button
                                            type="button"
                                            className="customer-notifications-action customer-notifications-action--secondary"
                                            onClick={() => navigate("/customer/myBookings")}
                                        >
                                            Show QR
                                        </button>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}