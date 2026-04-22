import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import EditRestaurantProfileContent from "../../components/Owner/RestaurantProfile/EditRestaurantProfileContent";
import "../../components/Owner/RestaurantProfile/css/ProfileLayout.css";
import "../../components/Owner/RestaurantProfile/css/Edit.css";
import "../../components/Owner/RestaurantProfile/css/Gallery.css";
import { useTheme } from "../../ThemeContext";
import { logout } from "../../components/utils/logout";

export default function OwnerEditRestaurantProfile() {
    const ownerName = localStorage.getItem("name") || "owner";
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("Restaurant Profile");
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
            name={ownerName}
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
            <EditRestaurantProfileContent />
        </AppLayout>
    );
}