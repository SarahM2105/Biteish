import React from "react";
import { formatDateTime } from "./dateHelpers";

export default function IncomingChangeRequestsSection({
                                                          incomingRequests,
                                                          loadingIncomingRequests,
                                                          actingIncomingKey,
                                                          onViewRequest,
                                                          onApproveRequest,
                                                          onDeclineRequest,
                                                      }) {
    if (!incomingRequests.length) return null;

    return (
        <section className="bookings-section bookings-section--pending">
            <div className="bookings-section__header is-open">
                <div className="bookings-section__title-wrap">
                    <span className="bookings-section__title">Restaurant update requests</span>
                    <span className="bookings-section__subtitle">
                        Review booking changes proposed by restaurants
                    </span>
                </div>

                <div className="bookings-section__header-right">
                    <span className="bookings-section__badge bookings-section__badge--pending">
                        {incomingRequests.length}
                    </span>
                </div>
            </div>

            {loadingIncomingRequests ? (
                <div className="bookings-empty-state bookings-empty-state--section">
                    <div className="bookings-empty-state__text">Loading booking updates...</div>
                </div>
            ) : (
                <div className="bookings-grid">
                    {incomingRequests.map((request) => (
                        <article key={request.id} className="booking-card">
                            <div className="booking-card__top">
                                <div className="booking-card__identity">
                                    <div className="booking-card__avatar">
                                        {(request.reservation?.restaurant?.name || "R")
                                            .slice(0, 1)
                                            .toUpperCase()}
                                    </div>

                                    <div className="booking-card__content">
                                        <h3 className="booking-card__title">
                                            {request.reservation?.restaurant?.name || "Restaurant"}
                                        </h3>

                                        <p className="booking-card__subtitle">
                                            Booking change proposed by the restaurant
                                        </p>

                                        <p className="booking-card__summary">
                                            Proposed:{" "}
                                            {formatDateTime(
                                                request.newStartsAt || request.reservation?.startsAt
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="booking-card__status-wrap">
                                    <div className="booking-card__status status-pending">
                                        PENDING
                                    </div>
                                </div>
                            </div>

                            <div className="booking-card__actions">
                                <button
                                    type="button"
                                    className="booking-card__button booking-card__button--secondary"
                                    onClick={() => onViewRequest(request)}
                                >
                                    View changes
                                </button>

                                <button
                                    type="button"
                                    className="booking-card__button booking-card__button--primary"
                                    onClick={() => onApproveRequest(request.id)}
                                    disabled={actingIncomingKey === `approve:${request.id}`}
                                >
                                    {actingIncomingKey === `approve:${request.id}`
                                        ? "Working..."
                                        : "Approve"}
                                </button>

                                <button
                                    type="button"
                                    className="booking-card__button booking-card__button--ghost"
                                    onClick={() => onDeclineRequest(request.id)}
                                    disabled={actingIncomingKey === `decline:${request.id}`}
                                >
                                    {actingIncomingKey === `decline:${request.id}`
                                        ? "Working..."
                                        : "Decline"}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}