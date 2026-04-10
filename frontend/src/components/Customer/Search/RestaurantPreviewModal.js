import React from "react";

function formatDay(day) {
    if (!day) return "";
    return day.charAt(0) + day.slice(1).toLowerCase();
}

export default function RestaurantPreviewModal({restaurant,
                                                   onClose,
                                                   onViewMore,
                                                   onBook,}) {
    if (!restaurant) return null;
    const {
        name,
        location,
        cuisine,
        rating,
        reviewCount,
        verified,
        nextSlot,
        accessibilityOptions = [],
        dietaryOptions = [],
        tags = [],
        openingHours = [],
        bookingRule,
    } = restaurant;
    const displayTags = [...dietaryOptions, ...tags].slice(0, 6);
    const displayAccessibility = accessibilityOptions.slice(0, 6);
    return (
        <div className="restaurant-preview-overlay" onClick={onClose}>
            <div
                className="restaurant-preview-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="restaurant-preview-close"
                    onClick={onClose}
                    aria-label="Close preview"
                >
                    ×
                </button>

                <div className="restaurant-preview-hero">
                    <div className="restaurant-preview-hero__image">
                        <span className="restaurant-preview-hero__badge">Featured</span>
                    </div>

                    <div className="restaurant-preview-hero__content">
                        <div className="restaurant-preview-titleRow">
                            <h2>{name || "Restaurant"}</h2>
                            {verified ? (
                                <span className="restaurant-preview-verified">Verified</span>
                            ) : null}
                        </div>

                        <p className="restaurant-preview-location">
                            {location || "Location unavailable"}
                            {cuisine ? ` • ${cuisine}` : ""}
                        </p>
                        <div className="restaurant-preview-meta">
                            {rating ? (
                                <span className="restaurant-preview-rating">⭐ {rating}</span>
                            ) : null}
                            {reviewCount ? (
                                <span className="restaurant-preview-metaItem">
                                    {reviewCount} reviews
                                </span>
                            ) : null}
                            {nextSlot ? (
                                <span className="restaurant-preview-metaItem">
                                    Next slot: {nextSlot}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className="restaurant-preview-sections">
                    <div className="restaurant-preview-section">
                        <h3>Booking info</h3>
                        <div className="restaurant-preview-infoGrid">
                            <div className="restaurant-preview-infoCard">
                                <span className="restaurant-preview-infoLabel">Max party size</span>
                                <strong>
                                    {bookingRule?.maxPartySize ?? "Not set"}
                                </strong>
                            </div>
                            <div className="restaurant-preview-infoCard">
                                <span className="restaurant-preview-infoLabel">Booking Window</span>
                                <strong>
                                    {bookingRule?.daysAhead
                                        ? `${bookingRule.daysAhead} days ahead`
                                        : "Not set"}
                                </strong>
                            </div>
                            <div className="restaurant-preview-infoCard">
                                <span className="restaurant-preview-infoLabel">Slot length</span>
                                <strong>
                                    {bookingRule?.slotMinutes
                                        ? `${bookingRule.slotMinutes} mins`
                                        : "Not set"}
                                </strong>
                            </div>
                            <div className="restaurant-preview-infoCard">
                                <span className="restaurant-preview-infoLabel">Cancellation cutoff</span>
                                <strong>
                                    {bookingRule?.cancellationCutoffMinutes
                                        ? `${bookingRule.cancellationCutoffMinutes} mins`
                                        : "Not set"}
                                </strong>
                            </div>
                        </div>
                    </div>
                    {displayAccessibility.length > 0 && (
                        <div className="restaurant-preview-section">
                            <h3>Accessibility</h3>
                            <div className="restaurant-preview-chipWrap">
                                {displayAccessibility.map((item) => (
                                    <span key={item} className="restaurant-preview-chip">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {displayTags.length > 0 && (
                        <div className="restaurant-preview-section">
                            <h3>Highlights</h3>
                            <div className="restaurant-preview-chipWrap">
                                {displayTags.map((item) => (
                                    <span key={item} className="restaurant-preview-chip restaurant-preview-chip--soft">
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {openingHours.length > 0 && (
                        <div className="restaurant-preview-section">
                            <h3>Opening hours</h3>
                            <div className="restaurant-preview-hours">
                                {openingHours.map((slot) => (
                                    <div
                                        key={`${slot.day}-${slot.opensAt}-${slot.closesAt}`}
                                        className="restaurant-preview-hours__row"
                                    >
                                        <span>{formatDay(slot.day)}</span>
                                        <strong>
                                            {slot.opensAt} - {slot.closesAt}
                                        </strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="restaurant-preview-actions">
                    <button
                        type="button"
                        className="restaurant-preview-btn restaurant-preview-btn--ghost"
                        onClick={onViewMore}
                    >
                        View full page
                    </button>

                    <button
                        type="button"
                        className="restaurant-preview-btn restaurant-preview-btn--primary"
                        onClick={onBook}
                    >
                        Book now
                    </button>
                </div>
            </div>
        </div>
    );
}