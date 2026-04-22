import React, { useEffect, useMemo } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function createNumberedIcon(number, isSelected) {
    return L.divIcon({
        className: "custom-numbered-marker",
        html: `
            <div class="marker-pin ${isSelected ? "is-selected" : ""}">
                <span>${number}</span>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -30],
    });
}

function renderPriceGuide(restaurant) {
    const min = restaurant?.estimatedSpendMin;
    const max = restaurant?.estimatedSpendMax;

    if (min != null && max != null) {
        return `Est. £${min}–£${max} pp`;
    }

    return restaurant?.priceRange || null;
}

function FitMapToMarkers({ restaurants, selected }) {
    const map = useMap();

    useEffect(() => {
        const validRestaurants = restaurants.filter(
            (r) =>
                r.latitude != null &&
                r.longitude != null
        );

        if (!validRestaurants.length) return;

        if (
            selected &&
            selected.latitude != null &&
            selected.longitude != null
        ) {
            map.flyTo([selected.latitude, selected.longitude], 15, {
                duration: 0.8,
            });
            return;
        }

        const bounds = L.latLngBounds(
            validRestaurants.map((r) => [r.latitude, r.longitude])
        );

        map.fitBounds(bounds, { padding: [40, 40] });
    }, [map, restaurants, selected]);

    return null;
}

export default function RestaurantMap({
                                          restaurants = [],
                                          selected,
                                          onSelectRestaurant,
                                          onPreviewRestaurant,
                                      }) {
    const validRestaurants = useMemo(() => {
        return restaurants.filter(
            (r) =>
                r.latitude != null &&
                r.longitude != null
        );
    }, [restaurants]);

    const defaultCenter = useMemo(() => {
        if (
            selected?.latitude != null &&
            selected?.longitude != null
        ) {
            return [selected.latitude, selected.longitude];
        }

        if (validRestaurants.length > 0) {
            const totals = validRestaurants.reduce(
                (acc, restaurant) => {
                    acc.latitude += Number(restaurant.latitude) || 0;
                    acc.longitude += Number(restaurant.longitude) || 0;
                    return acc;
                },
                { latitude: 0, longitude: 0 }
            );

            return [
                totals.latitude / validRestaurants.length,
                totals.longitude / validRestaurants.length,
            ];
        }

        return null;
    }, [selected, validRestaurants]);

    if (!defaultCenter) {
        return (
            <div className="restaurant-map">
                <div className="restaurant-map__empty">
                    No restaurant locations available yet.
                </div>
            </div>
        );
    }

    return (
        <div className="restaurant-map">
            <MapContainer
                center={defaultCenter}
                zoom={13}
                scrollWheelZoom
                className="restaurant-map__container"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <FitMapToMarkers
                    restaurants={validRestaurants}
                    selected={selected}
                />

                {validRestaurants.map((restaurant, index) => {
                    const isSelected = selected?.id === restaurant.id;

                    const numericRating =
                        restaurant.averageRating !== null &&
                        restaurant.averageRating !== undefined &&
                        restaurant.averageRating !== ""
                            ? Number(restaurant.averageRating)
                            : 0;

                    const priceGuide = renderPriceGuide(restaurant);

                    return (
                        <Marker
                            key={restaurant.id}
                            position={[restaurant.latitude, restaurant.longitude]}
                            icon={createNumberedIcon(index + 1, isSelected)}
                            eventHandlers={{
                                click: () => {
                                    onSelectRestaurant?.(restaurant);
                                },
                            }}
                        >
                            <Popup>
                                <div className="restaurant-map__popup">
                                    <div className="restaurant-map__popup-title">
                                        {index + 1}. {restaurant.name}
                                    </div>

                                    <div className="restaurant-map__popup-text">
                                        {restaurant.location}
                                    </div>

                                    <div className="restaurant-map__popup-badges">
                                        {restaurant.cuisine ? (
                                            <span className="restaurant-map__popup-badge">
                                                {restaurant.cuisine}
                                            </span>
                                        ) : null}

                                        <span className="restaurant-map__popup-badge">
                                            ⭐ {numericRating.toFixed(1)}
                                        </span>

                                        {priceGuide ? (
                                            <span className="restaurant-map__popup-badge">
                                                {priceGuide}
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="restaurant-map__popup-actions">
                                        <button
                                            type="button"
                                            className="restaurant-map__popup-button"
                                            onClick={() =>
                                                onPreviewRestaurant?.(restaurant)
                                            }
                                        >
                                            Quick preview
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}