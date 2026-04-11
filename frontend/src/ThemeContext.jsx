import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem("isDarkMode");
        return savedTheme ? JSON.parse(savedTheme) : false;
    });

    useEffect(() => {
        localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode));

        document.body.classList.toggle("dark-mode", isDarkMode);
        document.body.classList.toggle("light-mode", !isDarkMode);
    }, [isDarkMode]);

    const value = useMemo(() => {
        return { isDarkMode, setIsDarkMode };
    }, [isDarkMode]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }

    return context;
}