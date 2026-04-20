import React, { useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import OwnerBookingsContent from "../../components/Owner/Bookings/Content";
import { useTheme } from "../../ThemeContext";
import "../../components/Owner/Bookings/css/BookingPage.css";
import "../../components/Owner/Bookings/css/Sections.css";
import "../../components/Owner/Bookings/css/Browse.css";
import "../../components/Owner/Bookings/css/Modal.css";
import "../../components/Owner/Bookings/css/Responsive.css";

export default function OwnerBookings() {
    const [collapsed, setCollapsed] = useState(false);
    const { isDarkMode, setIsDarkMode } = useTheme();
    const [active, setActive] = useState("Bookings");

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
            <OwnerBookingsContent />
        </AppLayout>
    );
}