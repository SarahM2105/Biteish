import React from "react";

function formatDay(day) {
    if (!day) return "";
    return day.charAt(0) + day.slice(1).toLowerCase();
}

function renderEstimatedSpend(restaurant) {
    const min = restaurant?.estimatedSpendMin;
    const max = restaurant?.estimatedSpendMax;

    if (min == null || max == null) {
        return "Not set";
    }

    return `£${min}–£${max} per person`;
}

function getPreviewImage(restaurant) {
    if (restaurant?.imageUrl) return restaurant.imageUrl;
    if (restaurant?.primaryImageUrl) return restaurant.primaryImageUrl;

    if (Array.isArray(restaurant?.images) && restaurant.images.length > 0) {
        const primary =
            restaurant.images.find((image) => image?.isPrimary) ||
            restaurant.images[0];

        return primary?.imageUrl || null;
    }

    return null;
}

export default function RestaurantPreviewModal({
                                                   restaurant,
                                                   onClose,
                                                   onViewMore,
                                                   onBook,
                                               }) {
    if (!restaurant) return null;

    const {
        name,
        location,
        cuisine,
        rating,
        averageRating,
        reviewCount,
        verified,
        nextSlot,
        accessibilityOptions = [],
        dietaryOptions = [],
        tags = [],
        openingHours = [],
        bookingRule,
        maxPartySize,
        description,
    } = restaurant;

    const previewImage = getPreviewImage(restaurant);
    const displayTags = [...dietaryOptions, ...tags].slice(0, 6);
    const displayAccessibility = accessibilityOptions.slice(0, 6);

    const numericRating =
        averageRating !== null && averageRating !== undefined && averageRating !== ""
            ? Number(averageRating)
            : rating !== null && rating !== undefined && rating !== ""
                ? Number(rating)
                : 0;

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

                <div className="restaurant-preview-header">
                    <div className="restaurant-preview-header__image">
                        {previewImage ? (
                            <img
                                src={previewImage}
                                alt={`${name || "Restaurant"} preview`}
                                className="restaurant-preview-header__image-media"
                            />
                        ) : (
                            <div className="restaurant-preview-header__image-placeholder" />
                        )}
                    </div>

                    <div className="restaurant-preview-header__content">
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
                            <span className="restaurant-preview-rating">
                                ⭐ {numericRating.toFixed(1)}
                            </span>

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

                        {description?.trim() ? (
                            <p className="restaurant-preview-description">
                                {description}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="restaurant-preview-sections">
                    <div className="restaurant-preview-section">
                        <h3>Booking info</h3>
                        <div className="restaurant-preview-infoGrid">
                            <div className="restaurant-preview-infoCard">
                                <span className="restaurant-preview-infoLabel">
                                    Max party size
                                </span>
                                <strong>{maxPartySize ?? "Not set"}</strong>
                            </div>

                            <div className="restaurant-preview-infoCard">
                                <span className="restaurant-preview-infoLabel">
                                    Booking window
                                </span>
                                <strong>
                                    {bookingRule?.daysAhead
                                        ? `${bookingRule.daysAhead} days ahead`
                                        : "Not set"}
                                </strong>
                            </div>

                            <div className="restaurant-preview-infoCard">
                                <span className="restaurant-preview-infoLabel">
                                    Slot length
                                </span>
                                <strong>
                                    {bookingRule?.slotMinutes
                                        ? `${bookingRule.slotMinutes} mins`
                                        : "Not set"}
                                </strong>
                            </div>

                            <div className="restaurant-preview-infoCard">
                                <span className="restaurant-preview-infoLabel">
                                    Cancellation cutoff
                                </span>
                                <strong>
                                    {bookingRule?.cancellationCutoffMinutes
                                        ? `${bookingRule.cancellationCutoffMinutes} mins`
                                        : "Not set"}
                                </strong>
                            </div>

                            <div className="restaurant-preview-infoCard">
                                <span className="restaurant-preview-infoLabel">
                                    Estimated spend
                                </span>
                                <strong>{renderEstimatedSpend(restaurant)}</strong>
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
                                    <span
                                        key={item}
                                        className="restaurant-preview-chip restaurant-preview-chip--soft"
                                    >
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