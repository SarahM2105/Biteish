import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import CustomerBookingsContent from "../../components/Customer/MyBookings/Content";
import { logout } from "../../components/utils/logout";
import { useTheme } from "../../ThemeContext";
import "../../components/Customer/MyBookings/css/MyBookingPage.css";
import "../../components/Customer/MyBookings/css/BookingTheme.css";
import "../../components/Customer/MyBookings/css/QRModal.css";
import "../../components/Customer/MyBookings/css/Responsive.css";
import "../../components/Customer/MyBookings/css/BookingCard.css";
import "../../components/Customer/MyBookings/css/BookingDateStrip.css";
import "../../components/Customer/MyBookings/css/BookingSections.css";

export default function CustomerBookings() {
    const name = localStorage.getItem("name") || "customer";
    const navigate = useNavigate();
    const { isDarkMode, setIsDarkMode } = useTheme();

    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("My Bookings");

    function handleNavigate(label) {
        if (label === "Logout") return logout(navigate);
        setActive(label);
    }

    return (
        <AppLayout
            name={name}
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
            <CustomerBookingsContent />
        </AppLayout>
    );
}