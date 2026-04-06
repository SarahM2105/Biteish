import React from "react";
import "../components/css/AppLayout.css";
import TopNav from "../components/utils/TopNav";

export default function AppLayout({sideNav, children, onToggleSidebar, collapsed, isDarkMode, onToggleTheme
                                        }) {
    return (
        <div className={`dashboard-layout ${isDarkMode ? "dark-mode" : "light-mode"}`}>
            <TopNav
                onToggleSidebar={onToggleSidebar}
                isDarkMode={isDarkMode}
                onToggleTheme={onToggleTheme}
            />

            <div className="dashboard-body">
                <div className={`dashboard-nav ${collapsed ? "is-collapsed" : "is-expanded"}`}>
                    {sideNav}
                </div>

                <main className={`dashboard-main ${collapsed ? "is-collapsed" : "is-expanded"}`}>
                    {children}
                </main>
            </div>
        </div>
    );
}