import React from "react";
import "./css/SideNav.css";

export default function AdminSideNav({
                                         active = "Dashboard",
                                         onNavigate,
                                         collapsed = false,
                                     }) {
    const items = [
        "Dashboard",
        "Restaurant Verification",
        "Users",
        "Analytics",
        "Audit Log",
        "Settings",
    ];

    return (
        <aside className={`sidenav ${collapsed ? "sidenav--collapsed" : ""}`}>
            <nav className="sidenav__nav">
                {items.map((label) => (
                    <button
                        key={label}
                        type="button"
                        className={`sidenav__item ${
                            active === label ? "is-active" : ""
                        }`}
                        onClick={() => onNavigate(label)}
                        title={collapsed ? label : undefined}
                    >
                        {!collapsed && label}
                    </button>
                ))}
            </nav>

            <div className="sidenav__footer">
                <button
                    type="button"
                    className="sidenav__logout"
                    onClick={() => onNavigate?.("Logout")}
                    title={collapsed ? "Logout" : undefined}
                >
                    {!collapsed && "Logout"}
                </button>
            </div>
        </aside>
    );
}