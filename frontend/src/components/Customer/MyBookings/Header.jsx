import React from "react";

export default function Header() {
    return (
        <section className="bookings-header">
            <div className="bookings-header__content">
                <h1 className="bookings-header__title">My Bookings</h1>
                <p className="bookings-header__text">
                    Keep track of your upcoming reservations, revisit past bookings, and access
                    your QR check-in details in one place.
                </p>
            </div>
        </section>
    );
}