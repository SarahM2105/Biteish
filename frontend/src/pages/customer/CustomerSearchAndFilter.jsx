import React, { useEffect, useMemo, useRef, useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import { useNavigate } from "react-router-dom";
import RestaurantCard from "../../components/Customer/Search/RestaurantCard";
import FilterDrawer from "../../components/Customer/Search/FilterDrawer";
import RestaurantMap from "../../components/Customer/Search/RestaurantMap";
import RestaurantPreviewModal from "../../components/Customer/Search/RestaurantPreviewModal";
import "../../components/Customer/Search/css/SearchandFilter.css";
import "../../components/Customer/Search/css/FilterDrawer.css";
import "../../components/Customer/Search/css/RestaurantCard.css";
import "../../components/Customer/Search/css/RestaurantMap.css";
import "../../components/Customer/Search/css/RestaurantPreviewModal.css";
import { logout } from "../../components/utils/logout";

export default function CustomerSearchAndFilter() {
    const [active, setActive] = useState("Search and Filter");
    const [collapsed, setCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
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
        async function load() {
            try {
                const res = await authFetch("/api/customer/restaurants/search");
                const text = await res.text();
                const data = text ? JSON.parse(text) : [];
                const list = Array.isArray(data) ? data : data.restaurants || [];
                setRestaurants(list);
                if (list.length > 0) {
                    setSelected(list[0]);
                }
            } catch (error) {
                console.log(error);
                setRestaurants([]);
            }
        }
        load();
    }, []);

    useEffect(() => {
        async function loadFilterOptions() {
            try {
                const res = await authFetch("/api/customer/restaurants/filter-options");
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};
                setFilterOptions({
                    accessibilityOptions: Array.isArray(data.accessibilityOptions) ? data.accessibilityOptions : [],
                    tagCategories: Array.isArray(data.tagCategories) ? data.tagCategories : [],
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

    function clearAllFilters() {
        setFilters({
            accessibility: [],
            tags: [],
        });
    }

    const filtered = useMemo(() => {
        const search = q.toLowerCase().trim();

        return restaurants.filter((r) => {
            const matchesSearch =
                !search ||
                (r.name || "").toLowerCase().includes(search) ||
                (r.location || "").toLowerCase().includes(search) ||
                (r.cuisine || "").toLowerCase().includes(search);

            const matchesAccessibility =
                filters.accessibility.length === 0 ||
                filters.accessibility.every((selectedOption) =>
                    (r.accessibilityOptions || []).includes(selectedOption)
                );

            const matchesTags =
                filters.tags.length === 0 ||
                filters.tags.every((selectedTag) =>
                    (r.tags || []).includes(selectedTag)
                );

            return matchesSearch && matchesAccessibility && matchesTags;
        });
    }, [restaurants, q, filters]);

    useEffect(() => {
        if (filtered.length === 0) {
            setSelected(null);
            return;
        }

        const selectedStillVisible = filtered.some(
            (restaurant) => restaurant.id === selected?.id
        );

        if (!selectedStillVisible) {
            setSelected(filtered[0]);
        }
    }, [filtered, selected]);

    useEffect(() => {
        if (viewMode !== "map") return;
        if (!selected?.id) return;

        const el = listItemRefs.current[selected.id];
        if (el) {
            el.scrollIntoView({
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
    }

    function handleClosePreview() {
        setPreviewOpen(false);
        setPreviewRestaurant(null);
    }

    function handleViewRestaurant(restaurantId) {
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

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to update favourite");
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
        } catch (error) {
            console.log(error);
        }
    }

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
            <div className="search-page">
                <section className="search-hero dashboard-panel">
                    <div className="search-hero__text">
                        <h1 className="page-title search-hero__title">Search restaurants</h1>
                        <p className="search-hero__subtitle">
                            Discover restaurants by name, cuisine, and location.
                        </p>
                    </div>

                    <div className="search-hero__form">
                        <div className="sf-search search-hero__search">
                            <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search restaurants, cuisine, or location"
                            />
                            <span className="sf-search-icon">🔍︎</span>
                        </div>

                        <input
                            className="sf-input"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />

                        <input
                            className="sf-input"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />

                        <button
                            className="sf-filterBtn"
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                        >
                            Filters
                        </button>
                    </div>
                </section>

                <section className="search-controls">
                    <div className="search-controls__left">
                        <h3>
                            {filtered.length} restaurant{filtered.length === 1 ? "" : "s"}
                        </h3>

                        {(filters.accessibility.length > 0 || filters.tags.length > 0) && (
                            <div className="search-controls__filters">
                                {filters.accessibility.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className="active-filter-chip"
                                        onClick={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                accessibility: prev.accessibility.filter((x) => x !== item),
                                            }))
                                        }
                                    >
                                        {item} ✕
                                    </button>
                                ))}

                                {filters.tags.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className="active-filter-chip"
                                        onClick={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                tags: prev.tags.filter((x) => x !== item),
                                            }))
                                        }
                                    >
                                        {item} ✕
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    className="clear-all-chip"
                                    onClick={clearAllFilters}
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="search-controls__actions">
                        <div className="view-toggle">
                            <button
                                type="button"
                                className={viewMode === "grid" ? "is-active" : ""}
                                onClick={() => setViewMode("grid")}
                            >
                                Grid
                            </button>
                            <button
                                type="button"
                                className={viewMode === "map" ? "is-active" : ""}
                                onClick={() => setViewMode("map")}
                            >
                                Map
                            </button>
                        </div>
                    </div>
                </section>

                {viewMode === "grid" ? (
                    <section className="search-results">
                        <div className="search-results__grid">
                            {filtered.map((restaurant) => (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                    isSelected={selected?.id === restaurant.id}
                                    onSelect={() => handleSelectRestaurant(restaurant)}
                                    onViewMore={() => handleOpenPreview(restaurant)}
                                    onBook={() => handleBookRestaurant(restaurant.id)}
                                    onToggleFavourite={() => handleToggleFavourite(restaurant.id)}
                                />
                            ))}
                        </div>
                    </section>
                ) : (
                    <div className="search-map-layout">
                        <section className="search-map-list">
                            <div className="search-map-list__items">
                                {filtered.map((restaurant, index) => {
                                    const numericRating =
                                        restaurant.rating !== null &&
                                        restaurant.rating !== undefined &&
                                        restaurant.rating !== ""
                                            ? Number(restaurant.rating)
                                            : Number(restaurant.averageRating || 0);

                                    return (
                                        <button
                                            key={restaurant.id}
                                            ref={(el) => {
                                                listItemRefs.current[restaurant.id] = el;
                                            }}
                                            type="button"
                                            className={`search-map-list__item ${selected?.id === restaurant.id ? "is-selected" : ""}`}
                                            onClick={() => {
                                                handleSelectRestaurant(restaurant);
                                            }}
                                        >
                                            <div className="search-map-list__number">{index + 1}</div>

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
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="search-map-panel dashboard-panel">
                            <RestaurantMap
                                restaurants={filtered}
                                selected={selected}
                                onSelectRestaurant={handleSelectRestaurant}
                                onPreviewRestaurant={handleOpenPreview}
                            />
                        </section>
                    </div>
                )}

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
        </AppLayout>
    );
}