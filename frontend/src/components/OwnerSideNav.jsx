import React from "react";
import "./css/SideNav.css";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "./utils/logout";
import useOwnerNotificationCounts from "../hooks/useOwnerNotificationCounts";

export default function OwnerSideNav({ active = "Dashboard", onNavigate, collapsed = false }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { totalRequestsCount } = useOwnerNotificationCounts();

    const items = [
        "Dashboard",
        "Restaurant Profile",
        "Zones and Tables",
        "Menu",
        "Request",
        "Check-ins",
        "Analytics",
        "Notifications",
        "Restaurant Settings",
        "Profile and Preferences",
    ];

    const routes = {
        "Dashboard": "/owner/dashboard",
        "Restaurant Profile": "/owner/restaurant/profile",
        "Zones and Tables": "/owner/restaurant-layout",
        "Menu": "/owner/menu",
        "Request": "/owner/request",
        "Check-ins": "/owner/check-ins",
        "Analytics": "/owner/analytics",
        "Notifications": "/owner/notifications",
        "Restaurant Settings": "/owner/settings",
        "Profile and Preferences": "/owner/profile-preferences",
    };

    const icons = {
        "Dashboard": "🏠",
        "Restaurant Profile": "🧑‍🍳",
        "Zones and Tables": "🪑",
        "Menu": "🍽️",
        "Request": "✉️",
        "Check-ins": "📷",
        "Analytics": "📊",
        "Notifications": "🔔",
        "Restaurant Settings": "⚙️",
        "Profile and Preferences": "👤",
    };

    return (
        <aside className={`sidenav ${collapsed ? "is-collapsed" : "is-expanded"}`}>
            <nav className="sidenav__nav">
                {items.map((label) => {
                    const isActive = location.pathname === routes[label];

                    return (
                        <button
                            key={label}
                            type="button"
                            className={`sidenav__item ${isActive ? "is-active" : ""}`}
                            onClick={() => {
                                onNavigate?.(label);
                                navigate(routes[label]);
                            }}
                            title={collapsed ? label : undefined}
                        >
                            <span className="sidenav__icon">{icons[label]}</span>

                            {!collapsed && <span className="sidenav__label">{label}</span>}

                            {!collapsed &&
                                (label === "Request" || label === "Notifications") &&
                                totalRequestsCount > 0 && (
                                    <span className="sidenav__badge">
                                        {totalRequestsCount > 20 ? "20+" : totalRequestsCount}
                                    </span>
                                )}
                        </button>
                    );
                })}
            </nav>

            <div className="sidenav__footer">
                <button
                    type="button"
                    className="sidenav__logout"
                    onClick={() => logout(navigate)}
                    title={collapsed ? "Logout" : undefined}
                >
                    <span className="sidenav__icon">↩</span>
                    {!collapsed && <span className="sidenav__label">Logout</span>}
                </button>
            </div>
        </aside>
    );
}