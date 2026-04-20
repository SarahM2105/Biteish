import React from "react";

export default function ChangeRequestModal({
                                                       isOpen,
                                                       request,
                                                       form,
                                                       setForm,
                                                       acting,
                                                       onClose,
                                                       onSubmit,
                                                   }) {
    if (!isOpen || !request) return null;

    return (
        <div className="owner-request-modal-backdrop" onClick={onClose}>
            <div
                className="owner-request-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="owner-request-modal__header">
                    <div>
                        <p className="owner-requests-section__eyebrow">Propose different change</p>
                        <h3>Update the booking proposal</h3>
                    </div>
                    <button
                        type="button"
                        className="owner-request-modal__close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="owner-request-modal__form">
                    <label>
                        <span>Start time</span>
                        <input
                            type="datetime-local"
                            value={form.startsAt}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, startsAt: e.target.value }))
                            }
                        />
                    </label>

                    <label>
                        <span>End time</span>
                        <input
                            type="datetime-local"
                            value={form.endsAt}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, endsAt: e.target.value }))
                            }
                        />
                    </label>

                    <label>
                        <span>Party size</span>
                        <input
                            type="number"
                            min="1"
                            value={form.partySize}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, partySize: e.target.value }))
                            }
                        />
                    </label>

                    <label>
                        <span>Table ID</span>
                        <input
                            type="text"
                            value={form.tableId}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, tableId: e.target.value }))
                            }
                        />
                    </label>

                    <label className="owner-request-modal__textarea">
                        <span>Notes</span>
                        <textarea
                            rows="4"
                            value={form.notes}
                            onChange={(e) =>
                                setForm((prev) => ({ ...prev, notes: e.target.value }))
                            }
                        />
                    </label>
                </div>

                <div className="owner-request-actions">
                    <button
                        type="button"
                        className="owner-request-button owner-request-button--secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="owner-request-button owner-request-button--primary"
                        onClick={onSubmit}
                        disabled={acting}
                    >
                        {acting ? "Working..." : "Send updated proposal"}
                    </button>
                </div>
            </div>
        </div>
    );
}