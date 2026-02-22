import React from 'react';
import "../components/css/DashboardLayout.css";
import {logout} from "../components/utils/logout"
export default function DashboardLayout({sideNav, name, children}) {
    const [navOpen, setNavOpen] = React.useState(false);
    return (
        <div className="dashboard-layout">
            <header className="dashboard-topbar">
                <button
                    type="button"
                    className="burger"
                    aria-label="Toggle menu"
                    onClick={() => setNavOpen((v) => !v)}
                >
                    =
                </button>
                <div className="topbar-logo">LOGO</div>
                <div className="topbar-user">
                    <div className="avatar"/>
                    <div className="username">{name}</div>
                </div>
            </header>
            <div className="dashboard-body">
                <div className={`dashboard-nav ${navOpen ? "" : "is-collapsed"}`}>
                    {sideNav}
                </div>
                <main className="dashboard-main">
                    {children}
                </main>
            </div>
        </div>
    );
}