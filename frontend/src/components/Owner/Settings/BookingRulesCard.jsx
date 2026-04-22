import React from "react";

export default function BookingRulesCard({
                                             bookingRule,
                                             saving,
                                             onChange,
                                             onSave,
                                         }) {
    return (
        <section className="owner-settings-card owner-settings-card--wide">
            <div className="owner-settings-card__header">
                <div>
                    <p className="owner-settings-card__eyebrow">Booking rules</p>
                    <h2>Core booking settings</h2>
                    <p>
                        Control how long bookings last, how far ahead they can be
                        made, and how much gap you want between reservations.
                    </p>
                </div>
            </div>

            <div className="owner-settings-form-grid">
                <label className="owner-settings-field">
                    <span className="owner-settings-field__label">
                        Max party size
                    </span>
                    <span className="owner-settings-field__hint">
                        Largest group size accepted per booking.
                    </span>
                    <input
                        type="number"
                        name="maxPartySize"
                        value={bookingRule.maxPartySize}
                        onChange={onChange}
                        className="owner-settings-field__input"
                    />
                </label>

                <label className="owner-settings-field">
                    <span className="owner-settings-field__label">
                        Days ahead allowed
                    </span>
                    <span className="owner-settings-field__hint">
                        How many days in advance customers can book.
                    </span>
                    <input
                        type="number"
                        name="daysAhead"
                        value={bookingRule.daysAhead}
                        onChange={onChange}
                        className="owner-settings-field__input"
                    />
                </label>

                <label className="owner-settings-field">
                    <span className="owner-settings-field__label">
                        Slot duration
                    </span>
                    <span className="owner-settings-field__hint">
                        Maximum booking length in minutes.
                    </span>
                    <input
                        type="number"
                        name="slotMinutes"
                        value={bookingRule.slotMinutes}
                        onChange={onChange}
                        className="owner-settings-field__input"
                    />
                </label>

                <label className="owner-settings-field">
                    <span className="owner-settings-field__label">
                        Turnover gap
                    </span>
                    <span className="owner-settings-field__hint">
                        Gap between bookings for cleanup and reset time.
                    </span>
                    <input
                        type="number"
                        name="turnoverMinutes"
                        value={bookingRule.turnoverMinutes}
                        onChange={onChange}
                        className="owner-settings-field__input"
                    />
                </label>

                <label className="owner-settings-field">
                    <span className="owner-settings-field__label">
                        Cancellation cutoff
                    </span>
                    <span className="owner-settings-field__hint">
                        Last point a customer can cancel or change a booking.
                    </span>
                    <input
                        type="number"
                        name="cancellationCutoffMinutes"
                        value={bookingRule.cancellationCutoffMinutes}
                        onChange={onChange}
                        className="owner-settings-field__input"
                    />
                </label>

                <label className="owner-settings-field">
                    <span className="owner-settings-field__label">
                        Grace period
                    </span>
                    <span className="owner-settings-field__hint">
                        How long a customer can be late before being flagged.
                    </span>
                    <input
                        type="number"
                        name="graceMinutes"
                        value={bookingRule.graceMinutes}
                        onChange={onChange}
                        className="owner-settings-field__input"
                    />
                </label>
            </div>

            <div className="owner-settings-actions">
                <button
                    type="button"
                    className="owner-settings-button owner-settings-button--primary"
                    onClick={onSave}
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save booking rules"}
                </button>
            </div>
        </section>
    );
}