import React from "react";
import { Link } from "react-router-dom";

export default function BookingStep4Confirmation({ restaurant, submitResult }) {
    return (
        <div>
            <h2>Step 4: Confirmation</h2>

            <p>Your booking request has been submitted.</p>
            <p><strong>Restaurant:</strong> {restaurant?.name}</p>

            {submitResult?.status && (
                <p><strong>Status:</strong> {submitResult.status}</p>
            )}

            <p>The restaurant owner may need to approve your booking.</p>

            <div>
                <Link to="/customer/myBookings">Go to my bookings</Link>
            </div>
        </div>
    );
}