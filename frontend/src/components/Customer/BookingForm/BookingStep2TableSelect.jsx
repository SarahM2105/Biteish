import React, { useMemo } from "react";
import TableVisual from "../../Owner/Tables/TableVisual";

function getTableTagNames(table) {
    if (!Array.isArray(table?.tags)) return [];

    return [...new Set(
        table.tags
            .map((tag) => tag?.name)
            .filter(Boolean)
    )];
}

export default function BookingStep2TableSelect({ zones, tables, form, updateForm }) {
    const selectedZone = useMemo(() => {
        return zones.find((zone) => zone.id === form.zoneId) || null;
    }, [zones, form.zoneId]);

    const visibleTables = useMemo(() => {
        if (!Array.isArray(tables)) return [];

        const partySize = Number(form.partySize) || 1;

        return [...tables].sort((a, b) => {
            const aCapacity = Number(a.capacity) || 0;
            const bCapacity = Number(b.capacity) || 0;

            const aFits = aCapacity >= partySize;
            const bFits = bCapacity >= partySize;

            if (aFits && !bFits) return -1;
            if (!aFits && bFits) return 1;

            if (aCapacity !== bCapacity) {
                return aCapacity - bCapacity;
            }

            return String(a.name || "").localeCompare(String(b.name || ""));
        });
    }, [tables, form.partySize]);

    const selectedTable = useMemo(() => {
        return visibleTables.find((table) => table.id === form.tableId) || null;
    }, [visibleTables, form.tableId]);

    return (
        <section className="booking-step-card booking-step-card--tables">
            <div className="booking-step-card__header">
                <p className="booking-step-card__eyebrow">Step 2</p>
                <h2>Choose table</h2>
                <p>
                    Pick a zone first, then choose the table that best fits your
                    booking.
                </p>
            </div>

            <div className="booking-step__zone-picker">
                <label htmlFor="booking-zone">Zone</label>
                <select
                    id="booking-zone"
                    value={form.zoneId}
                    onChange={(event) => {
                        updateForm("zoneId", event.target.value);
                        updateForm("tableId", "");
                    }}
                >
                    <option value="">Select a zone</option>
                    {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                            {zone.name}
                        </option>
                    ))}
                </select>
            </div>

            {!form.zoneId ? (
                <div className="booking-step__empty booking-step__empty--large">
                    <h3>No zone selected yet</h3>
                    <p>Select a zone to view available tables.</p>
                </div>
            ) : visibleTables.length === 0 ? (
                <div className="booking-step__empty booking-step__empty--large">
                    <h3>No tables available</h3>
                    <p>
                        No matching tables are available in this zone for your
                        selected time and party size.
                    </p>
                </div>
            ) : (
                <div className="booking-step__layout">
                    <div className="booking-step__layout-main">
                        <div className="booking-step__zone-card">
                            <div className="booking-step__zone-card-header">
                                <div>
                                    <p className="booking-step__zone-eyebrow">
                                        {selectedZone?.name || "Selected zone"}
                                    </p>
                                    <h3>Available tables</h3>
                                </div>

                                <div className="booking-step__zone-count">
                                    {visibleTables.length} table
                                    {visibleTables.length === 1 ? "" : "s"}
                                </div>
                            </div>

                            <div className="booking-step__table-grid">
                                {visibleTables.map((table) => (
                                    <button
                                        key={table.id}
                                        type="button"
                                        className={`booking-step__table-button ${
                                            form.tableId === table.id ? "is-selected" : ""
                                        }`}
                                        onClick={() => updateForm("tableId", table.id)}
                                    >
                                        <div className="booking-step__table-card">
                                            <TableVisual
                                                table={table}
                                                selected={form.tableId === table.id}
                                                onClick={() => {}}
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <aside className="booking-step__layout-side">
                        <div className="booking-step__selection-card">
                            <p className="booking-step__selection-eyebrow">
                                Selected table
                            </p>

                            {selectedTable ? (
                                <div className="booking-step__selection-details">
                                    <h3>{selectedTable.name}</h3>
                                    <p>
                                        {selectedZone?.name || "Zone"} ·{" "}
                                        {selectedTable.capacity} seats
                                    </p>

                                    <div className="booking-step__selection-meta">
                                        <div>
                                            <span>Party size</span>
                                            <strong>{form.partySize}</strong>
                                        </div>
                                        <div>
                                            <span>Capacity</span>
                                            <strong>{selectedTable.capacity}</strong>
                                        </div>
                                    </div>

                                    {getTableTagNames(selectedTable).length > 0 && (
                                        <div className="booking-step__selection-tags">
                                            {getTableTagNames(selectedTable).map((tagName) => (
                                                <span
                                                    key={`selected-${tagName}`}
                                                    className="booking-step__table-tag"
                                                >
                                                    {tagName}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="booking-step__empty booking-step__empty--side">
                                    <p>Click a table to select it for your booking.</p>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            )}
        </section>
    );
}