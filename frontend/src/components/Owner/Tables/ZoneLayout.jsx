import React from "react";
import TableVisual from "./TableVisual";

export default function ZoneLayout({
                                       zone,
                                       tables,
                                       selectedTableId,
                                       onSelectTable,
                                   }) {
    function handleSelectTable(tableId) {
        onSelectTable(selectedTableId === tableId ? null : tableId);
    }

    return (
        <section className="zone-layout">
            <div className="zone-layout__header">
                <div>
                    <p className="zone-layout__eyebrow">Selected zone</p>
                    <h2 className="zone-layout__title">
                        {zone?.name || "No zone selected"}
                    </h2>
                    <p className="zone-layout__text">
                        Click a table to view its details.
                    </p>
                </div>
            </div>

            {!zone ? (
                <div className="zone-layout__empty">
                    <p>Select a zone to view its table layout.</p>
                </div>
            ) : !tables.length ? (
                <div className="zone-layout__empty">
                    <p>No tables in this zone yet.</p>
                </div>
            ) : (
                <div
                    className="zone-layout__grid zone-layout__grid--simple"
                    onClick={() => onSelectTable(null)}
                >
                    {tables.map((table) => (
                        <TableVisual
                            key={table.id}
                            table={table}
                            selected={table.id === selectedTableId}
                            onClick={(event) => {
                                event.stopPropagation();
                                handleSelectTable(table.id);
                            }}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}