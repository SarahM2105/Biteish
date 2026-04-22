import React from "react";

export default function SearchHeaderSection({
                                                q,
                                                setQ,
                                                date,
                                                setDate,
                                                time,
                                                setTime,
                                                filteredCount,
                                                filters,
                                                setFilters,
                                                clearAllFilters,
                                                viewMode,
                                                setViewMode,
                                                onOpenFilters,
                                            }) {
    return (
        <>
            <section className="search-header dashboard-panel">
                <div className="search-header__text">
                    <h1 className="page-title search-header__title">Search restaurants</h1>
                    <p className="search-header__subtitle">
                        Discover restaurants by name, cuisine, and location.
                    </p>
                </div>

                <div className="search-header__form">
                    <div className="sf-search search-header__search">
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
                        onClick={onOpenFilters}
                    >
                        Filters
                    </button>
                </div>
            </section>

            <section className="search-controls">
                <div className="search-controls__left">
                    <h3>
                        {filteredCount} restaurant{filteredCount === 1 ? "" : "s"}
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
                                            accessibility: prev.accessibility.filter(
                                                (x) => x !== item
                                            ),
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
        </>
    );
}