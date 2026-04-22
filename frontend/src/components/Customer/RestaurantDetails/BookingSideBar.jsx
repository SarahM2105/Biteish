import React from "react";
import { useNavigate } from "react-router-dom";

export default function BookingSideBar({ restaurant }) {
    const navigate = useNavigate();

    function handleBookNow() {
        navigate(`/customer/restaurants/${restaurant.id}/book`);
    }

    return (
        <aside className="restaurant-booking-card">
            <h2>Ready to book?</h2>
            <p>
                Choose a date and time from the search page, then continue with your booking.
            </p>

            <div className="restaurant-booking-card__rules">
                <div>
                    <span>Max party size</span>
                    <strong>{restaurant.bookingRule?.maxPartySize ?? "Not set"}</strong>
                </div>
                <div>
                    <span>Book ahead</span>
                    <strong>
                        {restaurant.bookingRule?.daysAhead
                            ? `${restaurant.bookingRule.daysAhead} days`
                            : "Not set"}
                    </strong>
                </div>
                <div>
                    <span>Slot length</span>
                    <strong>
                        {restaurant.bookingRule?.slotMinutes
                            ? `${restaurant.bookingRule.slotMinutes} mins`
                            : "Not set"}
                    </strong>
                </div>
            </div>

            <button
                type="button"
                className="restaurant-booking-card__button"
                onClick={handleBookNow}
            >
                Book this restaurant
            </button>
        </aside>
    );
}