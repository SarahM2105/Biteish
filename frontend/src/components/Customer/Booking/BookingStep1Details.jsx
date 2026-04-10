import React from "react";

export default function BookingStep1Details({ form, updateForm }) {
    return (
        <div>
            <h2>Step 1: Booking details</h2>

            <div>
                <label>Date</label>
                <br />
                <input
                    type="date"
                    value={form.date}
                    onChange={(e) => updateForm("date", e.target.value)}
                />
            </div>

            <div>
                <label>Time</label>
                <br />
                <input
                    type="time"
                    value={form.time}
                    onChange={(e) => updateForm("time", e.target.value)}
                />
            </div>

            <div>
                <label>Party size</label>
                <br />
                <input
                    type="number"
                    min="1"
                    value={form.partySize}
                    onChange={(e) => updateForm("partySize", e.target.value)}
                />
            </div>

            <div>
                <label>Notes</label>
                <br />
                <textarea
                    value={form.notes}
                    onChange={(e) => updateForm("notes", e.target.value)}
                    placeholder="Optional notes"
                />
            </div>
        </div>
    );
}