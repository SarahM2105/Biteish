import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterDrawer from "./FilterDrawer";
import RestaurantPreviewModal from "./RestaurantPreviewModal";
import SearchHeaderSection from "./SearchHeaderSection";
import SearchResultsSection from "./SearchResultsSection";
import { authFetch } from "../../utils/authFetch";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import "./css/FilterDrawer.css";
import "./css/RestaurantCard.css";
import "./css/RestaurantMap.css";
import "./css/RestaurantPreviewModal.css";
import "./css/SearchControl.css";
import "./css/SearchHeader.css";
import "./css/SearchPage.css";
import "./css/SearchResults.css";

function hasCoordinates(restaurant) {
    return (
        restaurant?.latitude !== null &&
        restaurant?.latitude !== undefined &&
        restaurant?.longitude !== null &&
        restaurant?.longitude !== undefined
    );
}

export default function SearchContent() {
    const [q, setQ] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [selected, setSelected] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewMode, setViewMode] = useState("grid");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewRestaurant, setPreviewRestaurant] = useState(null);
    const [filters, setFilters] = useState({
        accessibility: [],
        tags: [],
    });
    const [filterOptions, setFilterOptions] = useState({
        accessibilityOptions: [],
        tagCategories: [],
        locations: [],
    });

    const navigate = useNavigate();
    const listItemRefs = useRef({});
    const searchLogTimeoutRef = useRef(null);

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

    useEffect(() => {
        const timeout = setTimeout(async () => {
            try {
                const res = await authFetch(
                    `/api/customer/restaurants/search?q=${encodeURIComponent(q.trim())}`
                );
                const text = await res.text();
                const data = text ? JSON.parse(text) : [];

                if (!res.ok) {
                    throw new Error(
                        getApiErrorMessage(data, "Failed to load restaurants.")
                    );
                }

                const list = Array.isArray(data) ? data : data.restaurants || [];

                setRestaurants(list);
                setSelected(null);
            } catch (error) {
                console.log(error);
                setRestaurants([]);
                setSelected(null);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [q]);

    useEffect(() => {
        async function loadFilterOptions() {
            try {
                const res = await authFetch("/api/customer/restaurants/filter-options");
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};

                if (!res.ok) {
                    throw new Error(
                        getApiErrorMessage(data, "Failed to load filter options.")
                    );
                }

                setFilterOptions({
                    accessibilityOptions: Array.isArray(data.accessibilityOptions)
                        ? data.accessibilityOptions
                        : [],
                    tagCategories: Array.isArray(data.tagCategories)
                        ? data.tagCategories
                        : [],
                    locations: Array.isArray(data.locations) ? data.locations : [],
                });
            } catch (error) {
                console.log(error);
                setFilterOptions({
                    accessibilityOptions: [],
                    tagCategories: [],
                    locations: [],
                });
            }
        }

        loadFilterOptions();
    }, []);

    useEffect(() => {
        const trimmedQuery = q.trim();
        const hasAccessibilityFilters = filters.accessibility.length > 0;
        const hasTagFilters = filters.tags.length > 0;
        const hasSearchIntent =
            trimmedQuery ||
            hasAccessibilityFilters ||
            hasTagFilters;

        if (!hasSearchIntent) {
            return;
        }

        if (searchLogTimeoutRef.current) {
            clearTimeout(searchLogTimeoutRef.current);
        }

        searchLogTimeoutRef.current = setTimeout(() => {
            logInteraction({
                eventType: "SEARCH_PERFORMED",
                source: "SEARCH",
                searchQuery: trimmedQuery || null,
                metadata: {
                    tags: filters.tags,
                    accessibility: filters.accessibility,
                    date: date || null,
                    time: time || null,
                    viewMode,
                },
            });

            if (hasAccessibilityFilters || hasTagFilters) {
                logInteraction({
                    eventType: "FILTER_APPLIED",
                    source: "SEARCH",
                    searchQuery: trimmedQuery || null,
                    metadata: {
                        tags: filters.tags,
                        accessibility: filters.accessibility,
                    },
                });
            }
        }, 500);

        return () => {
            if (searchLogTimeoutRef.current) {
                clearTimeout(searchLogTimeoutRef.current);
            }
        };
    }, [q, filters, date, time, viewMode]);

    function clearAllFilters() {
        setFilters({
            accessibility: [],
            tags: [],
        });
    }

    const filtered = useMemo(() => {
        return restaurants.filter((restaurant) => {
            const matchesAccessibility =
                filters.accessibility.length === 0 ||
                filters.accessibility.every((selectedOption) =>
                    (restaurant.accessibilityOptions || []).includes(selectedOption)
                );

            const matchesTags =
                filters.tags.length === 0 ||
                filters.tags.every((selectedTag) =>
                    (restaurant.tags || []).includes(selectedTag)
                );

            return matchesAccessibility && matchesTags;
        });
    }, [restaurants, filters]);

    const mapReadyRestaurants = useMemo(() => {
        return filtered.filter(hasCoordinates);
    }, [filtered]);

    useEffect(() => {
        if (!selected) return;

        const selectedStillVisible = filtered.some(
            (restaurant) => restaurant.id === selected.id
        );

        if (!selectedStillVisible) {
            setSelected(null);
        }
    }, [filtered, selected]);

    useEffect(() => {
        if (viewMode !== "map") return;
        if (!selected?.id) return;

        const element = listItemRefs.current[selected.id];

        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    }, [selected, viewMode]);

    function handleSelectRestaurant(restaurant) {
        setSelected(restaurant);
    }

    function handleOpenPreview(restaurant) {
        setPreviewRestaurant(restaurant);
        setPreviewOpen(true);

        logInteraction({
            eventType: "RESTAURANT_VIEW",
            source: "SEARCH",
            restaurantId: restaurant.id,
            searchQuery: q.trim() || null,
            metadata: {
                tags: filters.tags,
                accessibility: filters.accessibility,
                preview: true,
            },
        });
    }

    function handleClosePreview() {
        setPreviewOpen(false);
        setPreviewRestaurant(null);
    }

    function handleViewRestaurant(restaurantId) {
        logInteraction({
            eventType: "RESTAURANT_VIEW",
            source: "RESTAURANT_PAGE",
            restaurantId,
            searchQuery: q.trim() || null,
            metadata: {
                tags: filters.tags,
                accessibility: filters.accessibility,
            },
        });

        navigate(`/customer/restaurants/${restaurantId}`);
    }

    function handleBookRestaurant(restaurantId) {
        navigate(`/customer/restaurants/${restaurantId}/book`, {
            state: {
                date,
                time,
            },
        });
    }

    async function handleToggleFavourite(restaurantId) {
        const targetRestaurant = restaurants.find((item) => item.id === restaurantId);

        if (!targetRestaurant) return;

        const wasFavourite = Boolean(targetRestaurant.isFavourite);
        const method = wasFavourite ? "DELETE" : "POST";

        try {
            const res = await authFetch(`/api/customer/favourites/${restaurantId}`, {
                method,
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    getApiErrorMessage(data, "Failed to update favourite.")
                );
            }

            setRestaurants((prev) =>
                prev.map((restaurant) =>
                    restaurant.id === restaurantId
                        ? { ...restaurant, isFavourite: !wasFavourite }
                        : restaurant
                )
            );

            setSelected((prev) =>
                prev?.id === restaurantId
                    ? { ...prev, isFavourite: !wasFavourite }
                    : prev
            );

            setPreviewRestaurant((prev) =>
                prev?.id === restaurantId
                    ? { ...prev, isFavourite: !wasFavourite }
                    : prev
            );

            logInteraction({
                eventType: wasFavourite ? "FAVOURITE_REMOVED" : "FAVOURITE_ADDED",
                source: "SEARCH",
                restaurantId,
                searchQuery: q.trim() || null,
                metadata: {
                    tags: filters.tags,
                    accessibility: filters.accessibility,
                },
            });
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="search-page">
            <SearchHeaderSection
                q={q}
                setQ={setQ}
                date={date}
                setDate={setDate}
                time={time}
                setTime={setTime}
                filteredCount={filtered.length}
                filters={filters}
                setFilters={setFilters}
                clearAllFilters={clearAllFilters}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onOpenFilters={() => setDrawerOpen(true)}
            />

            <SearchResultsSection
                viewMode={viewMode}
                filtered={filtered}
                selected={selected}
                mapReadyRestaurants={mapReadyRestaurants}
                listItemRefs={listItemRefs}
                onSelectRestaurant={handleSelectRestaurant}
                onOpenPreview={handleOpenPreview}
                onBookRestaurant={handleBookRestaurant}
                onToggleFavourite={handleToggleFavourite}
            />

            <FilterDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                filters={filters}
                setFilters={setFilters}
                clearAllFilters={clearAllFilters}
                filterOptions={filterOptions}
            />

            {previewOpen && previewRestaurant && (
                <RestaurantPreviewModal
                    restaurant={previewRestaurant}
                    onClose={handleClosePreview}
                    onViewMore={() => handleViewRestaurant(previewRestaurant.id)}
                    onBook={() => handleBookRestaurant(previewRestaurant.id)}
                />
            )}
        </div>
    );
}