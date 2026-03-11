import React from 'react';
import "./css/SideNav.css";
import {useLocation, useNavigate} from "react-router-dom";
import {logout} from "./utils/logout";
import useCustomerNotificationCounts from "../hooks/useCustomerNotificationCounts";

export default function CustomerSideNav({active = "Dashboard", onNavigate}) {
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
        "Dashboard": "/customer-dashboard",
        "Search and Filter": "/customer/search",
        "My Bookings" : "/customer/myBookings",
        "Favourites": "/customer/favorites",
        "Notifications": "/customer/notifications",
        "Profile and Preferences": "/customer/profile",
    };

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
                        {label === "Notifications" && totalCustomerNotifications> 0 &&(
                            <span className="sidenav__badge">
                                {totalCustomerNotifications}
                            </span>
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