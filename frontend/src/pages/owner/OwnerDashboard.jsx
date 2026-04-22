import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import "../../components/Owner/Dashboard/css/Dashboard.css";
import { useTheme } from "../../ThemeContext";
import useOwnerDashboard from "../../hooks/useOwnerDashboard";
import DashboardHeader from "../../components/Owner/Dashboard/Header";
import TableLayoutPanel from "../../components/Owner/Dashboard/TableLayoutPanel";
import ExpectedCustomersPanel from "../../components/Owner/Dashboard/ExpectedCustomersPanel";
import PendingActivityPanel from "../../components/Owner/Dashboard/PendingActivityPanel";
import QuickActionsPanel from "../../components/Owner/Dashboard/QuickActionsPanel";
import LateArrivalsPanel from "../../components/Owner/Dashboard/LateArrivalsPanel";

function OwnerDashboard() {
    const name = localStorage.getItem("name") || "owner";
    const navigate = useNavigate();

    const [collapsed, setCollapsed] = useState(false);
    const { isDarkMode, setIsDarkMode } = useTheme();
    const [active, setActive] = useState("Dashboard");

    const {
        loading,
        status,
        dashboard,
        quickActions,
    } = useOwnerDashboard();

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
            <div className="owner-dashboard-page">
                {loading ? (
                    <section className="dashboard-panel">
                        <h3>Loading dashboard...</h3>
                    </section>
                ) : (
                    <>
                        <DashboardHeader name={name} dashboard={dashboard} />

                        {status && (
                            <section className="dashboard-panel">
                                <h3>{status}</h3>
                            </section>
                        )}

                        <section className="owner-dashboard-grid">
                            <div className="owner-panel--wide">
                                <TableLayoutPanel
                                    layoutSummary={dashboard.layoutSummary}
                                    zoneSummaries={dashboard.zoneSummaries}
                                    zones={dashboard.zones}
                                />
                            </div>

                            <div className="owner-panel--wide">
                                <LateArrivalsPanel />
                            </div>

                            <ExpectedCustomersPanel
                                expectedGuests={dashboard.expectedGuests}
                            />

                            <PendingActivityPanel
                                summary={dashboard.summary}
                            />

                            <QuickActionsPanel
                                quickActions={quickActions}
                                onNavigate={navigate}
                            />
                        </section>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

export default OwnerDashboard;