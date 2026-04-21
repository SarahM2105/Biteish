import React from "react";

export default function FilterTabs({ filters = [], activeFilter, onChange }) {
    return (
        <section className="dashboard-panel notifications-toolbar">
            <div className="notifications-filters">
                {filters.map((filter) => (
                    <button
                        key={filter.key}
                        type="button"
                        className={`notifications-filter ${activeFilter === filter.key ? "is-active" : ""}`}
                        onClick={() => onChange(filter.key)}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </section>
    );
}