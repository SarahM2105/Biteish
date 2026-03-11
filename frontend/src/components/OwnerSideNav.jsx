import React from 'react';
import "./css/SideNav.css"
import {useNavigate, useLocation} from "react-router-dom";
import {logout} from "./utils/logout";
import useOwnerNotificationCounts from "../hooks/useOwnerNotificationCounts";

export default function OwnerSideNav({active = "Dashboard", onNavigate}) {
    const navigate = useNavigate();
    const location = useLocation();
    const {totalRequestsCount} = useOwnerNotificationCounts()
    const items = [
        "Dashboard",
        "Restaurant Profile",
        "Zones and Tables",
        "Menu",
        "Request",
        "QR Check-ins",
        "Analytics",
        "Notifications",
        "Restaurant Settings",
        "Profile and Preferences"
    ];

    const routes = {
        "Dashboard" : "/owner-dashboard",
        "Restaurant Profile": "/owner/restaurants",
        "Zones and Tables": "/owner/restaurant-layout",
        "Menu": "/owner/menu",
        "Request": "/owner/request",
        "QR Check-ins": "/owner/check-ins",
        "Analytics": "/owner/analytics",
        "Notifications": "/owner/notifications",
        "Restaurant Settings": "/owner/settings",
        "Profile and Preferences": "/owner/profile",
    }
    return (
        <aside className="sidenav">
            <nav className="sidenav__nav">
                {items.map((label)=>(
                    <button
                        key={label}
                        type="button"
                        className={`sidenav__item ${location.pathname === routes[label] ? "is-active" : ""}`}
                        onClick={() => {
                            onNavigate?.(label);
                            navigate(routes[label]);
                        }}
                    >
                        <span>{label}</span>
                        {label === "Notifications" && totalRequestsCount >0 && (
                            <span className="sidenav__badge">{totalRequestsCount}</span>
                        )}
                    </button>
                ))}
            </nav>
            <div className="sidenav__footer">
                <button type="button" className="sidenav__logout" onClick={() => logout(navigate)}>
                    Logout
                </button>
            </div>
        </aside>
    );
}