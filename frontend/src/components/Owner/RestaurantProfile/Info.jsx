import React from "react";

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
        </div>
    );
}