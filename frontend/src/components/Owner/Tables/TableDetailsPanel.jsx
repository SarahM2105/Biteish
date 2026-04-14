import React from "react";

export default function TableDetailsPanel({
                                              zone,
                                              table,
                                              zoneTables,
                                              onAddTable,
                                              onEditTable,
                                              onDeleteTable,
                                              onEditZone,
                                              onDeleteZone,
                                          }) {
    const totalSeats = zoneTables.reduce(
        (sum, current) => sum + Number(current.capacity || 0),
        0
    );

    return (
        <aside className="table-details-panel">
            {table ? (
                <>
                    <div className="table-details-panel__header">
                        <p className="table-details-panel__eyebrow">Selected table</p>
                        <h3>{table.name}</h3>
                        <p>Use this panel to manage the selected table.</p>
                    </div>

                    <div className="table-details-panel__stack">
                        <div className="table-details-card">
                            <span>Capacity</span>
                            <strong>{table.capacity} seats</strong>
                        </div>

                        <div className="table-details-card">
                            <span>Zone</span>
                            <strong>{zone?.name || "Unknown zone"}</strong>
                        </div>

                        <div className="table-details-card">
                            <span>Booking type</span>
                            <strong>{table.reservable ? "Reservable" : "Walk-in only"}</strong>
                        </div>

                        <div className="table-details-card">
                            <span>Status</span>
                            <strong>{table.active ? "Active" : "Inactive"}</strong>
                        </div>
                    </div>

                    <div className="table-details-panel__actions">
                        <button
                            type="button"
                            className="table-details-panel__button table-details-panel__button--primary"
                            onClick={() => onEditTable(table)}
                        >
                            Edit Table
                        </button>
                        <button
                            type="button"
                            className="table-details-panel__button table-details-panel__button--danger"
                            onClick={() => onDeleteTable(table)}
                        >
                            Delete Table
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="table-details-panel__header">
                        <p className="table-details-panel__eyebrow">Zone overview</p>
                        <h3>{zone?.name || "No zone selected"}</h3>
                        <p>
                            {zone?.description ||
                                "Click a table in the layout to view its details here."}
                        </p>
                    </div>

                    {zone ? (
                        <>
                            <div className="table-details-panel__stack">
                                <div className="table-details-card">
                                    <span>Tables in zone</span>
                                    <strong>{zoneTables.length}</strong>
                                </div>

                                <div className="table-details-card">
                                    <span>Total seats</span>
                                    <strong>{totalSeats}</strong>
                                </div>
                            </div>

                            <div className="table-details-panel__actions">
                                <button
                                    type="button"
                                    className="table-details-panel__button table-details-panel__button--primary"
                                    onClick={onAddTable}
                                >
                                    Add Table
                                </button>
                                <button
                                    type="button"
                                    className="table-details-panel__button table-details-panel__button--secondary"
                                    onClick={() => onEditZone(zone)}
                                >
                                    Edit Zone
                                </button>
                                <button
                                    type="button"
                                    className="table-details-panel__button table-details-panel__button--danger"
                                    onClick={() => onDeleteZone(zone)}
                                >
                                    Delete Zone
                                </button>
                            </div>
                        </>
                    ) : null}
                </>
            )}
        </aside>
    );
}