import React from "react";
import EmptyState from "./EmptyState";
import BookingCard from "./BookingCard";
import {
    BROWSER_STATUS_FILTERS,
    FUTURE_DISABLED_STATUS_FILTERS,
    formatDateLabel,
    formatDayLabel,
    toDateKey,
} from "./BookingHelpers";

export default function HistoryBrowserSection({
                                                  bookings,
                                                  browserBookings,
                                                  browserDates,
                                                  selectedBrowserDate,
                                                  setSelectedBrowserDate,
                                                  browserStatusFilter,
                                                  setBrowserStatusFilter,
                                                  browserTimeFilter,
                                                  setBrowserTimeFilter,
                                                  selectedBrowserIsFuture,
                                                  selectedBrowserLabel,
                                                  goBrowserBackward,
                                                  goBrowserForward,
                                                  handleJumpToDate,
                                                  clearBrowserFilters,
                                                  onOpen,
                                              }) {
    return (
        <section className="owner-bookings-section">
            <div className="owner-bookings-section__header">
                <div>
                    <h2>History & date browser</h2>
                    <p>
                        Browse past service days, walk-ins, and older activity, or jump to a future date when needed.
                    </p>
                </div>
                <span className="owner-bookings-section__count">
                    {browserBookings.length}
                </span>
            </div>

            <div className="owner-bookings-browser__toolbar">
                <div className="owner-bookings-date-strip owner-bookings-date-strip--history">
                    <button
                        type="button"
                        className="owner-bookings-date-strip__nav"
                        onClick={goBrowserBackward}
                    >
                        ←
                    </button>

                    <div className="owner-bookings-date-strip__dates">
                        {browserDates.map((date) => {
                            const dateKey = toDateKey(date);
                            const count = bookings.filter(
                                (booking) => toDateKey(booking.startsAt) === dateKey
                            ).length;

                            return (
                                <button
                                    key={dateKey}
                                    type="button"
                                    className={`owner-bookings-date-card ${
                                        selectedBrowserDate === dateKey ? "is-active" : ""
                                    }`}
                                    onClick={() => setSelectedBrowserDate(dateKey)}
                                >
                                    <span className="owner-bookings-date-card__day">
                                        {formatDayLabel(date)}
                                    </span>
                                    <span className="owner-bookings-date-card__date">
                                        {formatDateLabel(date)}
                                    </span>
                                    <span className="owner-bookings-date-card__count">
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="button"
                        className="owner-bookings-date-strip__nav"
                        onClick={goBrowserForward}
                    >
                        →
                    </button>
                </div>

                <div className="owner-bookings-browser__controls">
                    <label className="owner-bookings-browser__jump">
                        <span>Jump to date</span>
                        <input
                            type="date"
                            value={selectedBrowserDate}
                            onChange={(event) => handleJumpToDate(event.target.value)}
                        />
                    </label>

                    <label className="owner-bookings-browser__time">
                        <span>Specific time</span>
                        <input
                            type="time"
                            value={browserTimeFilter}
                            onChange={(event) => setBrowserTimeFilter(event.target.value)}
                        />
                    </label>

                    <button
                        type="button"
                        className="owner-bookings-browser__clear"
                        onClick={clearBrowserFilters}
                    >
                        Clear filters
                    </button>
                </div>

                <div className="owner-bookings-browser__filters">
                    {BROWSER_STATUS_FILTERS.map((filter) => {
                        const disabled =
                            selectedBrowserIsFuture &&
                            FUTURE_DISABLED_STATUS_FILTERS.includes(filter.value);

                        return (
                            <button
                                key={filter.value}
                                type="button"
                                className={`owner-bookings-filter-chip ${
                                    browserStatusFilter === filter.value ? "is-active" : ""
                                } ${disabled ? "is-disabled" : ""}`}
                                disabled={disabled}
                                onClick={() => setBrowserStatusFilter(filter.value)}
                            >
                                {filter.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {!browserBookings.length ? (
                <EmptyState
                    title={`No bookings for ${selectedBrowserLabel}.`}
                    text="Try picking a date, changing the status, or clearing the filters."
                />
            ) : (
                <>
                    <div className="owner-bookings-history-label">
                        {selectedBrowserLabel}
                    </div>

                    <div className="owner-bookings-grid">
                        {browserBookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onOpen={onOpen}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}