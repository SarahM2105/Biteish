import React from "react";

function renderStars(rating = 0) {
    const rounded = Math.round(Number(rating) || 0);
    const totalStars = 5;

    return Array.from({ length: totalStars }).map((_, index) => (
        <span key={index} className="restaurant-star">
            {index < rounded ? "★" : "☆"}
        </span>
    ));
}

export default function Header({ restaurant }) {
    return (
        <section className="restaurant-header">
            <div className="restaurant-header__content">
                <span className="restaurant-header__badge">
                    {restaurant.verified ? "Verified restaurant" : "Restaurant"}
                </span>
                <h1>{restaurant.name}</h1>
                <p className="restaurant-header__location">{restaurant.location}</p>
                <div className="restaurant-header__meta">
                    <div className="restaurant-header__rating">
                        <span className="restaurant-header__stars">
                            {renderStars(restaurant.averageRating)}
                        </span>
                        <span className="restaurant-header__rating-number">
                            {restaurant.averageRating?.toFixed
                                ? restaurant.averageRating.toFixed(1)
                                : Number(restaurant.averageRating || 0).toFixed(1)}
                        </span>
                        <span className="restaurant-header__review-count">
                            ({restaurant.reviewCount} review{restaurant.reviewCount === 1 ? "" : "s"})
                        </span>
                    </div>
                </div>
                {restaurant.tags?.length > 0 && (
                    <div className="restaurant-chip-wrap">
                        {restaurant.tags.map((tag) => (
                            <span key={tag.id} className="restaurant-chip">
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}