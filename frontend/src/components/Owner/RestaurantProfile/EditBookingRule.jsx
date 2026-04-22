import React from "react";

export default function BookingRulesSection({ bookingRule, onRuleChange }) {
    return (
        <div className="profile-card">
            <h3>Booking Rules</h3>

            <div className="profile-edit__grid">
                <label className="profile-edit__field">
                    <span>Days ahead</span>
                    <input
                        name="daysAhead"
                        type="number"
                        value={bookingRule.daysAhead}
                        onChange={onRuleChange}
                    />
                </label>

                <label className="profile-edit__field">
                    <span>Slot duration</span>
                    <input
                        name="slotMinutes"
                        type="number"
                        value={bookingRule.slotMinutes}
                        onChange={onRuleChange}
                    />
                </label>

                <label className="profile-edit__field">
                    <span>Cancellation cutoff</span>
                    <input
                        name="cancellationCutoffMinutes"
                        type="number"
                        value={bookingRule.cancellationCutoffMinutes}
                        onChange={onRuleChange}
                    />
                </label>
            </div>
        </div>
    );
}