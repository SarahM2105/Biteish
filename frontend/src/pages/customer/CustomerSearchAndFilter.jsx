import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import SearchContent from "../../components/Customer/Search/SearchContent";
import { logout } from "../../components/utils/logout";
import { useTheme } from "../../ThemeContext";

export default function CustomerSearchAndFilter() {
    const [active, setActive] = useState("Search and Filter");
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
                <CustomerSideNav
                    active={active}
                    onNavigate={handleNavigate}
                    collapsed={collapsed}
                />
            }
        >
            <SearchContent />
        </AppLayout>
    );
}