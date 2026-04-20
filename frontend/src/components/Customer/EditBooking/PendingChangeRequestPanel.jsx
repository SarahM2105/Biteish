import React from "react";

export default function PendingChangeRequestPanel({
                                                      activePendingRequest,
                                                      isOwnPendingRequest,
                                                      formatDateTime,
                                                  }) {
    if (!activePendingRequest) return null;

    return (
        <section className="edit-booking-current">
            <div className="edit-booking-current__top">
                <div>
                    <p className="edit-booking-current__eyebrow">
                        {isOwnPendingRequest
                            ? "Your pending request"
                            : "Restaurant pending request"}
                    </p>
                    <h2 className="edit-booking-current__title">
                        {isOwnPendingRequest
                            ? "You already have a change request in review"
                            : "The restaurant already has a change request in review"}
                    </h2>
                </div>

                <div className="edit-booking-current__status">
                    {activePendingRequest.status}
                </div>
            </div>

            <div className="edit-booking-current__grid">
                <div className="edit-booking-current__item">
                    <span className="edit-booking-current__label">Requested start</span>
                    <span className="edit-booking-current__value">
                        {formatDateTime(activePendingRequest.newStartsAt)}
                    </span>
                </div>

                <div className="edit-booking-current__item">
                    <span className="edit-booking-current__label">Requested end</span>
                    <span className="edit-booking-current__value">
                        {formatDateTime(activePendingRequest.newEndsAt)}
                    </span>
                </div>

                <div className="edit-booking-current__item">
                    <span className="edit-booking-current__label">Requested party size</span>
                    <span className="edit-booking-current__value">
                        {activePendingRequest.newPartySize ?? "No change"}
                    </span>
                </div>

                <div className="edit-booking-current__item">
                    <span className="edit-booking-current__label">Requested notes</span>
                    <span className="edit-booking-current__value">
                        {activePendingRequest.newNotes || "No change"}
                    </span>
                </div>
            </div>
        </section>
    );
}