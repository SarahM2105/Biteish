import React from "react";

export default function BookingStep1Details({ form, updateForm }) {
    return (
        <section className="booking-step-card">
            <div className="booking-step-card__header">
                <p className="booking-step-card__eyebrow">Step 1</p>
                <h2>Booking details</h2>
                <p>
                    Choose when you want to visit, how many guests are coming,
                    and any extra notes for the restaurant.
                </p>
            </div>

            <div className="booking-step-card__grid">
                <label className="booking-step-field">
                    <span>Date</span>
                    <input
                        type="date"
                        value={form.date}
                        onChange={(e) => updateForm("date", e.target.value)}
                    />
                </label>

                <label className="booking-step-field">
                    <span>Time</span>
                    <input
                        type="time"
                        value={form.time}
                        onChange={(e) => updateForm("time", e.target.value)}
                    />
                </label>

                <label className="booking-step-field booking-step-field--small">
                    <span>Party size</span>
                    <input
                        type="number"
                        min="1"
                        value={form.partySize}
                        onChange={(e) => updateForm("partySize", e.target.value)}
                        placeholder="2"
                    />
                </label>

                <label className="booking-step-field booking-step-field--full">
                    <span>Notes</span>
                    <textarea
                        value={form.notes}
                        onChange={(e) => updateForm("notes", e.target.value)}
                        placeholder="Allergies, accessibility needs, birthday plans, or anything the restaurant should know"
                    />
                    <small>Optional</small>
                </label>
            </div>
        </section>
    );
}