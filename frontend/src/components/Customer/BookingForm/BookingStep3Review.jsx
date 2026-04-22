import React from "react";

function formatLabelValue(value, fallback = "Not provided") {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }

    return value;
}

export default function BookingStep3Review({ restaurant, form, selectedZone, selectedTable }) {
    return (
        <section className="booking-step-card booking-step-card--review">
            <div className="booking-step-card__header">
                <p className="booking-step-card__eyebrow">Step 3</p>
                <h2>Review booking</h2>
                <p>
                    Check everything looks right before you confirm your reservation.
                </p>
            </div>

            <div className="booking-review">
                <div className="booking-review__header">
                    <span className="booking-review__header-label">Restaurant</span>
                    <h3>{restaurant?.name || "Restaurant not found"}</h3>
                    <p>
                        {restaurant?.location || "Location unavailable"}
                    </p>
                </div>

                <div className="booking-review__grid">
                    <div className="booking-review__card">
                        <span>Date</span>
                        <strong>{formatLabelValue(form.date, "Not selected")}</strong>
                    </div>

                    <div className="booking-review__card">
                        <span>Time</span>
                        <strong>{formatLabelValue(form.time, "Not selected")}</strong>
                    </div>

                    <div className="booking-review__card">
                        <span>Party size</span>
                        <strong>{formatLabelValue(form.partySize, "Not selected")}</strong>
                    </div>

                    <div className="booking-review__card">
                        <span>Zone</span>
                        <strong>{formatLabelValue(selectedZone?.name, "Not selected")}</strong>
                    </div>

                    <div className="booking-review__card">
                        <span>Table</span>
                        <strong>{formatLabelValue(selectedTable?.name, "Not selected")}</strong>
                    </div>

                    <div className="booking-review__card">
                        <span>Table capacity</span>
                        <strong>
                            {selectedTable?.capacity
                                ? `${selectedTable.capacity} seats`
                                : "Not selected"}
                        </strong>
                    </div>
                </div>

                <div className="booking-review__notes">
                    <span>Notes</span>
                    <p>{formatLabelValue(form.notes, "No notes added")}</p>
                </div>
            </div>
        </section>
    );
}