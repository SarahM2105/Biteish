import React from "react";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import { useTheme } from "../../ThemeContext";
import TablesContent from "../../components/Owner/Tables/TablesContent";
import useOwnerTables from "../../hooks/useOwnerTables";
import "../../components/Owner/Tables/css/TablesLayout.css";
import "../../components/Owner/Tables/css/TablesHeader.css";
import "../../components/Owner/Tables/css/ZoneTabs.css";
import "../../components/Owner/Tables/css/ZoneLayout.css";
import "../../components/Owner/Tables/css/TableVisual.css";
import "../../components/Owner/Tables/css/TableVisualChairs.css";
import "../../components/Owner/Tables/css/TableVisualMeta.css";
import "../../components/Owner/Tables/css/TableDetailsPanel.css";
import "../../components/Owner/Tables/css/Modal.css";
import "../../components/Owner/Tables/css/TablePreview.css";
import "../../components/Owner/Tables/css/TablesDarkMode.css";
import "../../components/Owner/Tables/css/TablesResponsive.css";

export default function OwnerRestaurantLayout() {
    const [collapsed, setCollapsed] = React.useState(false);
    const [active, setActive] = React.useState("Zones and Tables");
    const { isDarkMode, setIsDarkMode } = useTheme();

    const tablesState = useOwnerTables();

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
            <TablesContent {...tablesState} />
        </AppLayout>
    );
}