import React from "react";

function renderEstimatedSpend(restaurant) {
    const min = restaurant?.estimatedSpendMin;
    const max = restaurant?.estimatedSpendMax;

    if (min == null || max == null) {
        return "Not added yet";
    }

    return `£${min}–£${max} per person`;
}

export default function ProfileInfo({ restaurant }) {
    return (
        <div className="profile-card">
            <h3>Restaurant Info</h3>

            <p>
                <strong>Description:</strong>{" "}
                {restaurant.description?.trim()
                    ? restaurant.description
                    : "No description added yet"}
            </p>

            <p>
                <strong>Estimated spend:</strong>{" "}
                {renderEstimatedSpend(restaurant)}
            </p>
        </div>
    );
}