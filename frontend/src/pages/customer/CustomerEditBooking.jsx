import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import BookingContent from "../../components/Customer/EditBooking/BookingContent";
import { logout } from "../../components/utils/logout";
import "../../components/Customer/MyBookings/css/EditBookingPage.css";
import "../../components/Customer/MyBookings/css/EditBookingCurrent.css";
import "../../components/Customer/MyBookings/css/EditBookingForm.css";
import "../../components/Customer/MyBookings/css/EditBookingTheme.css";
import "../../components/Customer/MyBookings/css/EditBookingResponsive.css";
import { useTheme } from "../../ThemeContext";

export default function CustomerEditBooking() {
    const name = localStorage.getItem("name") || "customer";
    const navigate = useNavigate();

    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("My Bookings");
    const { isDarkMode, setIsDarkMode } = useTheme();

    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate);
            return;
        }
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
            <BookingContent />
        </AppLayout>
    );
}