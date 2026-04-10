import React from "react";

export default function About({ restaurant }) {
    return (
        <section className="restaurant-details-card">
            <h2>About</h2>

            <div className="restaurant-about-grid">
                <div>
                    <h3>Location</h3>
                    <p>{restaurant.location || "Not provided"}</p>
                </div>

                <div>
                    <h3>Accessibility</h3>
                    {restaurant.accessibilityOptions?.length > 0 ? (
                        <div className="restaurant-chip-wrap">
                            {restaurant.accessibilityOptions.map((item) => (
                                <span key={item.id} className="restaurant-chip restaurant-chip--soft">
                                    {item.name}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p>No accessibility information yet.</p>
                    )}
                </div>
            </div>
        </section>
    );
}