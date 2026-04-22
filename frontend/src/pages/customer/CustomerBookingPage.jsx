import React, { useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import { useTheme } from "../../ThemeContext";
import { logout } from "../../components/utils/logout";
import { useNavigate } from "react-router-dom";
import CustomerBookingFlow from "../../components/Customer/BookingForm/CustomerBookingFlow";

export default function CustomerBookingPage() {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("Search and Filter");
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
            <CustomerBookingFlow />
        </AppLayout>
    );
}