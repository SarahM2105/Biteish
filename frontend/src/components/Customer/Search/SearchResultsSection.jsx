import React from "react";
import RestaurantCard from "./RestaurantCard";
import RestaurantMap from "./RestaurantMap";

function renderPriceGuide(restaurant) {
    const min = restaurant?.estimatedSpendMin;
    const max = restaurant?.estimatedSpendMax;

    if (min != null && max != null) {
        return `Est. £${min}–£${max} pp`;
    }

    return null;
}

export default function SearchResultsSection({
                                                 viewMode,
                                                 filtered,
                                                 selected,
                                                 mapReadyRestaurants,
                                                 listItemRefs,
                                                 onSelectRestaurant,
                                                 onOpenPreview,
                                                 onBookRestaurant,
                                                 onToggleFavourite,
                                             }) {
    if (viewMode === "grid") {
        return (
            <section className="search-results">
                {filtered.length === 0 ? (
                    <div className="search-empty-panel">
                        <h3>No matching restaurants</h3>
                        <p>Try another search term or adjust your filters.</p>
                    </div>
                ) : (
                    <div className="search-results__grid">
                        {filtered.map((restaurant) => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                isSelected={selected?.id === restaurant.id}
                                onSelect={() => onSelectRestaurant(restaurant)}
                                onViewMore={() => onOpenPreview(restaurant)}
                                onBook={() => onBookRestaurant(restaurant.id)}
                                onToggleFavourite={() =>
                                    onToggleFavourite(restaurant.id)
                                }
                            />
                        ))}
                    </div>
                )}
            </section>
        );
    }

    return (
        <div className="search-map-layout">
            <section className="search-map-list">
                {filtered.length === 0 ? (
                    <div className="search-map-empty-panel">
                        <h3>No matching restaurants</h3>
                        <p>Try another search term or adjust your filters.</p>
                    </div>
                ) : (
                    <div className="search-map-list__items">
                        {filtered.map((restaurant, index) => {
                            const numericRating =
                                restaurant.averageRating !== null &&
                                restaurant.averageRating !== undefined &&
                                restaurant.averageRating !== ""
                                    ? Number(restaurant.averageRating)
                                    : 0;

                            return (
                                <button
                                    key={restaurant.id}
                                    ref={(el) => {
                                        listItemRefs.current[restaurant.id] = el;
                                    }}
                                    type="button"
                                    className={`search-map-list__item ${
                                        selected?.id === restaurant.id ? "is-selected" : ""
                                    }`}
                                    onClick={() => onSelectRestaurant(restaurant)}
                                >
                                    <div className="search-map-list__number">
                                        {index + 1}
                                    </div>

                                    <div className="search-map-list__content">
                                        <h4>{restaurant.name}</h4>
                                        <p>{restaurant.location}</p>

                                        <div className="search-map-list__meta">
                                            {restaurant.cuisine ? (
                                                <span className="search-map-list__chip">
                                                    {restaurant.cuisine}
                                                </span>
                                            ) : null}

                                            <span className="search-map-list__rating">
                                                ⭐ {numericRating.toFixed(1)}
                                            </span>

                                            {renderPriceGuide(restaurant) ? (
                                                <span className="search-map-list__chip">
                                                    {renderPriceGuide(restaurant)}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="search-map-panel dashboard-panel">
                {mapReadyRestaurants.length > 0 ? (
                    <RestaurantMap
                        restaurants={mapReadyRestaurants}
                        selected={selected}
                        onSelectRestaurant={onSelectRestaurant}
                        onPreviewRestaurant={onOpenPreview}
                    />
                ) : (
                    <div className="restaurant-map-empty-panel">
                        <h3>No restaurant locations available yet</h3>
                        <p>
                            Restaurants matching this search do not currently have map
                            coordinates.
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
}