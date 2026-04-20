import React from "react";
import BookingCard from "./BookingCard";

export default function BookingsCollapsibleSection({
                                                       title,
                                                       subtitle,
                                                       sectionClassName,
                                                       badgeClassName,
                                                       isOpen,
                                                       onToggle,
                                                       bookings,
                                                       emptyTitle,
                                                       emptyText,
                                                       canEdit,
                                                       canCancel,
                                                       canShowQr,
                                                       handleRequestChange,
                                                       handleShowQr,
                                                       handleCancel,
                                                   }) {
    return (
        <section className={`bookings-section ${sectionClassName}`}>
            <button
                type="button"
                className={`bookings-section__header ${isOpen ? "is-open" : ""}`}
                onClick={onToggle}
            >
                <div className="bookings-section__title-wrap">
                    <span className="bookings-section__title">{title}</span>
                    <span className="bookings-section__subtitle">{subtitle}</span>
                </div>

                <div className="bookings-section__header-right">
                    <span className={`bookings-section__badge ${badgeClassName}`}>
                        {bookings.length}
                    </span>
                    <span className="bookings-section__toggle">{isOpen ? "−" : "+"}</span>
                </div>
            </button>

            {isOpen &&
                (bookings.length ? (
                    <div className="bookings-grid">
                        {bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                b={booking}
                                canEdit={canEdit}
                                canCancel={canCancel}
                                canShowQr={canShowQr}
                                handleRequestChange={handleRequestChange}
                                handleShowQr={handleShowQr}
                                handleCancel={handleCancel}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bookings-empty-state bookings-empty-state--section">
                        <div className="bookings-empty-state__title">{emptyTitle}</div>
                        <div className="bookings-empty-state__text">{emptyText}</div>
                    </div>
                ))}
        </section>
    );
}