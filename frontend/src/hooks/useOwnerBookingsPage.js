import { useEffect, useMemo, useState } from "react";
import {
    DAY_WINDOW,
    FUTURE_DISABLED_STATUS_FILTERS,
    addDays,
    formatFullDate,
    isHistoryBooking,
    matchesSpecificTime,
    matchesStatusFilter,
    startOfDay,
    toDateKey,
} from "../components/Owner/Bookings/BookingHelpers";
import { authFetch } from "../components/utils/authFetch";
import { getApiErrorMessage } from "../components/utils/getApiErrorMessage";

export default function useOwnerBookingsPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);

    const today = useMemo(() => startOfDay(new Date()), []);
    const todayKey = useMemo(() => toDateKey(today), [today]);

    const [browserWindowStart, setBrowserWindowStart] = useState(
        addDays(today, -(DAY_WINDOW - 1))
    );
    const [selectedBrowserDate, setSelectedBrowserDate] = useState("");
    const [browserStatusFilter, setBrowserStatusFilter] = useState("ALL");
    const [browserTimeFilter, setBrowserTimeFilter] = useState("");

    useEffect(() => {
        async function loadBookings() {
            setLoading(true);
            setStatus("");

            try {
                const res = await authFetch("/api/owner/reservations");
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setStatus(getApiErrorMessage(data, "Failed to load bookings."));
                    setBookings([]);
                    return;
                }

                setBookings(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error(error);
                setStatus("Network/server error while loading bookings.");
                setBookings([]);
            } finally {
                setLoading(false);
            }
        }

        loadBookings();
    }, []);

    const todayBookings = useMemo(
        () =>
            bookings
                .filter(
                    (booking) =>
                        toDateKey(booking.startsAt) === todayKey &&
                        !["DECLINED", "CANCELLED"].includes(booking.status)
                )
                .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)),
        [bookings, todayKey]
    );

    const upcomingBookings = useMemo(
        () =>
            bookings
                .filter(
                    (booking) =>
                        booking.status === "CONFIRMED" &&
                        !booking.checkedInAt &&
                        toDateKey(booking.startsAt) > todayKey
                )
                .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)),
        [bookings, todayKey]
    );

    const historyTotalCount = useMemo(
        () => bookings.filter((booking) => isHistoryBooking(booking, today)).length,
        [bookings, today]
    );

    const browserDates = useMemo(() => {
        return Array.from({ length: DAY_WINDOW }, (_, index) =>
            addDays(browserWindowStart, index)
        );
    }, [browserWindowStart]);

    const selectedBrowserIsFuture = selectedBrowserDate && selectedBrowserDate > todayKey;

    useEffect(() => {
        if (
            selectedBrowserIsFuture &&
            FUTURE_DISABLED_STATUS_FILTERS.includes(browserStatusFilter)
        ) {
            setBrowserStatusFilter("ALL");
        }
    }, [selectedBrowserIsFuture, browserStatusFilter]);

    const browserBookings = useMemo(() => {
        return bookings
            .filter((booking) =>
                selectedBrowserDate
                    ? toDateKey(booking.startsAt) === selectedBrowserDate
                    : true
            )
            .filter((booking) => matchesStatusFilter(booking, browserStatusFilter))
            .filter((booking) => matchesSpecificTime(booking, browserTimeFilter))
            .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));
    }, [bookings, selectedBrowserDate, browserStatusFilter, browserTimeFilter]);

    const selectedBrowserLabel = useMemo(() => {
        if (!selectedBrowserDate) return "All selected dates";

        const match = browserDates.find((date) => toDateKey(date) === selectedBrowserDate);
        return formatFullDate(match || selectedBrowserDate);
    }, [browserDates, selectedBrowserDate]);

    function goBrowserBackward() {
        setBrowserWindowStart((prev) => addDays(prev, -DAY_WINDOW));
    }

    function goBrowserForward() {
        setBrowserWindowStart((prev) => addDays(prev, DAY_WINDOW));
    }

    function handleJumpToDate(value) {
        if (!value) return;

        const picked = new Date(`${value}T00:00:00`);
        const centeredStart = addDays(picked, -Math.floor(DAY_WINDOW / 2));

        setSelectedBrowserDate(value);
        setBrowserWindowStart(centeredStart);
    }

    function clearBrowserFilters() {
        setBrowserStatusFilter("ALL");
        setBrowserTimeFilter("");
        setSelectedBrowserDate("");
        setBrowserWindowStart(addDays(today, -(DAY_WINDOW - 1)));
    }

    return {
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
    };
}