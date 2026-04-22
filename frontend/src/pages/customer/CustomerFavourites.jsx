import React, { useEffect, useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import "../../components/Customer/Favourites/Favourites.css";
import { logout } from "../../components/utils/logout";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../ThemeContext";

function renderPriceGuide(restaurant) {
    const min = restaurant?.estimatedSpendMin;
    const max = restaurant?.estimatedSpendMax;

    if (min != null && max != null) {
        return `Est. £${min}–£${max} pp`;
    }

    return null;
}

export default function CustomerFavourites() {
    const name = localStorage.getItem("name") || "customer";
    const [status, setStatus] = useState("");
    const [active, setActive] = useState("Favourites");
    const [collapsed, setCollapsed] = useState(false);
    const { isDarkMode, setIsDarkMode } = useTheme();
    const [favouriteRestaurants, setFavouriteRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    function authFetch(url, options = {}) {
        const token = localStorage.getItem("token");
        return fetch(url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
    }

    useEffect(() => {
        async function loadFavourites() {
            try {
                setLoading(true);
                setStatus("");

                const res = await authFetch("/api/customer/favourites");
                const text = await res.text();
                const data = text ? JSON.parse(text) : [];

                if (!res.ok) {
                    setFavouriteRestaurants([]);
                    setStatus(data?.error || "Failed to load favourites");
                    return;
                }

                setFavouriteRestaurants(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error(error);
                setFavouriteRestaurants([]);
                setStatus("Network/server error");
            } finally {
                setLoading(false);
            }
        }

        loadFavourites();
    }, []);

    async function handleRemoveFavourite(restaurantId) {
        try {
            const res = await authFetch(`/api/customer/favourites/${restaurantId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};
                setStatus(data?.error || "Failed to remove favourite");
                return;
            }

            setFavouriteRestaurants((prev) =>
                prev.filter((restaurant) => restaurant.id !== restaurantId)
            );
        } catch (error) {
            console.error(error);
            setStatus("Network/server error");
        }
    }

    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate);
            return;
        }
        setActive(label);
    }

    function handleViewRestaurant(restaurantId) {
        navigate(`/customer/restaurants/${restaurantId}`);
    }

    function handleBookRestaurant(restaurantId) {
        navigate(`/customer/restaurants/${restaurantId}/book`);
    }

    return (
        <AppLayout
            name={name}
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
            <div className="favourites-page">
                <header className="favourites-page__header">
                    <div>
                        <h1 className="favourites-page__title">My Favourites</h1>
                        <p className="favourites-page__subtitle">
                            View and manage your saved favourite restaurants.
                        </p>
                    </div>
                </header>

                {status && (
                    <div className="dashboard-panel favourites-page__status">
                        {status}
                    </div>
                )}

                <section className="dashboard-panel favourites-page__intro">
                    <h3 className="favourites-page__section-title">Saved Restaurants</h3>
                    <p className="favourites-page__section-text">
                        Restaurants you save from search will appear here.
                    </p>
                </section>

                {loading ? (
                    <section className="dashboard-panel favourites-page__intro">
                        Loading favourites...
                    </section>
                ) : favouriteRestaurants.length === 0 ? (
                    <section className="dashboard-panel favourites-page__intro">
                        You have no favourite restaurants yet.
                    </section>
                ) : (
                    <div className="favourites-grid">
                        {favouriteRestaurants.map((restaurant) => {
                            const numericRating =
                                restaurant.averageRating !== null &&
                                restaurant.averageRating !== undefined &&
                                restaurant.averageRating !== ""
                                    ? Number(restaurant.averageRating)
                                    : 0;

                            const fullStars = Math.round(numericRating);
                            const totalStars = 5;
                            const priceGuide = renderPriceGuide(restaurant);
                            const previewTags = [
                                ...(restaurant.tags || []),
                                ...(restaurant.accessibilityOptions || []),
                            ].slice(0, 4);

                            return (
                                <section
                                    key={restaurant.id}
                                    className="dashboard-panel favourite-card favourite-card--enhanced"
                                >
                                    <div className="favourite-card__media">
                                        {restaurant.imageUrl ? (
                                            <img
                                                src={restaurant.imageUrl}
                                                alt={
                                                    restaurant.imageAltText ||
                                                    `${restaurant.name} preview`
                                                }
                                                className="favourite-card__image"
                                            />
                                        ) : (
                                            <div className="favourite-card__image-placeholder"></div>
                                        )}

                                        <button
                                            type="button"
                                            className="favourite-card__heart"
                                            onClick={() =>
                                                handleRemoveFavourite(restaurant.id)
                                            }
                                            aria-label="Remove favourite"
                                            title="Remove favourite"
                                        >
                                            ♥
                                        </button>
                                    </div>

                                    <div className="favourite-card__content">
                                        <div className="favourite-card__top">
                                            <div className="favourite-card__title-wrap">
                                                <h3 className="favourite-card__title">
                                                    {restaurant.name}
                                                </h3>
                                                <p className="favourite-card__location">
                                                    {restaurant.location}
                                                </p>
                                            </div>

                                            <div className="favourite-card__rating">
                                                <div className="favourite-card__stars">
                                                    {Array.from({
                                                        length: totalStars,
                                                    }).map((_, i) => (
                                                        <span key={i}>
                                                            {i < fullStars ? "★" : "☆"}
                                                        </span>
                                                    ))}
                                                </div>
                                                <span className="favourite-card__rating-number">
                                                    {numericRating.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>

                                        {priceGuide ? (
                                            <p className="favourite-card__price">
                                                {priceGuide}
                                            </p>
                                        ) : null}

                                        {previewTags.length > 0 ? (
                                            <div className="favourite-card__chips">
                                                {previewTags.map((item, index) => (
                                                    <span
                                                        key={`${item}-${index}`}
                                                        className="favourite-card__chip"
                                                    >
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null}

                                        <div className="favourite-card__actions">
                                            <button
                                                type="button"
                                                className="favourite-card__button favourite-card__button--primary"
                                                onClick={() =>
                                                    handleViewRestaurant(restaurant.id)
                                                }
                                            >
                                                View restaurant
                                            </button>

                                            <button
                                                type="button"
                                                className="favourite-card__button favourite-card__button--secondary"
                                                onClick={() =>
                                                    handleBookRestaurant(restaurant.id)
                                                }
                                            >
                                                Book now
                                            </button>

                                            <button
                                                type="button"
                                                className="favourite-card__button favourite-card__button--ghost"
                                                onClick={() =>
                                                    handleRemoveFavourite(restaurant.id)
                                                }
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}