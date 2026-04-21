import React, { useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import { useTheme } from "../../ThemeContext";
import { useOwnerAnalytics } from "../../hooks/useOwnerAnalytics";
import AnalyticsMetricSection from "../../components/Owner/Analytics/MetricsSection";
import AnalyticsStatusChart from "../../components/Owner/Analytics/StatusChart";
import "../../components/Owner/Analytics/OwnerAnalytics.css";

export default function OwnerAnalytics() {
    const restaurantName = localStorage.getItem("name") || "Owner";
    const { isDarkMode, setIsDarkMode } = useTheme();

    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("Analytics");

    const {
        loading,
        status,
        todayMetrics,
        todayChartData,
        liveMetrics,
        queueMetrics,
    } = useOwnerAnalytics();

    function handleNavigate(label) {
        setActive(label);
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
            <div className="owner-analytics-page">
                <section className="owner-analytics-hero">
                    <div className="owner-analytics-hero__content">
                        <p className="owner-analytics-hero__eyebrow">{restaurantName}</p>
                        <h1 className="owner-analytics-hero__title">Analytics</h1>
                        <p className="owner-analytics-hero__text">
                            A cleaner analytics view focused on live restaurant activity,
                            owner-side booking queues, and today’s reservation metrics.
                        </p>
                    </div>
                </section>

                {loading && (
                    <div className="owner-analytics-alert owner-analytics-alert--neutral">
                        Loading analytics...
                    </div>
                )}

                {!loading && status.message && (
                    <div
                        className={`owner-analytics-alert ${
                            status.type === "error"
                                ? "owner-analytics-alert--error"
                                : "owner-analytics-alert--neutral"
                        }`}
                    >
                        {status.message}
                    </div>
                )}

                {!loading && !status.message && (
                    <>
                        <AnalyticsMetricSection
                            eyebrow="Today"
                            title="Today's reservation metrics"
                            description="These values are calculated from the owner reservations list for bookings scheduled today."
                            gridClassName="owner-analytics-metrics-grid--four"
                            metrics={todayMetrics}
                        >
                            <AnalyticsStatusChart data={todayChartData} />
                        </AnalyticsMetricSection>

                        <AnalyticsMetricSection
                            eyebrow="Live now"
                            title="Current service metrics"
                            description="These values are calculated from reservation status, checked-in time, and booking time range."
                            gridClassName="owner-analytics-metrics-grid--three"
                            metrics={liveMetrics}
                        />

                        <AnalyticsMetricSection
                            eyebrow="Owner queue"
                            title="Pending actions"
                            description="These values show the items still waiting for owner review."
                            gridClassName="owner-analytics-metrics-grid--two"
                            metrics={queueMetrics}
                        />
                    </>
                )}
            </div>
        </AppLayout>
    );
}