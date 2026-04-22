import React from "react";

function renderStars(rating = 0) {
    const rounded = Math.round(Number(rating) || 0);
    const totalStars = 5;

    return Array.from({ length: totalStars }).map((_, index) => (
        <span key={index} className="review-star">
            {index < rounded ? "★" : "☆"}
        </span>
    ));
}

export default function Reviews({ reviews = [], averageRating = 0, reviewCount = 0 }) {
    const ratingCounts = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
    };

    reviews.forEach((review) => {
        const value = Number(review.rating);
        if (ratingCounts[value] !== undefined) {
            ratingCounts[value] += 1;
        }
    });

    const verifiedCount = reviews.filter((review) => review.verifiedVisit).length;

    return (
        <section className="restaurant-details-card">
            <div className="restaurant-section-header">
                <div>
                    <h2>Reviews</h2>
                    <p>{reviewCount} review{reviewCount === 1 ? "" : "s"}</p>
                </div>

                {reviewCount > 0 ? (
                    <div className="reviews-header-rating">
                        <span className="reviews-header-rating__stars">
                            {renderStars(averageRating)}
                        </span>
                        <span className="reviews-header-rating__number">
                            {Number(averageRating).toFixed(1)}
                        </span>
                        <span className="reviews-header-rating__count">
                            ({reviewCount})
                        </span>
                    </div>
                ) : null}
            </div>

            {reviewCount > 0 && (
                <div className="review-stats">
                    <div className="review-stats__summary">
                        <div className="review-stats__headline">
                            <span className="review-stats__stars">
                                {renderStars(averageRating)}
                            </span>
                            <span className="review-stats__score">
                                {Number(averageRating).toFixed(1)}
                            </span>
                            <span className="review-stats__score-label">out of 5</span>
                        </div>

                        <p className="review-stats__subtext">
                            {reviewCount} review{reviewCount === 1 ? "" : "s"} • {verifiedCount} verified diner review{verifiedCount === 1 ? "" : "s"}
                        </p>
                    </div>

                    <div className="review-stats__breakdown">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = ratingCounts[star];
                            const widthPercent = reviewCount > 0 ? (count / reviewCount) * 100 : 0;

                            return (
                                <div key={star} className="review-stats__row">
                                    <span className="review-stats__label">{star}★</span>
                                    <div className="review-stats__bar">
                                        <div
                                            className="review-stats__bar-fill"
                                            style={{ width: `${widthPercent}%` }}
                                        />
                                    </div>
                                    <span className="review-stats__count">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {reviews.length === 0 ? (
                <p>No reviews yet.</p>
            ) : (
                <div className="restaurant-reviews">
                    {reviews.map((review) => (
                        <article key={review.id} className="restaurant-review-card">
                            <div className="restaurant-review-card__top">
                                <strong>{review.userName}</strong>

                                <div className="restaurant-review-card__rating">
                                    <span className="restaurant-review-card__stars">
                                        {renderStars(review.rating)}
                                    </span>
                                    <span className="restaurant-review-card__rating-number">
                                        {Number(review.rating).toFixed(1)}
                                    </span>
                                </div>
                            </div>

                            <p>
                                {review.verifiedVisit ? "Verified diner" : "Customer review"}
                            </p>

                            <p>{review.comment || "No written comment."}</p>

                            {review.images?.length > 0 && (
                                <div className="restaurant-review-images">
                                    {review.images.map((image) => (
                                        <img
                                            key={image.id}
                                            src={image.imageUrl}
                                            alt="Review"
                                            className="restaurant-review-image"
                                        />
                                    ))}
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}