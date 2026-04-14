import React from "react";

export default function ZoneTabs({
                                     zones,
                                     selectedZoneId,
                                     onSelectZone,
                                     onEditZone,
                                     onDeleteZone,
                                 }) {
    if (!zones.length) {
        return (
            <section className="zone-tabs zone-tabs--empty">
                <div className="zone-tabs__empty">
                    <strong>No zones yet</strong>
                    <p>Create a zone first so you can start adding tables.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="zone-tabs">
            {zones.map((zone) => {
                const isActive = zone.id === selectedZoneId;

                return (
                    <article
                        key={zone.id}
                        className={`zone-tab ${isActive ? "is-active" : ""}`}
                    >
                        <button
                            type="button"
                            className="zone-tab__main"
                            onClick={() => onSelectZone(zone.id)}
                        >
                            <span className="zone-tab__name">{zone.name}</span>
                            <span className="zone-tab__meta">
                                <span>{zone.tableCount} tables</span>
                                <span>{zone.seatCount} seats</span>
                            </span>
                        </button>

                        <div className="zone-tab__actions">
                            <button
                                type="button"
                                className="zone-tab__action"
                                onClick={() => onEditZone(zone)}
                            >
                                Edit
                            </button>
                            <button
                                type="button"
                                className="zone-tab__action zone-tab__action--danger"
                                onClick={() => onDeleteZone(zone)}
                            >
                                Delete
                            </button>
                        </div>
                    </article>
                );
            })}
        </section>
    );
}