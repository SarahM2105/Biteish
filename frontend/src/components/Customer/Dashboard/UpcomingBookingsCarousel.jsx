import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { formatShortDate, formatTime } from "../../utils/BookingFormatters";

export default function UpcomingBookingsCarousel({ bookings = [], loading }) {
    const extraBookings = useMemo(() => {
        return bookings.slice(1);
    }, [bookings]);

    const [startIndex, setStartIndex] = React.useState(0);
    const visibleCount = 3;

    const visibleBookings = extraBookings.slice(startIndex, startIndex + visibleCount);
    const canGoLeft = startIndex > 0;
    const canGoRight = startIndex + visibleCount < extraBookings.length;

    function handlePrev() {
        if (!canGoLeft) return;
        setStartIndex((prev) => Math.max(prev - 1, 0));
    }

    function handleNext() {
        if (!canGoRight) return;
        setStartIndex((prev) => prev + 1);
    }

    return (
        <section className="dashboard-section">
            <div className="dashboard-section__topRow">
                <div className="dashboard-section__heading">
                    <h2>More Upcoming Bookings</h2>
                </div>

                <div className="upcoming-carousel__topActions">
                    <Link to="/customer/myBookings" className="dashboard-section__link">
                        View all bookings
                    </Link>

                    <button
                        type="button"
                        className="upcoming-carousel__arrow"
                        onClick={handlePrev}
                        disabled={!canGoLeft}
                        aria-label="Previous Bookings"
                    >
                        ◀
                    </button>

                    <button
                        type="button"
                        className="upcoming-carousel__arrow"
                        onClick={handleNext}
                        disabled={!canGoRight}
                        aria-label="Next Bookings"
                    >
                        ▶
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="upcoming-carousel upcoming-carousel--message">
                    <p>Loading upcoming bookings...</p>
                </div>
            ) : extraBookings.length === 0 ? (
                <div className="upcoming-carousel upcoming-carousel--message">
                    <p>No more upcoming bookings yet.</p>
                    <Link to="/customer/myBookings" className="dashboard-section__link">
                        Go to My Bookings
                    </Link>
                </div>
            ) : (
                <div className="upcoming-carousel">
                    {visibleBookings.map((booking) => (
                        <article key={booking.id} className="upcoming-booking-card">
                            <p className="upcoming-booking-card__date">
                                {formatShortDate(booking.startsAt)}
                            </p>

                            <h3 className="upcoming-booking-card__title">
                                {booking.restaurant?.name || "Restaurant"}
                            </h3>

                            <div className="upcoming-booking-card__meta">
                                <span>🕒 {formatTime(booking.startsAt)}</span>
                                <span>👥 {booking.partySize} guests</span>
                                <span>📍 {booking.restaurant?.location || "Location unavailable"}</span>
                            </div>

                            <div className="upcoming-booking-card__footer">
                                <span className="upcoming-booking-card__status">
                                    {booking.status}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}