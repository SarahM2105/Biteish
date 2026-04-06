import React from "react";
import {formatDate, formatTime} from "../../utils/BookingFormatters"
export default function CustomerNextBooking({ booking, upcomingBookings = [], loading }) {
    const extraBookings = upcomingBookings
        .filter((item) => item.id !== booking?.id)
        .slice(0, 2);

    const remainingCount = Math.max(
        upcomingBookings.length - 1 - extraBookings.length,
        0
    );

    return (
        <section className="dashboard-section">
            <div className="dashboard-section__heading">
                <h2>Upcoming Reservation</h2>
            </div>

            <article className="next-booking-card">
                {loading ? (
                    <div className="next-booking-card__content">
                        <p className="next-booking-card__eyebrow">Next Booking</p>
                        <h3 className="next-booking-card__title">Loading...</h3>
                    </div>
                ) : booking ? (
                    <>
                        <div className="next-booking-card__content">
                            <p className="next-booking-card__eyebrow">Next Booking</p>

                            <h3 className="next-booking-card__title">
                                {booking.restaurant?.name || "Restaurant"}
                            </h3>

                            <div className="next-booking-card__meta">
                                <span>📅 {formatDate(booking.startsAt)}</span>
                                <span>🕢 {formatTime(booking.startsAt)}</span>
                                <span>👥 Table for {booking.partySize}</span>
                                <span>📍 {booking.restaurant?.location || "Location unavailable"}</span>
                            </div>
                        </div>

                        <button className="next-booking-card__button">
                            View Details
                        </button>
                    </>
                ) : (
                    <div className="next-booking-card__content">
                        <p className="next-booking-card__eyebrow">Next Booking</p>
                        <h3 className="next-booking-card__title">No upcoming bookings</h3>
                        <div className="next-booking-card__meta">
                            <span>Book a table to see your next reservation here.</span>
                        </div>
                    </div>
                )}
            </article>
        </section>
    );
}