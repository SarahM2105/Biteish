import { useCallback, useEffect, useMemo, useState } from "react";
import { getSocket } from "../socket";
import { authFetch } from "../components/utils/authFetch";
import { getApiErrorMessage } from "../components/utils/getApiErrorMessage";

function isSameDay(dateValue, compareDate = new Date()) {
    if (!dateValue) return false;

    const date = new Date(dateValue);

    return (
        date.getDate() === compareDate.getDate() &&
        date.getMonth() === compareDate.getMonth() &&
        date.getFullYear() === compareDate.getFullYear()
    );
}

function isLiveCheckedInReservation(reservation, now = new Date()) {
    if (!reservation) return false;
    if (reservation.status !== "CONFIRMED") return false;
    if (!reservation.checkedInAt) return false;
    if (!reservation.startsAt || !reservation.endsAt) return false;

    const startsAt = new Date(reservation.startsAt);
    const endsAt = new Date(reservation.endsAt);

    return startsAt <= now && endsAt > now;
}

export function useOwnerAnalytics() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: "", message: "" });

    const [pendingReservations, setPendingReservations] = useState([]);
    const [changeRequests, setChangeRequests] = useState([]);
    const [reservations, setReservations] = useState([]);

    const loadAnalytics = useCallback(async (showLoader = false) => {
        if (showLoader) {
            setLoading(true);
        }

        try {
            const [pendingRes, changeReqRes, reservationsRes] = await Promise.all([
                authFetch("/api/owner/reservations/pending"),
                authFetch("/api/owner/change-request"),
                authFetch("/api/owner/reservations"),
            ]);

            const pendingData = await pendingRes.json().catch(() => ({}));
            const changeReqData = await changeReqRes.json().catch(() => ({}));
            const reservationsData = await reservationsRes.json().catch(() => ({}));

            if (!pendingRes.ok) {
                throw new Error(
                    getApiErrorMessage(pendingData, "Failed to load pending reservations")
                );
            }

            if (!changeReqRes.ok) {
                throw new Error(
                    getApiErrorMessage(changeReqData, "Failed to load change requests")
                );
            }

            if (!reservationsRes.ok) {
                throw new Error(
                    getApiErrorMessage(reservationsData, "Failed to load reservations")
                );
            }

            setPendingReservations(Array.isArray(pendingData) ? pendingData : []);
            setChangeRequests(Array.isArray(changeReqData) ? changeReqData : []);
            setReservations(Array.isArray(reservationsData) ? reservationsData : []);
            setStatus({ type: "", message: "" });
        } catch (error) {
            console.error(error);
            setStatus({
                type: "error",
                message: error.message || "Failed to load analytics",
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAnalytics(true);
    }, [loadAnalytics]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            loadAnalytics(false);
        }, 20000);

        return () => clearInterval(intervalId);
    }, [loadAnalytics]);

    useEffect(() => {
        const socket = getSocket?.();

        if (!socket) return undefined;

        const refreshAnalytics = () => {
            loadAnalytics(false);
        };

        socket.on("reservation:created", refreshAnalytics);
        socket.on("reservation:updated", refreshAnalytics);
        socket.on("checkin:created", refreshAnalytics);
        socket.on("checkin:updated", refreshAnalytics);
        socket.on("checkout:created", refreshAnalytics);
        socket.on("checkout:updated", refreshAnalytics);
        socket.on("occupancy:update", refreshAnalytics);
        socket.on("change-request:created", refreshAnalytics);
        socket.on("change-request:updated", refreshAnalytics);

        return () => {
            socket.off("reservation:created", refreshAnalytics);
            socket.off("reservation:updated", refreshAnalytics);
            socket.off("checkin:created", refreshAnalytics);
            socket.off("checkin:updated", refreshAnalytics);
            socket.off("checkout:created", refreshAnalytics);
            socket.off("checkout:updated", refreshAnalytics);
            socket.off("occupancy:update", refreshAnalytics);
            socket.off("change-request:created", refreshAnalytics);
            socket.off("change-request:updated", refreshAnalytics);
        };
    }, [loadAnalytics]);

    const analytics = useMemo(() => {
        const now = new Date();

        const liveReservations = reservations.filter((reservation) =>
            isLiveCheckedInReservation(reservation, now)
        );

        const todaysReservations = reservations.filter((reservation) =>
            isSameDay(reservation.startsAt, now)
        );

        const confirmedToday = todaysReservations.filter(
            (reservation) => reservation.status === "CONFIRMED"
        ).length;

        const pendingToday = todaysReservations.filter(
            (reservation) => reservation.status === "PENDING"
        ).length;

        const completedToday = todaysReservations.filter(
            (reservation) => reservation.status === "COMPLETED"
        ).length;

        const declinedToday = todaysReservations.filter(
            (reservation) => reservation.status === "DECLINED"
        ).length;

        const noShowsToday = todaysReservations.filter(
            (reservation) => reservation.status === "NO_SHOW"
        ).length;

        const checkedInToday = todaysReservations.filter(
            (reservation) => Boolean(reservation.checkedInAt)
        ).length;

        const liveGuests = liveReservations.reduce((sum, reservation) => {
            return sum + (reservation.partySize || 0);
        }, 0);

        const occupiedTables = new Set(
            liveReservations.map((reservation) => reservation.tableId).filter(Boolean)
        ).size;

        return {
            liveGuests,
            liveTables: occupiedTables,
            activeCheckIns: liveReservations.length,
            pendingBookings: pendingReservations.length,
            pendingChanges: changeRequests.length,
            bookingsToday: todaysReservations.length,
            confirmedToday,
            pendingToday,
            completedToday,
            declinedToday,
            noShowsToday,
            checkedInToday,
        };
    }, [pendingReservations, changeRequests, reservations]);

    const todayMetrics = [
        {
            label: "Bookings today",
            value: analytics.bookingsToday,
            hint: "All reservations scheduled for today",
        },
        {
            label: "Confirmed today",
            value: analytics.confirmedToday,
            hint: "Reservations currently in confirmed status",
        },
        {
            label: "Pending today",
            value: analytics.pendingToday,
            hint: "Today's reservations still awaiting action",
        },
        {
            label: "Checked in today",
            value: analytics.checkedInToday,
            hint: "Today's reservations with a check-in timestamp",
        },
        {
            label: "Completed today",
            value: analytics.completedToday,
            hint: "Today's reservations marked as completed",
        },
        {
            label: "Declined today",
            value: analytics.declinedToday,
            hint: "Today's declined reservation requests",
        },
        {
            label: "No-shows today",
            value: analytics.noShowsToday,
            hint: "Today's bookings marked as no-show",
        },
    ];

    const todayChartData = [
        { label: "Confirmed", value: analytics.confirmedToday },
        { label: "Pending", value: analytics.pendingToday },
        { label: "Completed", value: analytics.completedToday },
        { label: "Declined", value: analytics.declinedToday },
        { label: "No-show", value: analytics.noShowsToday },
    ];

    const liveMetrics = [
        {
            label: "Guests checked in",
            value: analytics.liveGuests,
            hint: "Confirmed bookings checked in and currently within their booking time",
        },
        {
            label: "Occupied tables",
            value: analytics.liveTables,
            hint: "Tables currently in use",
        },
        {
            label: "Active check-ins",
            value: analytics.activeCheckIns,
            hint: "Live checked-in reservations happening now",
        },
    ];

    const queueMetrics = [
        {
            label: "Pending booking requests",
            value: analytics.pendingBookings,
            hint: "Reservations still waiting for approval",
        },
        {
            label: "Pending change requests",
            value: analytics.pendingChanges,
            hint: "Incoming customer booking changes awaiting review",
        },
    ];

    return {
        loading,
        status,
        analytics,
        todayMetrics,
        todayChartData,
        liveMetrics,
        queueMetrics,
        refreshAnalytics: loadAnalytics,
    };
}