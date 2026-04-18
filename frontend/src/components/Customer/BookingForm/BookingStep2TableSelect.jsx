import React, { useMemo } from "react";
import TableVisual from "../../Owner/Tables/TableVisual";

export default function BookingStep2TableSelect({ zones, tables, form, updateForm }) {
    const selectedZone = useMemo(() => {
        return zones.find((zone) => zone.id === form.zoneId) || null;
    }, [zones, form.zoneId]);

    const visibleTables = useMemo(() => {
        return Array.isArray(tables) ? tables : [];
    }, [tables]);

    return (
        <div className="booking-step booking-step--tables">
            <div className="booking-step__header">
                <h2>Step 2: Choose table</h2>
                <p>Select a table that matches your booking details.</p>
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
                <div className="booking-step__empty">
                    <p>Select a zone to view available tables.</p>
                </div>
            ) : visibleTables.length === 0 ? (
                <div className="booking-step__empty">
                    <p>No matching tables are available in this zone for your selected time and party size.</p>
                </div>
            ) : (
                <div className="booking-step__layout">
                    <div className="booking-step__layout-main">
                        <div className="booking-step__zone-card">
                            <div className="booking-step__zone-card-header">
                                <h3>{selectedZone?.name || "Selected zone"}</h3>
                                <p>{visibleTables.length} table{visibleTables.length === 1 ? "" : "s"} available</p>
                            </div>

                            <div className="booking-step__table-grid">
                                {visibleTables.map((table) => (
                                    <button
                                        key={table.id}
                                        type="button"
                                        className="booking-step__table-button"
                                        onClick={() => updateForm("tableId", table.id)}
                                    >
                                        <TableVisual
                                            table={table}
                                            selected={form.tableId === table.id}
                                            onClick={() => {}}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <aside className="booking-step__layout-side">
                        <div className="booking-step__selection-card">
                            <p className="booking-step__selection-eyebrow">Selected table</p>

                            {form.tableId ? (
                                (() => {
                                    const selectedTable =
                                        visibleTables.find((table) => table.id === form.tableId) || null;

                                    if (!selectedTable) {
                                        return (
                                            <div className="booking-step__empty booking-step__empty--side">
                                                <p>Please choose a table.</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="booking-step__selection-details">
                                            <h3>{selectedTable.name}</h3>
                                            <p>
                                                {selectedZone?.name || "Zone"} · {selectedTable.capacity} seats
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
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="booking-step__empty booking-step__empty--side">
                                    <p>Click a table to select it for your booking.</p>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
}