import React from "react";

export default function DeleteConfirmModal({
                                               open,
                                               type,
                                               item,
                                               deleting,
                                               status,
                                               onClose,
                                               onConfirm,
                                           }) {
    if (!open) return null;

    const label = type === "zone" ? "zone" : "table";
    const name = item?.name || label;

    return (
        <div className="owner-modal-backdrop">
            <div className="owner-modal owner-modal--small">
                <div className="owner-modal__header">
                    <div>
                        <p className="owner-modal__eyebrow">Delete</p>
                        <h3>Delete {label}</h3>
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

                <div className="owner-delete-copy">
                    <p>
                        Are you sure you want to delete <strong>{name}</strong>?
                    </p>
                    <p>This action cannot be undone.</p>
                </div>

                <div className="owner-modal__actions">
                    <button
                        type="button"
                        className="owner-modal__button owner-modal__button--ghost"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="owner-modal__button owner-modal__button--danger"
                        disabled={deleting}
                        onClick={onConfirm}
                    >
                        {deleting ? "Deleting..." : `Delete ${label}`}
                    </button>
                </div>
            </div>
        </div>
    );
}