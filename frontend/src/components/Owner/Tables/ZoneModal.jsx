import React, { useEffect, useState } from "react";

export default function ZoneModal({
                                      open,
                                      mode,
                                      zone,
                                      saving,
                                      status,
                                      onClose,
                                      onSubmit,
                                  }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        if (open) {
            setName(zone?.name || "");
            setDescription(zone?.description || "");
        }
    }, [open, zone]);

    if (!open) return null;

    function handleSubmit(event) {
        event.preventDefault();
        onSubmit({ name, description });
    }

    return (
        <div className="owner-modal-backdrop">
            <div className="owner-modal owner-modal--small">
                <div className="owner-modal__header">
                    <div>
                        <p className="owner-modal__eyebrow">Zone</p>
                        <h3>{mode === "edit" ? "Edit Zone" : "Add Zone"}</h3>
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

                <form className="owner-modal__form" onSubmit={handleSubmit}>
                    <label className="owner-modal__field">
                        <span>Zone name</span>
                        <input
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Main Dining"
                            required
                        />
                    </label>

                    <label className="owner-modal__field">
                        <span>Description</span>
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Describe this seating area"
                        />
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
                            {saving ? "Saving..." : mode === "edit" ? "Save Zone" : "Create Zone"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}