import React from "react";
import BookingsHeader from "./Header";
import BookingsSummaryCards from "./SummaryCards";
import BookingQrModal from "./QRModal";
import BookingDateStrip from "./BookingDateStrip";
import IncomingChangeRequestModal from "./IncomingChangeRequestModal";
import IncomingChangeRequestsSection from "./IncomingChangeRequestsSection";
import BookingsCollapsibleSection from "./BookingsCollapsibleSection";
import { formatSelectedDate } from "./dateHelpers";
import useCustomerBookingsPage from "../../../hooks/useCustomerBookingsPage";

export default function CustomerBookingsContent() {
    const {
        status,
        loading,
        selectedDate,
        setSelectedDate,
        confirmedOpen,
        setConfirmedOpen,
        pendingOpen,
        setPendingOpen,
        qrImage,
        qrExpiresAt,
        showQrModal,
        qrToken,
        incomingRequests,
        loadingIncomingRequests,
        incomingStatus,
        actingIncomingKey,
        selectedIncomingRequest,
        setSelectedIncomingRequest,
        upcomingConfirmed,
        pendingBookings,
        completedCount,
        pastCount,
        confirmedShown,
        pendingShown,
        bookingDateSummary,
        noResultsForDate,
        canEdit,
        canCancel,
        canShowQr,
        handleRequestChange,
        handleShowQr,
        handleCancel,
        handleCloseQrModal,
        handleApproveIncomingRequest,
        handleDeclineIncomingRequest,
    } = useCustomerBookingsPage();

    return (
        <>
            <div className="customer-bookings-page">
                <BookingsHeader />

                <BookingsSummaryCards
                    upcomingCount={upcomingConfirmed.length}
                    pendingCount={pendingBookings.length}
                    completedCount={completedCount}
                    pastCount={pastCount}
                />

                <BookingDateStrip
                    summary={bookingDateSummary}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    onClearDate={() => setSelectedDate("")}
                />

                {selectedDate && !loading && !status && (
                    <div className="bookings-feedback">
                        Showing bookings for {formatSelectedDate(selectedDate)}
                    </div>
                )}

                {loading && <div className="bookings-feedback">Loading...</div>}

                {status && (
                    <div className="bookings-feedback bookings-feedback--status">
                        {status}
                    </div>
                )}

                {incomingStatus && (
                    <div className="bookings-feedback bookings-feedback--status">
                        {incomingStatus}
                    </div>
                )}

                {!loading && !status && (
                    <IncomingChangeRequestsSection
                        incomingRequests={incomingRequests}
                        loadingIncomingRequests={loadingIncomingRequests}
                        actingIncomingKey={actingIncomingKey}
                        onViewRequest={setSelectedIncomingRequest}
                        onApproveRequest={handleApproveIncomingRequest}
                        onDeclineRequest={handleDeclineIncomingRequest}
                    />
                )}

                {!loading && !status && noResultsForDate && (
                    <div className="bookings-empty-state">
                        <div className="bookings-empty-state__title">No bookings on this date.</div>
                        <div className="bookings-empty-state__text">
                            Try another day or clear the date filter to see more reservations.
                        </div>
                    </div>
                )}

                {!loading && !status && !noResultsForDate && (
                    <div className="bookings-sections">
                        <BookingsCollapsibleSection
                            title="Confirmed Bookings"
                            subtitle="Upcoming confirmed reservations"
                            sectionClassName="bookings-section--confirmed"
                            badgeClassName="bookings-section__badge--confirmed"
                            isOpen={confirmedOpen}
                            onToggle={() => setConfirmedOpen((prev) => !prev)}
                            bookings={confirmedShown}
                            emptyTitle="No confirmed bookings to show."
                            emptyText="Confirmed upcoming reservations will appear here."
                            canEdit={canEdit}
                            canCancel={canCancel}
                            canShowQr={canShowQr}
                            handleRequestChange={handleRequestChange}
                            handleShowQr={handleShowQr}
                            handleCancel={handleCancel}
                        />

                        <BookingsCollapsibleSection
                            title="Pending Requests"
                            subtitle="Waiting for approval or review"
                            sectionClassName="bookings-section--pending"
                            badgeClassName="bookings-section__badge--pending"
                            isOpen={pendingOpen}
                            onToggle={() => setPendingOpen((prev) => !prev)}
                            bookings={pendingShown}
                            emptyTitle="No pending requests to show."
                            emptyText="Pending bookings and your outgoing change requests will appear here."
                            canEdit={canEdit}
                            canCancel={canCancel}
                            canShowQr={canShowQr}
                            handleRequestChange={handleRequestChange}
                            handleShowQr={handleShowQr}
                            handleCancel={handleCancel}
                        />
                    </div>
                )}
            </div>

            <BookingQrModal
                showQrModal={showQrModal}
                qrImage={qrImage}
                qrToken={qrToken}
                qrExpiresAt={qrExpiresAt}
                handleCloseQrModal={handleCloseQrModal}
            />

            <IncomingChangeRequestModal
                request={selectedIncomingRequest}
                isOpen={Boolean(selectedIncomingRequest)}
                onClose={() => setSelectedIncomingRequest(null)}
                onApprove={() =>
                    selectedIncomingRequest &&
                    handleApproveIncomingRequest(selectedIncomingRequest.id)
                }
                onDecline={() =>
                    selectedIncomingRequest &&
                    handleDeclineIncomingRequest(selectedIncomingRequest.id)
                }
                actingApprove={
                    selectedIncomingRequest
                        ? actingIncomingKey === `approve:${selectedIncomingRequest.id}`
                        : false
                }
                actingDecline={
                    selectedIncomingRequest
                        ? actingIncomingKey === `decline:${selectedIncomingRequest.id}`
                        : false
                }
            />
        </>
    );
}