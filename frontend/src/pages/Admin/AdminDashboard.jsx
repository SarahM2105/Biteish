import React, { useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import AdminSideNav from "../../components/AdminSideNav";
import { useNavigate } from "react-router-dom";
import { logout } from "../../components/utils/logout";
import { useTheme } from "../../ThemeContext";
import "../../components/Admin/Dashboard.css";

function AdminDashboard() {
    const name = localStorage.getItem("name") || "admin";
    const [active, setActive] = useState("Dashboard");
    const [collapsed, setCollapsed] = useState(false);
    const { isDarkMode, setIsDarkMode } = useTheme();
    const navigate = useNavigate();

    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate);
            return;
        }

        setActive(label);
    }

    return (
        <AppLayout
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((prev) => !prev)}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            sideNav={
                <AdminSideNav
                    active={active}
                    onNavigate={handleNavigate}
                    collapsed={collapsed}
                />
            }
        >
            <div className="dashboard-page admin-dashboard">
                <header className="admin-dashboard__header">
                    <p className="admin-dashboard__eyebrow">Admin overview</p>
                    <h1 className="admin-dashboard__title">Welcome back, {name}</h1>
                    <p className="admin-dashboard__subtitle">
                        Monitor platform activity, review alerts, and access key management areas.
                    </p>
                </header>

                <section className="admin-dashboard__grid">
                    <article className="admin-dashboard__card">
                        <h3>Total restaurants</h3>
                        <p>Registered restaurants on the platform.</p>
                        <div className="admin-dashboard__number">—</div>
                    </article>

                    <article className="admin-dashboard__card">
                        <h3>Total users</h3>
                        <p>Customer, owner, and admin accounts.</p>
                        <div className="admin-dashboard__number">—</div>
                    </article>

                    <article className="admin-dashboard__card">
                        <h3>Pending approvals</h3>
                        <p>Restaurants waiting for verification.</p>
                        <div className="admin-dashboard__number">—</div>
                    </article>
                </section>

                <section className="dashboard-panel">
                    <h3>Alerts</h3>
                    <p>No alerts yet.</p>
                </section>

                <section className="dashboard-panel">
                    <h3>Management shortcuts</h3>
                    <p>Restaurant, user, and tag management can be added here.</p>
                </section>
            </div>
        </AppLayout>
    );
}

export default AdminDashboard;