import React from 'react';
import "./css/SideNav.css"

export default function ownerSideNav({active = "Dashboard", onNavigate}) {
    const items = [
        "Dashboard",
        "Restaurant Verification",
        "Users",
        "Analytics",
        "Audit Log",
        "Settings",
    ];
    return (
        <aside className="sidenav">
            <nav className="sidenav__nav">
                {items.map((label)=>(
                    <button
                        key={label}
                        type="button"
                        className={`sidenav__item ${active === label ? "is-active" : ""}`}
                        onClick={() => onNavigate(label)}
                    >
                        {label}
                    </button>
                ))}
            </nav>
            <div className="sidenav__footer">
                <button type="button" className="sidenav__logout" onClick={() => onNavigate?.("Logout")}>
                    Logout
                </button>
            </div>
        </aside>
    );
}