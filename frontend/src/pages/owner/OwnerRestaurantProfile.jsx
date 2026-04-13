import React, { useEffect, useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import ProfileHeader from "../../components/Owner/RestaurantProfile/Header";
import ProfileInfo from "../../components/Owner/RestaurantProfile/Info";
import ProfileOpeningHours from "../../components/Owner/RestaurantProfile/OpeningHours";
import ProfileBookingRules from "../../components/Owner/RestaurantProfile/BookingRules";
import ProfileAccessibility from "../../components/Owner/RestaurantProfile/AccessibilityInfo";
import "../../components/Owner/RestaurantProfile/Profile.css";
import { useTheme } from "../../ThemeContext";
import { logout } from "../../components/utils/logout";
import { useNavigate } from "react-router-dom";

export default function OwnerRestaurantProfile() {
    const ownerName = localStorage.getItem("name") || "owner";
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("Restaurant Profile");
    const { isDarkMode, setIsDarkMode } = useTheme();
    const navigate = useNavigate();

    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate);
            return;
        }
        setActive(label);
    }

    useEffect(() => {
        async function loadProfile() {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch("/api/owner/restaurant/profile", {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                const data = await res.json();

                if (!res.ok) {
                    setStatus(data?.error || "Failed to load profile");
                    setRestaurant(null);
                    return;
                }

                setRestaurant(data);
            } catch (error) {
                console.error(error);
                setStatus("Server error");
                setRestaurant(null);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    return (
        <AppLayout
            name={ownerName}
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
            <div className="owner-profile-page">
                {loading && <p>Loading profile...</p>}
                {status && <p className="status">{status}</p>}

                {restaurant && !loading && (
                    <>
                        <ProfileHeader restaurant={restaurant} />
                        <ProfileInfo restaurant={restaurant} />
                        <ProfileOpeningHours hours={restaurant.openingHours} />
                        <ProfileBookingRules rule={restaurant.bookingRule} />
                        <ProfileAccessibility items={restaurant.accessibility} />
                    </>
                )}
            </div>
        </AppLayout>
    );
}