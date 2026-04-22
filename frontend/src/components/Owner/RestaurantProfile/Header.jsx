import React from "react";
import { useNavigate } from "react-router-dom";

function renderEstimatedSpend(restaurant) {
    const min = restaurant?.estimatedSpendMin;
    const max = restaurant?.estimatedSpendMax;

    if (min == null || max == null) {
        return "Estimated spend not added yet";
    }

    return `Estimated spend: £${min}–£${max} per person`;
}

export default function ProfileHeader({ restaurant }) {
    const navigate = useNavigate();

    return (
        <div className="profile-header">
            <div>
                <h1>{restaurant.name}</h1>
                <p>{restaurant.location}</p>
                <p>{renderEstimatedSpend(restaurant)}</p>
            </div>

            <button
                className="profile-header__edit"
                onClick={() => navigate("/owner/restaurant/edit")}
            >
                Edit Profile
            </button>
        </div>
    );
}