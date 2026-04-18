import React, { useEffect, useState } from "react";
import TableVisual from "./TableVisual";

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

    const previewTable = {
        id: table?.id || "preview-table",
        name: name || "Table",
        capacity: Number(capacity) || 0,
        active,
        reservable,
        zoneId,
    };

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

                        <TableVisual
                            table={previewTable}
                            className="table-visual--preview"
                            onClick={() => {}}
                        />

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