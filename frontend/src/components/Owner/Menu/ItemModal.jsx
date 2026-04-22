import React from "react";

export default function ItemModal({
                                      open,
                                      saving,
                                      itemForm,
                                      setItemForm,
                                      sections,
                                      onClose,
                                      onSubmit,
                                  }) {
    if (!open) return null;

    return (
        <div className="owner-menu-modal-backdrop">
            <div className="owner-menu-modal">
                <div className="owner-menu-modal__header">
                    <div>
                        <p className="owner-menu-modal__eyebrow">Menu item</p>
                        <h3>{itemForm.id ? "Edit item" : "Create item"}</h3>
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
                        <span>Section</span>
                        <select
                            value={itemForm.sectionId}
                            onChange={(event) =>
                                setItemForm((prev) => ({
                                    ...prev,
                                    sectionId: event.target.value,
                                }))
                            }
                        >
                            <option value="">Choose a section</option>
                            {sections.map((section) => (
                                <option key={section.id} value={section.id}>
                                    {section.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div className="owner-menu-form__grid">
                        <label className="owner-menu-field">
                            <span>Item name</span>
                            <input
                                type="text"
                                value={itemForm.name}
                                onChange={(event) =>
                                    setItemForm((prev) => ({
                                        ...prev,
                                        name: event.target.value,
                                    }))
                                }
                                placeholder="e.g. Garlic Bread"
                            />
                        </label>

                        <label className="owner-menu-field">
                            <span>Price</span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={itemForm.price}
                                onChange={(event) =>
                                    setItemForm((prev) => ({
                                        ...prev,
                                        price: event.target.value,
                                    }))
                                }
                                placeholder="4.50"
                            />
                        </label>
                    </div>

                    <label className="owner-menu-field">
                        <span>Description</span>
                        <textarea
                            value={itemForm.description}
                            onChange={(event) =>
                                setItemForm((prev) => ({
                                    ...prev,
                                    description: event.target.value,
                                }))
                            }
                            placeholder="Describe the dish"
                        />
                    </label>

                    <label className="owner-menu-field">
                        <span>Dietary info</span>
                        <input
                            type="text"
                            value={itemForm.dietaryInfo}
                            onChange={(event) =>
                                setItemForm((prev) => ({
                                    ...prev,
                                    dietaryInfo: event.target.value,
                                }))
                            }
                            placeholder="e.g. Vegetarian"
                        />
                    </label>

                    <div className="owner-menu-checks">
                        <label className="owner-menu-toggle">
                            <input
                                type="checkbox"
                                checked={itemForm.isAvailable}
                                onChange={(event) =>
                                    setItemForm((prev) => ({
                                        ...prev,
                                        isAvailable: event.target.checked,
                                    }))
                                }
                            />
                            <span>Visible to customers</span>
                        </label>
                    </div>

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
                            {saving ? "Saving..." : "Save item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}