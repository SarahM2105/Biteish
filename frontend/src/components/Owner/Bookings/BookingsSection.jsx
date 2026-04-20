import React from "react";
import BookingCard from "./BookingCard";
import EmptyState from "./EmptyState";

export default function BookingsSection({
                                            title,
                                            subtitle,
                                            count,
                                            bookings,
                                            onOpen,
                                        }) {
    return (
        <section className="owner-bookings-section">
            <div className="owner-bookings-section__header">
                <div>
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>
                <span className="owner-bookings-section__count">{count}</span>
            </div>

            {!bookings.length ? (
                <EmptyState
                    title={`No ${title.toLowerCase()} right now.`}
                    text="Bookings will appear here when they match this section."
                />
            ) : (
                <div className="owner-bookings-grid">
                    {bookings.map((booking) => (
                        <BookingCard
                            key={booking.id}
                            booking={booking}
                            onOpen={onOpen}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}