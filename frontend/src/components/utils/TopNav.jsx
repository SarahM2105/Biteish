import React from "react";
import "../css/TopNav.css";
//https://emojipedia.org/crescent-moon

export default function TopNav({
                                   onToggleSidebar,
                                   isDarkMode = false,
                                   onToggleTheme,
                               }) {
    const name = localStorage.getItem("name") || "testCustomer";
    const firstLetter = name?.charAt(0)?.toUpperCase() || "U";

    return (
        <header className="topnav">
            <div className="topnav__left">
                <button
                    type="button"
                    className="topnav__menuBtn"
                    onClick={onToggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>

            <h1 className="topnav__logo topnav__logo--wave" aria-label="Biteish">
                <span>B</span>
                <span>i</span>
                <span>t</span>
                <span>e</span>
                <span>i</span>
                <span>s</span>
                <span>h</span>
            </h1>

            <div className="topnav__right">
                {onToggleTheme && (
                    <button
                        type="button"
                        className="topnav__themeBtn"
                        onClick={onToggleTheme}
                        aria-label="Toggle theme"
                    >
                        {isDarkMode ? "☀️" : "🌙"}
                    </button>
                )}

                <span className="topnav__username">{name}</span>

                <div className="topnav__avatar">
                    {firstLetter}
                </div>
            </div>
        </header>
    );
}