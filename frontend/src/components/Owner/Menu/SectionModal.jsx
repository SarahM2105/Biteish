import React from "react";

export default function SectionModal({
                                         open,
                                         saving,
                                         sectionForm,
                                         setSectionForm,
                                         onClose,
                                         onSubmit,
                                     }) {
    if (!open) return null;

    return (
        <div className="owner-menu-modal-backdrop">
            <div className="owner-menu-modal">
                <div className="owner-menu-modal__header">
                    <div>
                        <p className="owner-menu-modal__eyebrow">Section</p>
                        <h3>{sectionForm.id ? "Edit section" : "Create section"}</h3>
                    </div>

                    <button
                        type="button"
                        className="owner-menu-modal__close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <form className="owner-menu-form" onSubmit={onSubmit}>
                    <label className="owner-menu-field">
                        <span>Section name</span>
                        <input
                            type="text"
                            value={sectionForm.name}
                            onChange={(event) =>
                                setSectionForm((prev) => ({
                                    ...prev,
                                    name: event.target.value,
                                }))
                            }
                            placeholder="e.g. Starters"
                        />
                    </label>

                    <label className="owner-menu-field">
                        <span>Description</span>
                        <textarea
                            value={sectionForm.description}
                            onChange={(event) =>
                                setSectionForm((prev) => ({
                                    ...prev,
                                    description: event.target.value,
                                }))
                            }
                            placeholder="A short description for this section"
                        />
                    </label>

                    <label className="owner-menu-toggle">
                        <input
                            type="checkbox"
                            checked={sectionForm.isActive}
                            onChange={(event) =>
                                setSectionForm((prev) => ({
                                    ...prev,
                                    isActive: event.target.checked,
                                }))
                            }
                        />
                        <span>Section is active</span>
                    </label>

                    <div className="owner-menu-form__actions">
                        <button
                            type="button"
                            className="owner-menu-btn owner-menu-btn--secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="owner-menu-btn owner-menu-btn--primary"
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save section"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}