import React, { useEffect, useMemo, useState } from "react";

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

export default function TableModal({
                                       open,
                                       mode,
                                       table,
                                       zones,
                                       initialZoneId,
                                       saving,
                                       status,
                                       onClose,
                                       onSubmit,
                                   }) {
    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState(2);
    const [zoneId, setZoneId] = useState("");
    const [reservable, setReservable] = useState(true);
    const [active, setActive] = useState(true);

    useEffect(() => {
        if (open) {
            setName(table?.name || "");
            setCapacity(table?.capacity || 2);
            setZoneId(table?.zoneId || initialZoneId || zones[0]?.id || "");
            setReservable(typeof table?.reservable === "boolean" ? table.reservable : true);
            setActive(typeof table?.active === "boolean" ? table.active : true);
        }
    }, [open, table, initialZoneId, zones]);

    const previewChairs = useMemo(() => getChairPositions(capacity), [capacity]);
    const tableVariant = useMemo(() => getTableVariant(capacity), [capacity]);
    const stageVariant = useMemo(() => getStageVariant(capacity), [capacity]);

    if (!open) return null;

    function handleSubmit(event) {
        event.preventDefault();

        onSubmit({
            name,
            capacity: Number(capacity),
            zoneId,
            reservable,
            active,
        });
    }

    return (
        <div className="owner-modal-backdrop">
            <div className="owner-modal owner-modal--wide">
                <div className="owner-modal__header">
                    <div>
                        <p className="owner-modal__eyebrow">Table</p>
                        <h3>{mode === "edit" ? "Edit Table" : "Add Table"}</h3>
                    </div>

                    <button type="button" className="owner-modal__close" onClick={onClose}>
                        ×
                    </button>
                </div>

                {status ? (
                    <div className="owner-modal__status owner-modal__status--error">
                        {status}
                    </div>
                ) : null}

                <form className="owner-modal__split" onSubmit={handleSubmit}>
                    <div className="owner-modal__form owner-modal__form--split">
                        <label className="owner-modal__field">
                            <span>Table name</span>
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="T1"
                                required
                            />
                        </label>

                        <label className="owner-modal__field">
                            <span>Capacity</span>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                value={capacity}
                                onChange={(event) => setCapacity(event.target.value)}
                                required
                            />
                        </label>

                        <label className="owner-modal__field">
                            <span>Zone</span>
                            <select
                                value={zoneId}
                                onChange={(event) => setZoneId(event.target.value)}
                                disabled={mode === "edit"}
                                required
                            >
                                {zones.map((zone) => (
                                    <option key={zone.id} value={zone.id}>
                                        {zone.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="owner-modal__toggle">
                            <input
                                type="checkbox"
                                checked={reservable}
                                onChange={(event) => setReservable(event.target.checked)}
                            />
                            <span>Reservable online</span>
                        </label>

                        <label className="owner-modal__toggle">
                            <input
                                type="checkbox"
                                checked={active}
                                onChange={(event) => setActive(event.target.checked)}
                            />
                            <span>Active table</span>
                        </label>

                        <div className="owner-modal__actions">
                            <button
                                type="button"
                                className="owner-modal__button owner-modal__button--ghost"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="owner-modal__button owner-modal__button--primary"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : mode === "edit" ? "Save Table" : "Create Table"}
                            </button>
                        </div>
                    </div>

                    <div className="owner-table-preview">
                        <p className="owner-table-preview__eyebrow">Live preview</p>

                        <div className={`table-visual table-visual--preview ${active ? "" : "is-inactive"}`}>
                            <div className={`table-visual__stage ${stageVariant}`}>
                                <div className={`table-visual__table ${tableVariant}`}>
                                    <strong>{name || "Table"}</strong>
                                    <span>{Number(capacity) || 0} seats</span>
                                    {Number(capacity) > 8 ? (
                                        <em className="table-visual__type-label">
                                            {Number(capacity) <= 12 ? "Large table" : "Extra Large"}
                                        </em>
                                    ) : null}
                                </div>

                                {previewChairs.map((position) => (
                                    <span
                                        key={position}
                                        className={`table-visual__chair table-visual__chair--${position}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {mode === "edit" ? (
                            <p className="owner-table-preview__note">
                                Zone changes are not enabled in edit mode yet.
                            </p>
                        ) : null}
                    </div>
                </form>
            </div>
        </div>
    );
}