import React from "react";

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
        priceRange,
        nextSlot,
        accessibilityOptions = [],
        dietaryOptions = [],
        tags = [],
        isFavourite = false,
    } = restaurant;

    const badges = [...dietaryOptions, ...accessibilityOptions, ...tags].slice(0, 3);

    const numericRating =
        averageRating !== null && averageRating !== undefined && averageRating !== ""
            ? Number(averageRating)
            : 0;

    const fullStars = Math.round(numericRating);
    const totalStars = 5;

    return (
        <button
            type="button"
            className={`restaurant-card ${compact ? "compact" : ""} ${isSelected ? "is-selected" : ""}`}
            onClick={onSelect}
        >
            <div className="restaurant-card-image">
                <span className="restaurant-card-badge">Featured</span>

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

                {priceRange ? <div className="restaurant-card-price">{priceRange}</div> : null}

                {badges.length > 0 && (
                    <div className="restaurant-card-badges">
                        {badges.map((badge) => (
                            <span key={badge} className="restaurant-card-chip">
                                {badge}
                            </span>
                        ))}
                    </div>
                )}

                {nextSlot ? <div className="restaurant-card-slot">Next slot: {nextSlot}</div> : null}

                <div className="restaurant-card-actions">
                    <span
                        className="restaurant-card-link"
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewMore?.();
                        }}
                    >
                        View more
                    </span>

                    <span
                        className="restaurant-card-link restaurant-card-link--primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            onBook?.();
                        }}
                    >
                        Book
                    </span>
                </div>
            </div>
        </button>
    );
}