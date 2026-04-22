import React, { useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import CheckInPanel from "../../components/Owner/Check-In/CheckInPanel";
import CheckOutPanel from "../../components/Owner/Check-In/CheckOutPanel";
import "../../components/Owner/Check-In/css/Layout.css";
import "../../components/Owner/Check-In/css/Modes.css";
import "../../components/Owner/Check-In/css/Card.css";
import "../../components/Owner/Check-In/css/Forms.css";
import "../../components/Owner/Check-In/css/Tables.css";
import { useTheme } from "../../ThemeContext";

export default function OwnerCheckIn() {
    const name = localStorage.getItem("name") || "owner";
    const [mode, setMode] = useState("");
    const [collapsed, setCollapsed] = useState(false);
    const { isDarkMode, setIsDarkMode } = useTheme();
    const [active, setActive] = useState("Dashboard");

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
            <div className="checkin-wrapper">
                <div className="checkin-header">
                    <h1>Check In Users</h1>
                    <p>Manage guest check-ins and check-outs from one place.</p>
                </div>

                {!mode && (
                    <div className="checkin-mode-list">
                        <button
                            type="button"
                            className="checkin-mode-button"
                            onClick={() => setMode("checkin")}
                        >
                            <span className="checkin-mode-button__title">Check In</span>
                            <span className="checkin-mode-button__text">
                                Scan a QR code, enter a token, or place a guest on an available table.
                            </span>
                        </button>

                        <button
                            type="button"
                            className="checkin-mode-button"
                            onClick={() => setMode("checkout")}
                        >
                            <span className="checkin-mode-button__title">Check Out</span>
                            <span className="checkin-mode-button__text">
                                Remove a guest from an occupied table when their visit has ended.
                            </span>
                        </button>
                    </div>
                )}

                {mode === "checkin" && (
                    <div className="checkin-flow">
                        <button
                            type="button"
                            className="checkin-back"
                            onClick={() => setMode("")}
                        >
                            ← Back
                        </button>
                        <CheckInPanel />
                    </div>
                )}

                {mode === "checkout" && (
                    <div className="checkin-flow">
                        <button
                            type="button"
                            className="checkin-back"
                            onClick={() => setMode("")}
                        >
                            ← Back
                        </button>
                        <CheckOutPanel />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}