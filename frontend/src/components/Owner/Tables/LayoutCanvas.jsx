import React from "react";
import TableVisual from "./TableVisual";
import "./css/LayoutCanvas.css"

function defaultGetTableStatus(table) {
    if (!table.active) return "INACTIVE";

    if (table.currentReservation?.checkedInAt) {
        return "OCCUPIED";
    }

    if (table.currentReservation) {
        return "RESERVED";
    }

    return "AVAILABLE";
}

function defaultIsTableDisabled(table, mode) {
    if (mode === "customer") {
        return table.active === false || table.isBookable === false;
    }

    return false;
}

export default function LayoutCanvas({
                                         zones = [],
                                         selectedTableId = null,
                                         onSelectTable = () => {},
                                         mode = "owner",
                                         getTableStatus = defaultGetTableStatus,
                                         isTableDisabled = defaultIsTableDisabled,
                                     }) {
    function handleTableSelect(table) {
        const disabled = isTableDisabled(table, mode);

        if (disabled) {
            return;
        }

        onSelectTable(selectedTableId === table.id ? null : table.id);
    }

    return (
        <div className="layout-canvas">
            {zones.map((zone) => (
                <div key={zone.id} className="layout-canvas__zone">
                    <div className="layout-canvas__zone-header">
                        <h3>{zone.name}</h3>
                    </div>

                    <div
                        className="layout-canvas__tables"
                        onClick={() => {
                            if (mode !== "customer") {
                                onSelectTable(null);
                            }
                        }}
                    >
                        {zone.tables?.map((table) => {
                            const status = getTableStatus(table, mode);
                            const isSelected = selectedTableId === table.id;
                            const disabled = isTableDisabled(table, mode);

                            return (
                                <div
                                    key={table.id}
                                    className={`layout-canvas__table-item ${disabled ? "is-disabled" : ""}`}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        handleTableSelect(table);
                                    }}
                                >
                                    <TableVisual
                                        table={table}
                                        isSelected={isSelected}
                                        status={status}
                                        onClick={() => {}}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}