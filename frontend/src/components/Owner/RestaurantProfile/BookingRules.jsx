import React from "react";

export default function ProfileBookingRules({ rule }) {
    if (!rule) {
        return (
            <div className="profile-card">
                <h3>Booking Rules</h3>
                <p>No booking rules added yet.</p>
            </div>
        );
    }

    return (
        <div className="profile-card">
            <h3>Booking Rules</h3>

            <p>
                <strong>Days ahead:</strong> {rule.daysAhead ?? "N/A"}
            </p>

            <p>
                <strong>Slot duration:</strong> {rule.slotMinutes ?? "N/A"} mins
            </p>

            <p>
                <strong>Cancellation cutoff:</strong>{" "}
                {rule.cancellationCutoffMinutes ?? "N/A"} mins
            </p>
        </div>
    );
}