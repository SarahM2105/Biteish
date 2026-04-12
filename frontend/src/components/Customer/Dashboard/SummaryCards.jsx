import React from 'react';

export default function CustomerSummaryCards({ summary, loading }) {
    const cards = [
        {
            id: "upcoming-bookings",
            icon: "📌",
            value: loading ? "..." : summary?.upcomingBookings ?? 0,
            label: "Upcoming Bookings",
            modifier: "orange",
        },
        {
            id: "saved-restaurants",
            icon: "💖",
            value: loading ? "..." : summary?.savedRestaurants ?? 0,
            label: "Saved Restaurants",
            modifier: "pink",
        },
        {
            id: "total-visits",
            icon: "📈",
            value: loading ? "..." : summary?.totalVisits ?? 0,
            label: "Total Visits",
            modifier: "green",
        },
        {
            id: "most-booked-cuisine",
            icon: "🍽️",
            value: loading ? "..." : summary?.mostBookedCuisine || "N/A",
            label: "Most Booked Cuisine",
            modifier: "purple",
        },
    ];

    return (
        <section className="dashboard-summary">
            {cards.map((card) => (
                <article
                    key={card.id}
                    className={`summary-card summary-card--${card.modifier}`}
                >
                    <div className="summary-card__icon">{card.icon}</div>
                    <div className="summary-card__content">
                        <h3 className="summary-card__value">{card.value}</h3>
                        <p className="summary-card__label">{card.label}</p>
                    </div>
                </article>
            ))}
        </section>
    );
}