import React from "react";

export default function OpeningHoursSection({ openingHours, onHourChange }) {
    return (
        <div className="profile-card">
            <h3>Opening Hours</h3>

            <div className="profile-hours">
                {openingHours.map((hour, index) => (
                    <div className="profile-hours__row" key={hour.day}>
                        <span className="profile-hours__day">
                            {hour.day}
                        </span>

                        <input
                            type="time"
                            value={hour.opensAt}
                            onChange={(e) =>
                                onHourChange(index, "opensAt", e.target.value)
                            }
                        />

                        <input
                            type="time"
                            value={hour.closesAt}
                            onChange={(e) =>
                                onHourChange(index, "closesAt", e.target.value)
                            }
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}