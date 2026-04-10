import React from "react";

export default function BookingStep3Review({ restaurant, form, selectedZone, selectedTable }) {
    return (
        <div>
            <h2>Step 3: Review booking</h2>

            <p><strong>Restaurant:</strong> {restaurant?.name}</p>
            <p><strong>Date:</strong> {form.date}</p>
            <p><strong>Time:</strong> {form.time}</p>
            <p><strong>Party size:</strong> {form.partySize}</p>
            <p><strong>Zone:</strong> {selectedZone?.name || "Not selected"}</p>
            <p><strong>Table:</strong> {selectedTable?.name || "Not selected"}</p>
            <p><strong>Notes:</strong> {form.notes || "None"}</p>
        </div>
    );
}