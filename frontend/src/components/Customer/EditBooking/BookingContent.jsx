import React from "react";
import CurrentBookingPanel from "./CurrentBookingPanel";
import PendingChangeRequestPanel from "./PendingChangeRequestPanel";
import EditBookingFormCard from "./EditBookingFormCard";
import useCustomerEditBookingPage from "../../../hooks/useCustomerEditBookingPage";

export default function BookingContent() {
    const {
        booking,
        loading,
        status,
        submitting,
        date,
        setDate,
        time,
        setTime,
        durationMins,
        setDurationMins,
        partySize,
        setPartySize,
        notes,
        setNotes,
        activePendingRequest,
        isOwnPendingRequest,
        handleSubmit,
        handleCancelCurrentRequest,
        handleBackToBookings,
        formatDateTime,
    } = useCustomerEditBookingPage();

    return (
        <div className="edit-booking-page">
            <section className="edit-booking-header">
                <div className="edit-booking-header__content">
                    <p className="edit-booking-header__eyebrow">Booking updates</p>
                    <h1 className="edit-booking-header__title">Request Booking Change</h1>
                    <p className="edit-booking-header__text">
                        Submit a change request for the restaurant to review. Your current
                        booking stays the same until the request is approved.
                    </p>
                </div>
            </section>

            {loading ? (
                <div className="edit-booking-feedback">Loading...</div>
            ) : (
                <>
                    <CurrentBookingPanel booking={booking} />

                    <PendingChangeRequestPanel
                        activePendingRequest={activePendingRequest}
                        isOwnPendingRequest={isOwnPendingRequest}
                        formatDateTime={formatDateTime}
                    />

                    <EditBookingFormCard
                        activePendingRequest={activePendingRequest}
                        isOwnPendingRequest={isOwnPendingRequest}
                        status={status}
                        submitting={submitting}
                        date={date}
                        setDate={setDate}
                        time={time}
                        setTime={setTime}
                        durationMins={durationMins}
                        setDurationMins={setDurationMins}
                        partySize={partySize}
                        setPartySize={setPartySize}
                        notes={notes}
                        setNotes={setNotes}
                        onSubmit={handleSubmit}
                        onCancelCurrentRequest={handleCancelCurrentRequest}
                        onBackToBookings={handleBackToBookings}
                    />
                </>
            )}
        </div>
    );
}