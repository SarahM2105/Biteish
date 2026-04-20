import React from "react";
import { formatDateTime } from "./dateHelpers";
import { formatNotes, formatTableLabel } from "./bookingHelpers";

function CompareRow({ label, currentValue, proposedValue }) {
    const changed = currentValue !== proposedValue;
    return (
        <div className={`edit-booking-current__item ${changed ? "is-changed" : ""}`}>
            <span className="edit-booking-current__label">{label}</span>
            <span className="edit-booking-current__value">
                <strong>Current:</strong> {currentValue}
                <br />
                <strong>Proposed:</strong> {proposedValue}
            </span>
        </div>
    );
}

export default function IncomingChangeRequestModal({
                                                       request,
                                                       isOpen,
                                                       onClose,
                                                       onApprove,
                                                       onDecline,
                                                       actingApprove,
                                                       actingDecline,
                                                   }) {
    if (!isOpen || !request) return null;

    const currentTime = formatDateTime(request.reservation?.startsAt);
    const proposedTime = formatDateTime(
        request.newStartsAt || request.reservation?.startsAt
    );

    const currentTable = formatTableLabel(request.reservation?.table);
    const proposedTable = request.newTable
        ? formatTableLabel(request.newTable)
        : currentTable;

    const currentPartySize = String(request.reservation?.partySize ?? "No change");
    const proposedPartySize = String(
        request.newPartySize ?? request.reservation?.partySize ?? "No change"
    );

    const currentNotes = formatNotes(request.reservation?.notes);
    const proposedNotes = formatNotes(
        request.newNotes !== null && request.newNotes !== undefined
            ? request.newNotes
            : request.reservation?.notes
    );

    return (
        <div className="owner-request-modal-backdrop" onClick={onClose}>
            <div
                className="owner-request-modal"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="owner-request-modal__header">
                    <div>
                        <p className="owner-requests-section__eyebrow">Review booking update</p>
                        <h3>{request.reservation?.restaurant?.name || "Restaurant"}</h3>
                    </div>

                    <button
                        type="button"
                        className="owner-request-modal__close"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="edit-booking-current__grid">
                    <CompareRow
                        label="Date and time"
                        currentValue={currentTime}
                        proposedValue={proposedTime}
                    />

                    <CompareRow
                        label="Table"
                        currentValue={currentTable}
                        proposedValue={proposedTable}
                    />

                    <CompareRow
                        label="Party size"
                        currentValue={currentPartySize}
                        proposedValue={proposedPartySize}
                    />

                    <CompareRow
                        label="Notes"
                        currentValue={currentNotes}
                        proposedValue={proposedNotes}
                    />
                </div>

                <div className="edit-booking-notice">
                    Your original booking stays unchanged unless you approve this update.
                </div>

                <div className="owner-request-actions">
                    <button
                        type="button"
                        className="booking-card__button booking-card__button--ghost"
                        onClick={onDecline}
                        disabled={actingApprove || actingDecline}
                    >
                        {actingDecline ? "Working..." : "Decline change"}
                    </button>

                    <button
                        type="button"
                        className="booking-card__button booking-card__button--primary"
                        onClick={onApprove}
                        disabled={actingApprove || actingDecline}
                    >
                        {actingApprove ? "Working..." : "Approve change"}
                    </button>
                </div>
            </div>
        </div>
    );
}