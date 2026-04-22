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
    const images = Array.isArray(restaurant?.images) ? restaurant.images : [];
    const primaryImage =
        images.find((image) => image.isPrimary) ||
        (restaurant?.primaryImageUrl
            ? {
                id: "primary-image",
                imageUrl: restaurant.primaryImageUrl,
                altText: `${restaurant.name} cover image`,
            }
            : null) ||
        images[0] ||
        null;

    const galleryPreview = images.filter((image) => image.id !== primaryImage?.id).slice(0, 4);

    return (
        <section className="restaurant-header">
            {primaryImage ? (
                <div className="restaurant-header__media">
                    <img
                        src={primaryImage.imageUrl}
                        alt={primaryImage.altText || `${restaurant.name} cover`}
                        className="restaurant-header__image"
                    />
                </div>
            ) : null}

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

                {galleryPreview.length > 0 && (
                    <div className="restaurant-header__gallery">
                        {galleryPreview.map((image) => (
                            <div key={image.id} className="restaurant-header__gallery-item">
                                <img
                                    src={image.imageUrl}
                                    alt={image.altText || `${restaurant.name} gallery`}
                                    className="restaurant-header__gallery-image"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}