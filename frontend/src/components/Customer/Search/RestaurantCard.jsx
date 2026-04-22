import React from "react";

function renderPriceGuide(restaurant) {
    const min = restaurant?.estimatedSpendMin;
    const max = restaurant?.estimatedSpendMax;

    if (min != null && max != null) {
        return `Est. £${min}–£${max} pp`;
    }

    return restaurant?.priceRange || null;
}

export default function RestaurantCard({
                                           restaurant,
                                           isSelected = false,
                                           onSelect,
                                           onViewMore,
                                           onBook,
                                           onToggleFavourite,
                                           compact = false,
                                       }) {
    const {
        name,
        location,
        cuisine,
        averageRating,
        nextSlot,
        accessibilityOptions = [],
        dietaryOptions = [],
        tags = [],
        isFavourite = false,
        imageUrl,
        imageAltText,
    } = restaurant;

    const badges = [...dietaryOptions, ...accessibilityOptions, ...tags].slice(0, 3);

    const numericRating =
        averageRating !== null && averageRating !== undefined && averageRating !== ""
            ? Number(averageRating)
            : 0;

    const fullStars = Math.round(numericRating);
    const totalStars = 5;
    const priceGuide = renderPriceGuide(restaurant);

    function handleKeyDown(e) {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect?.();
        }
    }

    return (
        <article
            role="button"
            tabIndex={0}
            className={`restaurant-card ${compact ? "compact" : ""} ${isSelected ? "is-selected" : ""}`}
            onClick={onSelect}
            onKeyDown={handleKeyDown}
        >
            <div className="restaurant-card-image">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={imageAltText || `${name || "Restaurant"} preview`}
                        className="restaurant-card-image__img"
                    />
                ) : (
                    <div className="restaurant-card-image__placeholder" />
                )}

                <button
                    type="button"
                    className={`restaurant-card-favourite ${isFavourite ? "is-active" : ""}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavourite?.();
                    }}
                    aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
                    title={isFavourite ? "Remove from favourites" : "Add to favourites"}
                >
                    {isFavourite ? "♥" : "♡"}
                </button>
            </div>

            <div className="restaurant-card-body">
                <div className="restaurant-card-top">
                    <div>
                        <h3>{name || "Restaurant"}</h3>
                        <p>
                            {location || "Location"}
                            {cuisine ? ` • ${cuisine}` : ""}
                        </p>
                    </div>

                    <div className="restaurant-card-rating">
                        <div className="stars">
                            {Array.from({ length: totalStars }).map((_, i) => (
                                <span key={i}>{i < fullStars ? "★" : "☆"}</span>
                            ))}
                        </div>
                        <span className="rating-number">{numericRating.toFixed(1)}</span>
                    </div>
                </div>

                {priceGuide ? (
                    <div className="restaurant-card-price">{priceGuide}</div>
                ) : null}

                {badges.length > 0 && (
                    <div className="restaurant-card-badges">
                        {badges.map((badge, index) => (
                            <span key={`${badge}-${index}`} className="restaurant-card-chip">
                                {badge}
                            </span>
                        ))}
                    </div>
                )}

                {nextSlot ? <div className="restaurant-card-slot">Next slot: {nextSlot}</div> : null}

                <div className="restaurant-card-actions">
                    <button
                        type="button"
                        className="restaurant-card-link"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewMore?.();
                        }}
                    >
                        View more
                    </button>

                    <button
                        type="button"
                        className="restaurant-card-link restaurant-card-link--primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            onBook?.();
                        }}
                    >
                        Book
                    </button>
                </div>
            </div>
        </article>
    );
}