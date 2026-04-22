import React, { useMemo, useState } from "react";

function formatPrice(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "£0.00";
    return `£${numeric.toFixed(2)}`;
}

export default function Menu({ menuSections = [] }) {
    const [isOpen, setIsOpen] = useState(false);

    const visibleSections = useMemo(() => {
        return menuSections
            .filter((section) => section?.isActive !== false)
            .map((section) => ({
                ...section,
                items: (section.items || []).filter(
                    (item) => item?.isAvailable !== false
                ),
            }))
            .filter((section) => section.items.length > 0);
    }, [menuSections]);

    const previewItems = useMemo(() => {
        return visibleSections
            .flatMap((section) =>
                section.items.map((item) => ({
                    ...item,
                    sectionName: section.name,
                }))
            )
            .slice(0, 4);
    }, [visibleSections]);

    const totalItems = useMemo(() => {
        return visibleSections.reduce(
            (count, section) => count + (section.items?.length || 0),
            0
        );
    }, [visibleSections]);

    return (
        <>
            <section className="restaurant-details-card">
                <div className="restaurant-details-card__header restaurant-details-menu-preview__header">
                    <div>
                        <h2>Menu</h2>
                        <p>Browse dishes currently available for this restaurant.</p>
                    </div>

                    {visibleSections.length > 0 && (
                        <button
                            type="button"
                            className="restaurant-details-menu-preview__button"
                            onClick={() => setIsOpen(true)}
                        >
                            View full menu
                        </button>
                    )}
                </div>

                {!visibleSections.length ? (
                    <p className="restaurant-details-empty">
                        No menu items available right now.
                    </p>
                ) : (
                    <div className="restaurant-details-menu-preview">
                        <div className="restaurant-details-menu-preview__stats">
                            <div className="restaurant-details-menu-preview__stat">
                                <span>Sections</span>
                                <strong>{visibleSections.length}</strong>
                            </div>
                            <div className="restaurant-details-menu-preview__stat">
                                <span>Items</span>
                                <strong>{totalItems}</strong>
                            </div>
                        </div>

                        <div className="restaurant-details-menu-preview__grid">
                            {previewItems.map((item) => (
                                <article
                                    key={item.id}
                                    className="restaurant-details-menu-preview__item"
                                >
                                    <div className="restaurant-details-menu-preview__item-top">
                                        <div>
                                            <p className="restaurant-details-menu-preview__section-name">
                                                {item.sectionName}
                                            </p>
                                            <h4>{item.name}</h4>
                                        </div>
                                        <strong>{formatPrice(item.price)}</strong>
                                    </div>

                                    {item.description ? (
                                        <p className="restaurant-details-menu-preview__description">
                                            {item.description}
                                        </p>
                                    ) : null}

                                    {item.dietaryInfo ? (
                                        <span className="restaurant-details-menu__tag">
                                            {item.dietaryInfo}
                                        </span>
                                    ) : null}
                                </article>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {isOpen && (
                <div
                    className="restaurant-details-menu-modal__backdrop"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="restaurant-details-menu-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="restaurant-details-menu-modal__header">
                            <div>
                                <h2>Full menu</h2>
                                <p>Explore all currently available dishes.</p>
                            </div>

                            <button
                                type="button"
                                className="restaurant-details-menu-modal__close"
                                onClick={() => setIsOpen(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="restaurant-details-menu">
                            {visibleSections.map((section) => (
                                <div
                                    key={section.id}
                                    className="restaurant-details-menu__section"
                                >
                                    <div className="restaurant-details-menu__section-header">
                                        <h3>{section.name}</h3>
                                        {section.description ? <p>{section.description}</p> : null}
                                    </div>

                                    <div className="restaurant-details-menu__items">
                                        {section.items.map((item) => (
                                            <article
                                                key={item.id}
                                                className="restaurant-details-menu__item"
                                            >
                                                <div className="restaurant-details-menu__item-top">
                                                    <div className="restaurant-details-menu__item-copy">
                                                        <h4>{item.name}</h4>
                                                        {item.description ? (
                                                            <p>{item.description}</p>
                                                        ) : null}
                                                    </div>
                                                    <strong>{formatPrice(item.price)}</strong>
                                                </div>

                                                {item.dietaryInfo ? (
                                                    <div className="restaurant-details-menu__meta">
                                                        <span className="restaurant-details-menu__tag">
                                                            {item.dietaryInfo}
                                                        </span>
                                                    </div>
                                                ) : null}
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}