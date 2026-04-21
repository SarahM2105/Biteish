import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import { logout } from "../../components/utils/logout";
import useCustomerNotifications from "../../hooks/useCustomerNotifications";
import NotificationsHeader from "../../components/Notifications/Header";
import NotificationsSummaryCards from "../../components/Notifications/SummaryCards";
import FilterTabs from "../../components/Notifications/FilterTabs";
import NotificationCard from "../../components/Notifications/NotificationCard";
import NotificationsEmptyState from "../../components/Notifications/EmptyState";
import "../../components/Notifications/Notifications.css";
import { useTheme } from "../../ThemeContext";

export default function CustomerNotifications() {
    const navigate = useNavigate();
    const [active, setActive] = useState("Notifications");
    const [collapsed, setCollapsed] = useState(false);
    const { isDarkMode, setIsDarkMode } = useTheme();
    const [filter, setFilter] = useState("all");

    const { notifications, loading, status, summary } = useCustomerNotifications();

    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate);
            return;
        }
        setActive(label);
    }

    const filters = [
        { key: "all", label: "All" },
        { key: "pending", label: "Pending" },
        { key: "upcoming", label: "Upcoming" },
        { key: "updates", label: "Updates" },
    ];

    const summaryCards = [
        { label: "Total", value: summary.total },
        { label: "Pending", value: summary.pending },
        { label: "Upcoming", value: summary.upcoming },
        { label: "Updates", value: summary.updates },
    ];

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

    function handlePrimaryAction(item) {
        if (item.primaryAction?.target) {
            navigate(item.primaryAction.target);
        }
    }

    function handleSecondaryAction(item) {
        if (item.secondaryAction?.target) {
            navigate(item.secondaryAction.target);
        }
    }

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
            <div className="notifications-page">
                <NotificationsHeader
                    title="Notifications"
                    subtitle="Stay updated on booking requests, confirmations, reminders and changes."
                />

                <NotificationsSummaryCards cards={summaryCards} />

                <FilterTabs
                    filters={filters}
                    activeFilter={filter}
                    onChange={setFilter}
                />

                {status && (
                    <div className="dashboard-panel notifications-status">
                        {status}
                    </div>
                )}

                {loading ? (
                    <div className="dashboard-panel notifications-empty">
                        Loading notifications...
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <NotificationsEmptyState
                        title="You’re all caught up"
                        text="There are no notifications in this view right now."
                        actions={[
                            {
                                label: "Browse restaurants",
                                variant: "primary",
                                onClick: () => navigate("/customer/search"),
                            },
                            {
                                label: "View my bookings",
                                variant: "secondary",
                                onClick: () => navigate("/customer/myBookings"),
                            },
                        ]}
                    />
                ) : (
                    <div className="notifications-list">
                        {filteredNotifications.map((item) => (
                            <NotificationCard
                                key={`${item.kind}-${item.id}`}
                                item={item}
                                onPrimaryAction={handlePrimaryAction}
                                onSecondaryAction={handleSecondaryAction}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}