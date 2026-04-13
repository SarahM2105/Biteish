import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileHeader({ restaurant }) {
    const navigate = useNavigate();

    return (
        <div className="profile-header">
            <div>
                <h1>{restaurant.name}</h1>
                <p>{restaurant.location}</p>
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