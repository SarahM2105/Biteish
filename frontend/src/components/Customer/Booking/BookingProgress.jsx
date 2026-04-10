import React from "react";

export default function BookingProgress({ step }) {
    return (
        <div>
            <p><strong>Step {step} of 4</strong></p>
            <ol>
                <li>{step === 1 ? "Current: " : ""}Booking details</li>
                <li>{step === 2 ? "Current: " : ""}Choose table</li>
                <li>{step === 3 ? "Current: " : ""}Review</li>
                <li>{step === 4 ? "Current: " : ""}Confirmation</li>
            </ol>
        </div>
    );
}