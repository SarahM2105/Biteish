import React from "react";
function formatDay(day) {
    if (!day) return "";
    return day.charAt(0) + day.slice(1).toLowerCase();
}

export default function OpeningHours({ openingHours = [] }) {
    return (
        <section className="restaurant-details-card">
            <h2>Opening hours</h2>
            {openingHours.length === 0 ? (
                <p>No opening hours available.</p>
            ) : (
                <div className="restaurant-hours">
                    {openingHours.map((item) => (
                        <div
                            key={`${item.day}-${item.opensAt}-${item.closesAt}`}
                            className="restaurant-hours__row"
                        >
                            <span>{formatDay(item.day)}</span>
                            <strong>{item.opensAt} - {item.closesAt}</strong>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}