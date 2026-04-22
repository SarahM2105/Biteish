import React, { useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import RestaurantSettingsContent from "../../components/Owner/Settings/RestaurantSettingsContent";
import { useTheme } from "../../ThemeContext";
import "../../components/Owner/Settings/Settings.css";

export default function OwnerRestaurantSettings() {
    const name = localStorage.getItem("name") || "Owner";
    const { isDarkMode, setIsDarkMode } = useTheme();

    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("Restaurant Settings");

    function handleNavigate(label) {
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
                <OwnerSideNav
                    active={active}
                    onNavigate={handleNavigate}
                    collapsed={collapsed}
                />
            }
        >
            <RestaurantSettingsContent />
        </AppLayout>
    );
}