import React from 'react';
import "./css/SideNav.css";
import {useLocation, useNavigate} from "react-router-dom";
import {logout} from "./utils/logout";
import useCustomerNotificationCounts from "../hooks/useCustomerNotificationCounts";

export default function CustomerSideNav({active = "Dashboard", onNavigate, collapsed = false}) {
    const navigate = useNavigate();
    const location = useLocation();

    const {totalCustomerNotifications} = useCustomerNotificationCounts();
    const items = [
        "Dashboard",
        "Search and Filter",
        "My Bookings",
        "Favourites",
        "Notifications",
        "Profile and Preferences"
    ];

    const routes = {
        "Dashboard": "/customer/dashboard",
        "Search and Filter": "/customer/search",
        "My Bookings" : "/customer/myBookings",
        "Favourites": "/customer/favourites",
        "Notifications": "/customer/notifications",
        "Profile and Preferences": "/customer/profile",
    };
    //https://emojipedia.org/en/search?q=calandar
    const icons = {
        "Dashboard": "🏠",
        "Search and Filter": "🔎",
        "My Bookings": "📅",
        "Favourites": "💖",
        "Notifications": "🔔",
        "Profile and Preferences": "⚙️"
    };
    // for logout ↩ https://emojidb.org/arrow-return-emojis
    return (
        <aside className={`sidenav ${collapsed ? "is-collapsed" : "is-expanded"}`}>
            <nav className="sidenav__nav">
                {items.map((label)=>{
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
                        {!collapsed && (
                            <span className="sidenav__label">{label}</span>
                        )}
                        {!collapsed && label === "Notifications" && totalCustomerNotifications> 0 &&(
                            <span className="sidenav__badge">
                                {totalCustomerNotifications > 20
                                ? "20+"
                                : totalCustomerNotifications}
                            </span>
                        )}
                    </button>
                );
                })}
            </nav>
            <div className="sidenav__footer">
                <button type="button" className="sidenav__logout" onClick={() => logout(navigate)} title={collapsed ? "Logout" : undefined}>
                    <span className="sidenav__icon">↩</span>
                    {!collapsed && <span className="sidenav__label">Logout</span> }
                </button>
            </div>
        </aside>
    );
}