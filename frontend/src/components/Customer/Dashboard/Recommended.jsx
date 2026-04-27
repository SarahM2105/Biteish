import React from "react";
import { useNavigate } from "react-router-dom";
import RestaurantCard from "../Search/RestaurantCard";
import { authFetch } from "../../utils/authFetch";
import "../Search/css/RestaurantCard.css";

export default function Reccommended({
                                         title,
                                         restaurants = [],
                                         loading = false,
                                         emptyMessage,
                                         onToggleFavourite,
                                     }) {
    const navigate = useNavigate();

    async function logInteraction(payload) {
        try {
            await authFetch("/api/customer/interactions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.log(error);
        }
    }

    async function handleOpenRestaurant(restaurantId) {
        await logInteraction({
            eventType: "RESTAURANT_VIEW",
            source: "RECOMMENDATIONS",
            restaurantId,
            metadata: {
                origin: "dashboard_recommendations",
                sectionTitle: title,
            },
        });

        navigate(`/customer/restaurants/${restaurantId}`);
    }

    async function handleBookRestaurant(restaurantId) {
        await logInteraction({
            eventType: "RECOMMENDATION_CLICK",
            source: "RECOMMENDATIONS",
            restaurantId,
            metadata: {
                origin: "dashboard_recommendations",
                sectionTitle: title,
                action: "book",
            },
        });

        navigate(`/customer/restaurants/${restaurantId}/book`);
    }

    async function handleFavouriteRestaurant(restaurantId) {
        await logInteraction({
            eventType: "RECOMMENDATION_CLICK",
            source: "RECOMMENDATIONS",
            restaurantId,
            metadata: {
                origin: "dashboard_recommendations",
                sectionTitle: title,
                action: "favourite_toggle",
            },
        });

        onToggleFavourite?.(restaurantId);
    }

    if (loading) {
        return (
            <div className="dashboard-placeholder-card">
                <p>Loading recommendations...</p>
            </div>
        );
    }

    if (restaurants.length === 0) {
        return (
            <div className="dashboard-placeholder-card">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <section className="dashboard-section">
            <div className="dashboard-section__topRow">
                <div className="dashboard-section__heading">
                    <h2>{title}</h2>
                </div>
            </div>

            <div className="dashboard-recommendation-grid">
                {restaurants.map((restaurant) => (
                    <div
                        key={restaurant.id}
                        className="dashboard-recommendation-item"
                    >
                        <RestaurantCard
                            restaurant={restaurant}
                            onSelect={() => handleOpenRestaurant(restaurant.id)}
                            onViewMore={() => handleOpenRestaurant(restaurant.id)}
                            onBook={() => handleBookRestaurant(restaurant.id)}
                            onToggleFavourite={() =>
                                handleFavouriteRestaurant(restaurant.id)
                            }
                        />

                        {restaurant.recommendationReason ? (
                            <p className="dashboard-recommendation-reason">
                                {restaurant.recommendationReason}
                            </p>
                        ) : null}
                    </div>
                ))}
            </div>
        </section>
    );
}