import React from "react";
import BookingsSection from "./BookingsSection";
import HistoryBrowserSection from "./HistorySection";
import BookingDetailsModal from "./BookingDetailsModal";
import useOwnerBookingsPage from "../../../hooks/useOwnerBookingsPage";

export default function OwnerBookingsContent() {
    const {
        loading,
        status,
        bookings,
        selectedBooking,
        setSelectedBooking,
        todayBookings,
        upcomingBookings,
        historyTotalCount,
        browserDates,
        selectedBrowserDate,
        setSelectedBrowserDate,
        browserStatusFilter,
        setBrowserStatusFilter,
        browserTimeFilter,
        setBrowserTimeFilter,
        selectedBrowserIsFuture,
        browserBookings,
        selectedBrowserLabel,
        goBrowserBackward,
        goBrowserForward,
        handleJumpToDate,
        clearBrowserFilters,
    } = useOwnerBookingsPage();

    return (
        <>
            <div className="owner-bookings-page">
                <section className="owner-bookings-header">
                    <div className="owner-bookings-header__content">
                        <p className="owner-bookings-header__eyebrow">Bookings</p>
                        <h1>Manage your restaurant bookings</h1>
                        <p>
                            Keep today and upcoming bookings separate, then browse older or future service days with filters.
                        </p>
                    </div>

                    <div className="owner-bookings-header__stats">
                        <div className="owner-bookings-stat">
                            <span>Today</span>
                            <strong>{todayBookings.length}</strong>
                        </div>
                        <div className="owner-bookings-stat">
                            <span>Upcoming</span>
                            <strong>{upcomingBookings.length}</strong>
                        </div>
                        <div className="owner-bookings-stat">
                            <span>History</span>
                            <strong>{historyTotalCount}</strong>
                        </div>
                    </div>
                </section>

                {loading && <div className="owner-bookings-feedback">Loading bookings...</div>}
                {status && (
                    <div className="owner-bookings-feedback owner-bookings-feedback--status">
                        {status}
                    </div>
                )}

                {!loading && !status && (
                    <div className="owner-bookings-layout">
                        <BookingsSection
                            title="Today"
                            subtitle="Bookings happening today, including checked-in guests."
                            count={todayBookings.length}
                            bookings={todayBookings}
                            onOpen={setSelectedBooking}
                        />

                        <BookingsSection
                            title="Upcoming confirmed"
                            subtitle="Future confirmed reservations ready for service."
                            count={upcomingBookings.length}
                            bookings={upcomingBookings}
                            onOpen={setSelectedBooking}
                        />

                        <HistoryBrowserSection
                            bookings={bookings}
                            browserBookings={browserBookings}
                            browserDates={browserDates}
                            selectedBrowserDate={selectedBrowserDate}
                            setSelectedBrowserDate={setSelectedBrowserDate}
                            browserStatusFilter={browserStatusFilter}
                            setBrowserStatusFilter={setBrowserStatusFilter}
                            browserTimeFilter={browserTimeFilter}
                            setBrowserTimeFilter={setBrowserTimeFilter}
                            selectedBrowserIsFuture={selectedBrowserIsFuture}
                            selectedBrowserLabel={selectedBrowserLabel}
                            goBrowserBackward={goBrowserBackward}
                            goBrowserForward={goBrowserForward}
                            handleJumpToDate={handleJumpToDate}
                            clearBrowserFilters={clearBrowserFilters}
                            onOpen={setSelectedBooking}
                        />
                    </div>
                )}
            </div>

            <BookingDetailsModal
                booking={selectedBooking}
                isOpen={Boolean(selectedBooking)}
                onClose={() => setSelectedBooking(null)}
            />
        </>
    );
}