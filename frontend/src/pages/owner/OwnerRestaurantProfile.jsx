import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import ProfileHeader from "../../components/Owner/RestaurantProfile/Header";
import ProfileInfo from "../../components/Owner/RestaurantProfile/Info";
import ProfileOpeningHours from "../../components/Owner/RestaurantProfile/OpeningHours";
import ProfileBookingRules from "../../components/Owner/RestaurantProfile/BookingRules";
import ProfileAccessibility from "../../components/Owner/RestaurantProfile/AccessibilityInfo";
import "../../components/Owner/RestaurantProfile/css/ProfileLayout.css";
import { useTheme } from "../../ThemeContext";
import { logout } from "../../components/utils/logout";
import { authFetch } from "../../components/utils/authFetch";
import { getApiErrorMessage } from "../../components/utils/getApiErrorMessage";
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
                setLoading(true);
                setStatus("");

                const res = await authFetch("/api/owner/restaurant/profile");
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setStatus(getApiErrorMessage(data, "Failed to load profile"));
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

    const images = useMemo(() => {
        return Array.isArray(restaurant?.images) ? restaurant.images : [];
    }, [restaurant]);

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

                        <div className="profile-card">
                            <div className="profile-gallery">
                                <div className="profile-gallery__header">
                                    <div className="profile-gallery__header-copy">
                                        <h3>Restaurant Photos</h3>
                                        <p>
                                            These photos are shown to customers on the search page
                                            and restaurant details page.
                                        </p>
                                    </div>
                                </div>

                                {images.length > 0 ? (
                                    <div className="profile-gallery__grid">
                                        {images.map((image, index) => (
                                            <div
                                                key={image.id}
                                                className="profile-gallery__card"
                                            >
                                                <div className="profile-gallery__media">
                                                    <img
                                                        src={image.imageUrl}
                                                        alt={
                                                            image.altText ||
                                                            `${restaurant.name || "Restaurant"} image ${index + 1}`
                                                        }
                                                        className="profile-gallery__image"
                                                    />

                                                    {image.isPrimary ? (
                                                        <span className="profile-gallery__primary-badge">
                                                            Primary
                                                        </span>
                                                    ) : null}
                                                </div>

                                                <div className="profile-gallery__meta">
                                                    <strong>
                                                        {image.isPrimary
                                                            ? "Main preview image"
                                                            : `Gallery image ${index + 1}`}
                                                    </strong>
                                                    <span>
                                                        {image.altText ||
                                                            "No image description added yet."}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="profile-gallery__empty">
                                        No restaurant photos have been uploaded yet.
                                    </div>
                                )}
                            </div>
                        </div>

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