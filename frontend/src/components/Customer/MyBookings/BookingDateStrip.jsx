import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    buildCalendarDays,
    formatMonthLabel,
    fromDateKey,
    getDateLabel,
    getDayLabel,
    isSameMonth,
    toDateKey,
} from "./dateHelpers";
import { getMarkers } from "./bookingHelpers";

export default function BookingDateStrip({
                                             summary,
                                             selectedDate,
                                             onSelectDate,
                                             onClearDate,
                                         }) {
    const [rangeStart, setRangeStart] = useState(() => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    });

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const [calendarMonth, setCalendarMonth] = useState(() => {
        if (selectedDate) {
            const selected = fromDateKey(selectedDate);
            return new Date(selected.getFullYear(), selected.getMonth(), 1);
        }

        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    });

    const wrapperRef = useRef(null);

    const days = useMemo(() => {
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(rangeStart);
            date.setDate(rangeStart.getDate() + index);
            return date;
        });
    }, [rangeStart]);

    const calendarDays = useMemo(
        () => buildCalendarDays(calendarMonth),
        [calendarMonth]
    );

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!selectedDate) return;

        const selected = fromDateKey(selectedDate);
        const aligned = new Date(
            selected.getFullYear(),
            selected.getMonth(),
            selected.getDate()
        );

        setCalendarMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));

        const end = new Date(rangeStart);
        end.setDate(rangeStart.getDate() + 6);

        if (selected < rangeStart || selected > end) {
            setRangeStart(aligned);
        }
    }, [selectedDate, rangeStart]);

    function shiftRange(daysToMove) {
        setRangeStart((prev) => {
            const next = new Date(prev);
            next.setDate(prev.getDate() + daysToMove);
            return next;
        });
    }

    function handleSelectFromPopup(date) {
        onSelectDate(toDateKey(date));
        setRangeStart(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
        setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
        setIsCalendarOpen(false);
    }

    function handlePreviousMonth() {
        setCalendarMonth(
            new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
        );
    }

    function handleNextMonth() {
        setCalendarMonth(
            new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
        );
    }

    return (
        <section className="booking-date-strip" ref={wrapperRef}>
            <div className="booking-date-strip__header">
                <div>
                    <p className="booking-date-strip__eyebrow">Find bookings by date</p>
                    <h3 className="booking-date-strip__title">Quick dates</h3>
                </div>

                <div className="booking-date-strip__actions">
                    {selectedDate && (
                        <button
                            type="button"
                            className="booking-date-strip__clear"
                            onClick={onClearDate}
                        >
                            Clear date
                        </button>
                    )}

                    <button
                        type="button"
                        className="booking-date-strip__picker-button"
                        onClick={() => setIsCalendarOpen((prev) => !prev)}
                    >
                        Pick date
                    </button>
                </div>
            </div>

            <div className="booking-date-strip__toolbar">
                <button
                    type="button"
                    className="booking-date-strip__nav-button"
                    onClick={() => shiftRange(-7)}
                    aria-label="Show previous dates"
                >
                    ←
                </button>

                <div className="booking-date-strip__scroller">
                    {days.map((date, index) => {
                        const dateKey = toDateKey(date);
                        const daySummary = summary[dateKey];
                        const total = daySummary?.total || 0;
                        const markers = getMarkers(daySummary);
                        const isSelected = selectedDate === dateKey;

                        return (
                            <button
                                key={dateKey}
                                type="button"
                                className={[
                                    "booking-date-strip__chip",
                                    isSelected ? "booking-date-strip__chip--selected" : "",
                                    total > 0 ? "booking-date-strip__chip--active" : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                onClick={() => onSelectDate(dateKey)}
                            >
                                <span className="booking-date-strip__chip-top">
                                    <span className="booking-date-strip__chip-day">
                                        {getDayLabel(date, index)}
                                    </span>

                                    {total > 1 && (
                                        <span className="booking-date-strip__count">
                                            {total}
                                        </span>
                                    )}
                                </span>

                                <span className="booking-date-strip__chip-date">
                                    {getDateLabel(date)}
                                </span>

                                <span className="booking-date-strip__markers">
                                    {markers.map((marker) => (
                                        <span
                                            key={`${dateKey}-${marker}`}
                                            className={`booking-date-strip__marker booking-date-strip__marker--${marker}`}
                                        />
                                    ))}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    className="booking-date-strip__nav-button"
                    onClick={() => shiftRange(7)}
                    aria-label="Show next dates"
                >
                    →
                </button>
            </div>

            {isCalendarOpen && (
                <div className="booking-date-strip__calendar-popover">
                    <div className="booking-date-strip__calendar-header">
                        <button
                            type="button"
                            className="booking-date-strip__calendar-nav"
                            onClick={handlePreviousMonth}
                            aria-label="Previous month"
                        >
                            ←
                        </button>

                        <h4 className="booking-date-strip__calendar-title">
                            {formatMonthLabel(calendarMonth)}
                        </h4>

                        <button
                            type="button"
                            className="booking-date-strip__calendar-nav"
                            onClick={handleNextMonth}
                            aria-label="Next month"
                        >
                            →
                        </button>
                    </div>

                    <div className="booking-date-strip__calendar-weekdays">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                            <span key={day} className="booking-date-strip__calendar-weekday">
                                {day}
                            </span>
                        ))}
                    </div>

                    <div className="booking-date-strip__calendar-grid">
                        {calendarDays.map((date) => {
                            const dateKey = toDateKey(date);
                            const daySummary = summary[dateKey];
                            const total = daySummary?.total || 0;
                            const markers = getMarkers(daySummary);
                            const isSelected = selectedDate === dateKey;
                            const isMuted = !isSameMonth(date, calendarMonth);

                            return (
                                <button
                                    key={dateKey}
                                    type="button"
                                    className={[
                                        "booking-date-strip__calendar-day",
                                        isSelected
                                            ? "booking-date-strip__calendar-day--selected"
                                            : "",
                                        total > 0
                                            ? "booking-date-strip__calendar-day--active"
                                            : "",
                                        isMuted
                                            ? "booking-date-strip__calendar-day--muted"
                                            : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    onClick={() => handleSelectFromPopup(date)}
                                >
                                    <span className="booking-date-strip__calendar-day-number">
                                        {date.getDate()}
                                    </span>

                                    <span className="booking-date-strip__calendar-markers">
                                        {markers.map((marker) => (
                                            <span
                                                key={`${dateKey}-${marker}`}
                                                className={`booking-date-strip__marker booking-date-strip__marker--${marker}`}
                                            />
                                        ))}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="booking-date-strip__legend">
                        <span className="booking-date-strip__legend-item">
                            <span className="booking-date-strip__marker booking-date-strip__marker--confirmed" />
                            Confirmed
                        </span>
                        <span className="booking-date-strip__legend-item">
                            <span className="booking-date-strip__marker booking-date-strip__marker--pending" />
                            Pending
                        </span>
                        <span className="booking-date-strip__legend-item">
                            <span className="booking-date-strip__marker booking-date-strip__marker--completed" />
                            Completed
                        </span>
                    </div>
                </div>
            )}
        </section>
    );
}