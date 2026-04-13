import React from "react";

export default function ProfileOpeningHours({ hours = [] }) {
    if (!hours.length) {
        return (
            <div className="profile-card">
                <h3>Opening Hours</h3>
                <p>No opening hours added yet.</p>
            </div>
        );
    }

    return (
        <div className="profile-card">
            <h3>Opening Hours</h3>

            {hours.map((h) => (
                <p key={h.id || h.day}>
                    {h.day}: {h.opensAt} - {h.closesAt}
                </p>
            ))}
        </div>
    );
}