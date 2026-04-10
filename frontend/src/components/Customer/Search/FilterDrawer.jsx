import React from "react";

function toggleValue(list, value) {
    return list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
}

export default function FilterDrawer({
                                         open,
                                         onClose,
                                         filters,
                                         setFilters,
                                         clearAllFilters,
                                         filterOptions,
                                     }) {
    if (!open) return null;
    function handleToggle(group, value) {
        setFilters((prev) => ({
            ...prev,
            [group]: toggleValue(prev[group], value),
        }));
    }
    const accessibilityOptions = filterOptions?.accessibilityOptions || [];
    const tagCategories = filterOptions?.tagCategories || [];
    return (
        <div className="filter-drawer-overlay" onClick={onClose}>
            <aside
                className="filter-drawer"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="filter-drawer__header">
                    <div>
                        <h3>Filters</h3>
                        <p>Refine restaurants without clashing with the side nav.</p>
                    </div>

                    <button
                        type="button"
                        className="filter-drawer__close"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className="filter-drawer__body">
                    <div className="filter-drawer__section">
                        <h4>Accessibility</h4>
                        <div className="filter-drawer__chips">
                            {accessibilityOptions.length > 0 ? (
                                accessibilityOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        className={
                                            filters.accessibility.includes(option.optionName)
                                                ? "filter-chip is-active"
                                                : "filter-chip"
                                        }
                                        onClick={() =>
                                            handleToggle("accessibility", option.optionName)
                                        }
                                    >
                                        {option.optionName}
                                    </button>
                                ))
                            ) : (
                                <div className="filter-drawer__empty">
                                    No accessibility options found.
                                </div>
                            )}
                        </div>
                    </div>
                    {tagCategories.map((category) => (
                        <div key={category.id} className="filter-drawer__section">
                            <h4>{category.name}</h4>
                            <div className="filter-drawer__chips">
                                {category.tags && category.tags.length > 0 ? (
                                    category.tags.map((tag) => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            className={
                                                filters.tags.includes(tag.name)
                                                    ? "filter-chip is-active"
                                                    : "filter-chip"
                                            }
                                            onClick={() => handleToggle("tags", tag.name)}
                                        >
                                            {tag.name}
                                        </button>
                                    ))
                                ) : (
                                    <div className="filter-drawer__empty">
                                        No tags in this category.
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="filter-drawer__footer">
                    <button
                        type="button"
                        className="filter-drawer__clear"
                        onClick={clearAllFilters}
                    >
                        Clear all
                    </button>

                    <button
                        type="button"
                        className="filter-drawer__apply"
                        onClick={onClose}
                    >
                        Apply
                    </button>
                </div>
            </aside>
        </div>
    );
}