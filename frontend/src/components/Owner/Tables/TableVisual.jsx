import React, { useMemo } from "react";

function getTableVariant(capacity) {
    const count = Number(capacity) || 1;

    if (count <= 2) return "table-visual__table--two";
    if (count <= 4) return "table-visual__table--four";
    if (count <= 6) return "table-visual__table--six";
    if (count <= 8) return "table-visual__table--eight";
    if (count <= 12) return "table-visual__table--large";
    return "table-visual__table--extra-large";
}

function getStageVariant(capacity) {
    const count = Number(capacity) || 1;

    if (count <= 2) return "table-visual__stage--two";
    if (count <= 4) return "table-visual__stage--four";
    if (count <= 6) return "table-visual__stage--six";
    if (count <= 8) return "table-visual__stage--eight";
    if (count <= 12) return "table-visual__stage--large";
    return "table-visual__stage--extra-large";
}

function getChairPositions(capacity) {
    const count = Number(capacity) || 1;

    if (count <= 2) {
        return ["top-center", "bottom-center"].slice(0, count);
    }

    if (count <= 4) {
        return ["top-center", "right-center", "bottom-center", "left-center"].slice(0, count);
    }

    if (count <= 6) {
        return [
            "top-left",
            "top-right",
            "right-center",
            "bottom-right",
            "bottom-left",
            "left-center",
        ].slice(0, count);
    }

    if (count <= 8) {
        return [
            "top-left",
            "top-right",
            "right-top",
            "right-bottom",
            "bottom-right",
            "bottom-left",
            "left-bottom",
            "left-top",
        ];
    }

    return [];
}

function getTableTone(capacity) {
    const count = Number(capacity) || 1;

    if (count <= 4) return "table-visual--small";
    if (count <= 8) return "table-visual--medium";
    if (count <= 12) return "table-visual--large";
    return "table-visual--extra-large";
}

function getStatusClass(status, isInactive) {
    if (isInactive) return "is-inactive";
    if (status === "OCCUPIED") return "is-occupied";
    if (status === "RESERVED") return "is-reserved";
    if (status === "AVAILABLE") return "is-available";
    return "";
}

export default function TableVisual({
                                        table,
                                        selected = false,
                                        isSelected = false,
                                        status = "",
                                        onClick,
                                        className = "",
                                    }) {
    const capacity = Number(table.capacity) || 1;

    const chairs = useMemo(() => getChairPositions(capacity), [capacity]);
    const tableVariant = useMemo(() => getTableVariant(capacity), [capacity]);
    const stageVariant = useMemo(() => getStageVariant(capacity), [capacity]);
    const tone = useMemo(() => getTableTone(capacity), [capacity]);

    const activeSelected = selected || isSelected;
    const isInactive = table.active === false;
    const statusClass = getStatusClass(status, isInactive);

    return (
        <div
            className={`table-visual ${tone} ${activeSelected ? "is-selected" : ""} ${statusClass} ${className}`.trim()}
            onClick={onClick}
        >
            <div className={`table-visual__stage ${stageVariant}`}>
                <div className={`table-visual__table ${tableVariant}`}>
                    <strong>{table.name || "Table"}</strong>
                    <span>{capacity} seats</span>

                    {capacity > 8 ? (
                        <em className="table-visual__type-label">
                            {capacity <= 12 ? "Large" : "Extra Large"}
                        </em>
                    ) : null}
                </div>

                {chairs.map((pos) => (
                    <span
                        key={pos}
                        className={`table-visual__chair table-visual__chair--${pos}`}
                    />
                ))}
            </div>
        </div>
    );
}