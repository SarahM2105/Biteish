import React from "react";

function renderEstimatedSpend(restaurant) {
    const min = restaurant?.estimatedSpendMin;
    const max = restaurant?.estimatedSpendMax;

    if (min == null || max == null) {
        return "Not available";
    }

    return `£${min}–£${max} per person`;
}

export default function About({ restaurant }) {
    return (
        <section className="restaurant-details-card">
            <h2>About</h2>

            <div className="restaurant-details-stack">
                <div>
                    <h3>Description</h3>
                    <p>
                        {restaurant?.description?.trim()
                            ? restaurant.description
                            : "No description added yet."}
                    </p>
                </div>

                <div>
                    <h3>Location</h3>
                    <p>{restaurant?.location || "Location not available."}</p>
                </div>

                <div>
                    <h3>Estimated spend</h3>
                    <p>{renderEstimatedSpend(restaurant)}</p>
                </div>

                <div>
                    <h3>Accessibility</h3>
                    <p>
                        {restaurant?.accessibilityOptions?.length
                            ? restaurant.accessibilityOptions.map((item) => item.name).join(", ")
                            : "No accessibility information yet."}
                    </p>
                </div>
            </div>
        </section>
    );
}