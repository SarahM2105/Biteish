import React, { useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import CustomerSideNav from "../../components/CustomerSideNav";
import { useNavigate } from "react-router-dom";
import { logout } from "../../components/utils/logout";
import DashboardHeader from "../../components/Customer/Dashboard/Header";
import SummaryCards from "../../components/Customer/Dashboard/SummaryCards";
import NextBooking from "../../components/Customer/Dashboard/NextBooking";
import UpcomingBookingsCarousel from "../../components/Customer/Dashboard/UpcomingBookingsCarousel";
import useCustomerDashboardData  from "../../hooks/useCustomerDashboardData";
import "../../components/Customer/Dashboard/Dashboard.css"

function CustomerDashboard() {
    const name = localStorage.getItem('name') || 'customer';
    const [collapsed, setCollapsed] = useState(true);
    const [active, setActive] = useState("Dashboard");
    const [isDarkMode, setIsDarkMode] = useState(true);
    const navigate = useNavigate();
    const {loading, status, nextBooking, summary,upcomingBookings} = useCustomerDashboardData();

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
                <DashboardHeader name={name}/>

                {status && <div className="dashboard-panel">{status}</div>}

                <SummaryCards summary={summary} loading={loading}/>
                <NextBooking booking={nextBooking} upcomingBookings={upcomingBookings} loading={loading}/>
                <UpcomingBookingsCarousel bookings={upcomingBookings} loading={loading}/>
            </div>

            <section className="dashboard-section">
                <div className="dashboard-section__topRow">
                    <div className="dashboard-section__heading">
                        <h2>Recommended for you</h2>
                    </div>
                </div>

                <div className="dashboard-placeholder-card">
                    <p>Personalised recommendations will appear here.</p>
                </div>
            </section>

            <section className="dashboard-section">
                <div className="dashboard-section__topRow">
                    <div className="dashboard-section__heading">
                        <h2>Popular in your area</h2>
                    </div>
                </div>

                <div className="dashboard-placeholder-card">
                    <p>Popular restaurants near you will appear here.</p>
                </div>
            </section>
        </AppLayout>
    );
}

export default CustomerDashboard;