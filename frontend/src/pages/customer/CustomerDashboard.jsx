import React, { useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import { useNavigate } from "react-router-dom";
import { logout } from "../../components/utils/logout";
import DashboardHeader from "../../components/Customer/Dashboard/Header";
import SummaryCards from "../../components/Customer/Dashboard/SummaryCards";
import NextBooking from "../../components/Customer/Dashboard/NextBooking";
import UpcomingBookingsCarousel from "../../components/Customer/Dashboard/UpcomingBookingsCarousel";
import Recommended from "../../components/Customer/Dashboard/Recommended";
import useCustomerDashboardData from "../../hooks/useCustomerDashboardData";
import useCustomerRecommendations from "../../hooks/useCustomerRecommendations";
import useCustomerRecentlyViewed from "../../hooks/useCustomerRecentlyViewed";
import "../../components/Customer/Dashboard/Dashboard.css";
import { useTheme } from "../../ThemeContext";

function CustomerDashboard() {
    const name = localStorage.getItem("name") || "customer";
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("Dashboard");
    const { isDarkMode, setIsDarkMode } = useTheme();
    const navigate = useNavigate();

    const {
        loading,
        status,
        nextBooking,
        summary,
        upcomingBookings,
    } = useCustomerDashboardData();

    const {
        loading: recommendationsLoading,
        status: recommendationsStatus,
        personalised,
        popular,
        toggleFavourite,
    } = useCustomerRecommendations();

    const {
        status: recentlyViewedStatus,
        recentlyViewed,
    } = useCustomerRecentlyViewed();

    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate);
            return;
        }
        setActive(label);
    }

    return (
        <AppLayout
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((prev) => !prev)}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            sideNav={
                <CustomerSideNav
                    active={active}
                    onNavigate={handleNavigate}
                    collapsed={collapsed}
                />
            }
        >
            <div className="dashboard-page">
                <DashboardHeader name={name} />

                {status && <div className="dashboard-panel">{status}</div>}
                {recommendationsStatus && (
                    <div className="dashboard-panel">{recommendationsStatus}</div>
                )}
                {recentlyViewedStatus && (
                    <div className="dashboard-panel">{recentlyViewedStatus}</div>
                )}

                <SummaryCards summary={summary} loading={loading} />
                <NextBooking
                    booking={nextBooking}
                    upcomingBookings={upcomingBookings}
                    loading={loading}
                />
                <UpcomingBookingsCarousel
                    bookings={upcomingBookings}
                    loading={loading}
                />

                {recentlyViewed.length > 0 && (
                    <Recommended
                        title="Recently viewed"
                        restaurants={recentlyViewed}
                        loading={false}
                        emptyMessage=""
                        onToggleFavourite={toggleFavourite}
                    />
                )}

                <Recommended
                    title="Recommended for you"
                    restaurants={personalised}
                    loading={recommendationsLoading}
                    emptyMessage="Personalised recommendations will appear here once we have enough activity to score them."
                    onToggleFavourite={toggleFavourite}
                />

                <Recommended
                    title="Popular right now"
                    restaurants={popular}
                    loading={recommendationsLoading}
                    emptyMessage="Popular restaurants will appear here."
                    onToggleFavourite={toggleFavourite}
                />
            </div>
        </AppLayout>
    );
}

export default CustomerDashboard;