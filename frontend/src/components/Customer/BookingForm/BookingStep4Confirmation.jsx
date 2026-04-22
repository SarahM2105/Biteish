import React from "react";
import { Link } from "react-router-dom";

function formatStatus(status) {
    if (!status) return "Pending";

    return String(status)
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

export default function BookingStep4Confirmation({ restaurant, submitResult }) {
    return (
        <section className="booking-step-card booking-step-card--confirmation">
            <div className="booking-confirmation">
                <div className="booking-confirmation__icon">✓</div>

                <div className="booking-confirmation__header">
                    <p className="booking-step-card__eyebrow">Step 4</p>
                    <h2>Booking request submitted</h2>
                    <p>
                        Your request has been sent successfully. The restaurant may
                        need to review and approve it before it is fully confirmed.
                    </p>
                </div>

                <div className="booking-confirmation__summary">
                    <div className="booking-confirmation__card">
                        <span>Restaurant</span>
                        <strong>{restaurant?.name || "Restaurant unavailable"}</strong>
                    </div>

                    <div className="booking-confirmation__card">
                        <span>Status</span>
                        <strong>{formatStatus(submitResult?.status)}</strong>
                    </div>
                </div>

                <div className="booking-confirmation__notice">
                    <p>
                        You can track this booking from your bookings page and check
                        for any updates from the restaurant owner.
                    </p>
                </div>

                <div className="booking-confirmation__actions">
                    <Link
                        to="/customer/myBookings"
                        className="booking-confirmation__button booking-confirmation__button--primary"
                    >
                        Go to my bookings
                    </Link>
                </div>
            </div>
        </section>
    );
}