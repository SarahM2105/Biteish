import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import useOwnerNotifications from "../../hooks/useOwnerNotifications";
import NotificationsHeader from "../../components/Notifications/Header";
import NotificationsSummaryCards from "../../components/Notifications/SummaryCards";
import FilterTabs from "../../components/Notifications/FilterTabs";
import NotificationCard from "../../components/Notifications/NotificationCard";
import NotificationsEmptyState from "../../components/Notifications/EmptyState";
import "../../components/Notifications/Notifications.css";
import { useTheme } from "../../ThemeContext";

export default function OwnerNotifications() {
    const navigate = useNavigate();
    const [active, setActive] = useState("Notifications");
    const [collapsed, setCollapsed] = useState(false);
    const { isDarkMode, setIsDarkMode } = useTheme();
    const [filter, setFilter] = useState("all");

    const { notifications, loading, status, summary } = useOwnerNotifications();

    function handleNavigate(label) {
        setActive(label);
    }

    const filters = [
        { key: "all", label: "All" },
        { key: "requests", label: "Requests" },
        { key: "changes", label: "Changes" },
        { key: "alerts", label: "Service alerts" },
        { key: "cancellations", label: "Cancellations" },
    ];

    const summaryCards = [
        { label: "Total", value: summary.total },
        { label: "Requests", value: summary.requests },
        { label: "Changes", value: summary.changes },
        { label: "Alerts", value: summary.alerts },
        { label: "Cancellations", value: summary.cancellations },
    ];

    const filteredNotifications = useMemo(() => {
        if (filter === "all") return notifications;
        return notifications.filter((item) => item.category === filter);
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
                <OwnerSideNav
                    active={active}
                    onNavigate={handleNavigate}
                    collapsed={collapsed}
                />
            }
        >
            <div className="notifications-page">
                <NotificationsHeader
                    title="Notifications"
                    subtitle="Stay on top of booking requests, change requests, service alerts and cancellations."
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
                        text="There are no owner notifications in this view right now."
                        actions={[
                            {
                                label: "Open requests",
                                variant: "primary",
                                onClick: () => navigate("/owner/request"),
                            },
                            {
                                label: "View bookings",
                                variant: "secondary",
                                onClick: () => navigate("/owner/bookings"),
                            },
                        ]}
                    />
                ) : (
                    <div className="notifications-list">
                        {filteredNotifications.map((item) => (
                            <NotificationCard
                                key={item.id}
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