import React from "react";

function formatPrice(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "£0.00";
    return `£${numeric.toFixed(2)}`;
}

export default function MenuContent({
                                        restaurantName,
                                        summary,
                                        status,
                                        loading,
                                        sections,
                                        saving,
                                        onOpenAddSection,
                                        onOpenEditSection,
                                        onDeleteSection,
                                        onOpenAddItem,
                                        onOpenEditItem,
                                        onDeleteItem,
                                        onToggleAvailability,
                                    }) {
    return (
        <>
            <section className="owner-menu-header">
                <div className="owner-menu-header__content">
                    <p className="owner-menu-header__eyebrow">{restaurantName}</p>
                    <h1 className="owner-menu-header__title">Menu management</h1>
                    <p className="owner-menu-header__text">
                        Organise your sections, keep dishes up to date, and control
                        what customers can currently see.
                    </p>
                </div>

                <div className="owner-menu-header__actions">
                    <button
                        type="button"
                        className="owner-menu-btn owner-menu-btn--secondary"
                        onClick={onOpenAddSection}
                        disabled={saving}
                    >
                        Add section
                    </button>
                    <button
                        type="button"
                        className="owner-menu-btn owner-menu-btn--primary"
                        onClick={() => onOpenAddItem()}
                        disabled={saving || !sections.length}
                    >
                        Add item
                    </button>
                </div>

                <div className="owner-menu-summary">
                    <article className="owner-menu-summary-card">
                        <span>Sections</span>
                        <strong>{summary.sections}</strong>
                    </article>
                    <article className="owner-menu-summary-card">
                        <span>Items</span>
                        <strong>{summary.items}</strong>
                    </article>
                    <article className="owner-menu-summary-card">
                        <span>Available</span>
                        <strong>{summary.available}</strong>
                    </article>
                </div>
            </section>

            {status.message && (
                <section
                    className={`owner-menu-alert owner-menu-alert--${status.type || "neutral"}`}
                >
                    {status.message}
                </section>
            )}

            {loading ? (
                <section className="owner-menu-card">
                    <div className="owner-menu-card__header">
                        <div>
                            <p className="owner-menu-card__eyebrow">Loading</p>
                            <h2>Fetching your menu...</h2>
                        </div>
                    </div>
                </section>
            ) : !sections.length ? (
                <section className="owner-menu-card owner-menu-card--empty">
                    <div className="owner-menu-card__header">
                        <div>
                            <p className="owner-menu-card__eyebrow">No sections yet</p>
                            <h2>Start building your menu</h2>
                            <p>
                                Create your first section, then add dishes under it.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="owner-menu-btn owner-menu-btn--primary"
                            onClick={onOpenAddSection}
                            disabled={saving}
                        >
                            Create first section
                        </button>
                    </div>
                </section>
            ) : (
                <div className="owner-menu-grid">
                    {sections.map((section) => (
                        <section key={section.id} className="owner-menu-card">
                            <div className="owner-menu-card__header">
                                <div>
                                    <p className="owner-menu-card__eyebrow">
                                        {section.items?.length || 0} item
                                        {(section.items?.length || 0) === 1 ? "" : "s"}
                                    </p>
                                    <h2>{section.name}</h2>
                                    <p>
                                        {section.description || "No section description yet."}
                                    </p>
                                </div>

                                <div className="owner-menu-card__actions">
                                    <button
                                        type="button"
                                        className="owner-menu-chip-btn"
                                        onClick={() => onOpenAddItem(section.id)}
                                        disabled={saving}
                                    >
                                        Add item
                                    </button>
                                    <button
                                        type="button"
                                        className="owner-menu-chip-btn"
                                        onClick={() => onOpenEditSection(section)}
                                        disabled={saving}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className="owner-menu-chip-btn owner-menu-chip-btn--danger"
                                        onClick={() => onDeleteSection(section.id)}
                                        disabled={saving}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {section.items?.length ? (
                                <div className="owner-menu-items">
                                    {section.items.map((item) => (
                                        <article key={item.id} className="owner-menu-item">
                                            <div className="owner-menu-item__top">
                                                <div>
                                                    <h3>{item.name}</h3>
                                                    <p>
                                                        {item.description || "No description yet."}
                                                    </p>
                                                </div>
                                                <strong>{formatPrice(item.price)}</strong>
                                            </div>

                                            <div className="owner-menu-item__meta">
                                                {item.dietaryInfo && (
                                                    <span className="owner-menu-badge owner-menu-badge--tag">
                                                        {item.dietaryInfo}
                                                    </span>
                                                )}

                                                <span
                                                    className={`owner-menu-badge ${
                                                        item.isAvailable
                                                            ? "owner-menu-badge--live"
                                                            : "owner-menu-badge--muted"
                                                    }`}
                                                >
                                                    {item.isAvailable ? "Visible" : "Hidden"}
                                                </span>
                                            </div>

                                            <div className="owner-menu-item__actions">
                                                <button
                                                    type="button"
                                                    className="owner-menu-chip-btn"
                                                    onClick={() => onToggleAvailability(item)}
                                                    disabled={saving}
                                                >
                                                    {item.isAvailable ? "Hide" : "Show"}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="owner-menu-chip-btn"
                                                    onClick={() => onOpenEditItem(item)}
                                                    disabled={saving}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="owner-menu-chip-btn owner-menu-chip-btn--danger"
                                                    onClick={() => onDeleteItem(item.id)}
                                                    disabled={saving}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="owner-menu-empty">
                                    No items in this section yet.
                                </div>
                            )}
                        </section>
                    ))}
                </div>
            )}
        </>
    );
}