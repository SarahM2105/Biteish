import { useCallback, useEffect, useMemo, useState } from "react";
import { getSocket } from "../socket";
import { authFetch } from "../components/utils/authFetch";
import { getApiErrorMessage } from "../components/utils/getApiErrorMessage";

function parseJsonSafely(text, fallback = []) {
    try {
        return text ? JSON.parse(text) : fallback;
    } catch {
        return fallback;
    }
}

async function readNotificationResult(result, fallbackMessage) {
    if (result.status !== "fulfilled") {
        return {
            data: [],
            error: fallbackMessage,
        };
    }

    const text = await result.value.text();
    const data = parseJsonSafely(text, {});

    if (!result.value.ok) {
        return {
            data: [],
            error: getApiErrorMessage(data, fallbackMessage),
        };
    }

    return {
        data: Array.isArray(data) ? data : [],
        error: "",
    };
}

function formatDate(value) {
    if (!value) return "Date unavailable";
    return new Date(value).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatTime(value) {
    if (!value) return "Time unavailable";
    return new Date(value).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDateTime(value) {
    if (!value) return "Time unavailable";
    return `${formatDate(value)} at ${formatTime(value)}`;
}

function getFirstValidTimestamp(...values) {
    for (const value of values) {
        if (!value) continue;
        const time = new Date(value).getTime();
        if (!Number.isNaN(time)) {
            return value;
        }
    }
    return null;
}

function isRecent(value, days = 14) {
    if (!value) return false;
    const time = new Date(value).getTime();
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return time >= cutoff;
}

function getGuestName(reservation) {
    return reservation?.user?.name || reservation?.guestName || "Guest";
}

function getReservationEventTime(reservation) {
    if (!reservation) return null;

    if (reservation.status === "CANCELLED") {
        return getFirstValidTimestamp(
            reservation.cancelledAt,
            reservation.updatedAt,
            reservation.createdAt,
            reservation.startsAt
        );
    }

    if (reservation.status === "DECLINED") {
        return getFirstValidTimestamp(
            reservation.declinedAt,
            reservation.updatedAt,
            reservation.createdAt,
            reservation.startsAt
        );
    }

    if (reservation.status === "NO_SHOW") {
        return getFirstValidTimestamp(
            reservation.noShowAt,
            reservation.updatedAt,
            reservation.createdAt,
            reservation.startsAt
        );
    }

    return getFirstValidTimestamp(
        reservation.updatedAt,
        reservation.createdAt,
        reservation.startsAt
    );
}

function getChangeRequestEventTime(request) {
    return getFirstValidTimestamp(
        request?.createdAt,
        request?.updatedAt,
        request?.reviewedAt,
        request?.reservation?.updatedAt,
        request?.reservation?.createdAt,
        request?.reservation?.startsAt
    );
}

function getLateArrivalEventTime(item) {
    return getFirstValidTimestamp(
        item?.lateAt,
        item?.updatedAt,
        item?.createdAt,
        item?.startsAt
    );
}

function buildPendingReservationNotification(reservation) {
    const restaurantName = reservation.restaurant?.name || "Your restaurant";
    const guestName = getGuestName(reservation);

    return {
        id: `pending-${reservation.id}`,
        category: "requests",
        kind: "request",
        badgeLabel: "Request",
        title: "New booking request",
        message: `${guestName} requested a booking at ${restaurantName} for ${formatDateTime(
            reservation.startsAt
        )}.`,
        meta: [
            restaurantName,
            formatDate(reservation.startsAt),
            formatTime(reservation.startsAt),
        ],
        details: [
            `Guest: ${guestName}`,
            `Party size: ${reservation.partySize}`,
            `Table: ${reservation.table?.name || "Not assigned"}`,
            `Status: ${reservation.status}`,
        ],
        primaryAction: {
            label: "Review request",
            target: "/owner/request",
        },
        secondaryAction: {
            label: "View bookings",
            target: "/owner/bookings",
        },
        sortAt: getFirstValidTimestamp(
            reservation.createdAt,
            reservation.updatedAt,
            reservation.startsAt
        ),
    };
}

function buildChangeRequestNotification(request) {
    const reservation = request.reservation || {};
    const restaurantName =
        reservation.restaurant?.name ||
        reservation.table?.restaurant?.name ||
        "Your restaurant";
    const guestName = getGuestName(reservation);

    const requestedStart = request.newStartsAt || reservation.startsAt;
    const currentStart = reservation.startsAt;

    return {
        id: `change-${request.id}`,
        category: "changes",
        kind: "change",
        badgeLabel: "Change",
        title: "Booking change request",
        message: `${guestName} requested an update for their booking at ${restaurantName}.`,
        meta: [
            restaurantName,
            formatDate(requestedStart),
            formatTime(requestedStart),
        ],
        details: [
            `Guest: ${guestName}`,
            `Current: ${formatDateTime(currentStart)}`,
            `Proposed: ${formatDateTime(requestedStart)}`,
            `Party size: ${request.newPartySize ?? reservation.partySize ?? "No change"}`,
        ],
        primaryAction: {
            label: "Review change",
            target: "/owner/request",
        },
        secondaryAction: {
            label: "View bookings",
            target: "/owner/bookings",
        },
        sortAt: getChangeRequestEventTime(request),
    };
}

function buildLateArrivalNotification(item) {
    const restaurantName =
        item.restaurant?.name ||
        item.table?.restaurant?.name ||
        "Your restaurant";

    const guestName = getGuestName(item);

    return {
        id: `late-${item.id}`,
        category: "alerts",
        kind: "alert",
        badgeLabel: "Alert",
        title: "Late arrival",
        message: `${guestName} is past the grace period for their booking at ${restaurantName}.`,
        meta: [restaurantName, formatDate(item.startsAt), formatTime(item.startsAt)],
        details: [
            `Guest: ${guestName}`,
            `Party size: ${item.partySize ?? "Unknown"}`,
            `Table: ${item.table?.name || "Not assigned"}`,
            `Status: ${item.status || "CONFIRMED"}`,
        ],
        primaryAction: {
            label: "Open bookings",
            target: "/owner/bookings",
        },
        secondaryAction: {
            label: "Open check-ins",
            target: "/owner/check-ins",
        },
        sortAt: getLateArrivalEventTime(item),
    };
}

function buildReservationUpdateNotification(reservation) {
    const restaurantName = reservation.restaurant?.name || "Your restaurant";
    const guestName = getGuestName(reservation);
    const eventTime = getReservationEventTime(reservation);

    if (reservation.status === "CANCELLED") {
        return {
            id: `cancelled-${reservation.id}`,
            category: "cancellations",
            kind: "alert",
            badgeLabel: "Cancelled",
            title: "Booking cancelled",
            message: `${guestName} cancelled a booking at ${restaurantName}.`,
            meta: [
                restaurantName,
                formatDate(reservation.startsAt),
                formatTime(reservation.startsAt),
            ],
            details: [
                `Guest: ${guestName}`,
                `Party size: ${reservation.partySize}`,
                `Table: ${reservation.table?.name || "Not assigned"}`,
                `Status: ${reservation.status}`,
            ],
            primaryAction: {
                label: "View bookings",
                target: "/owner/bookings",
            },
            sortAt: eventTime,
        };
    }

    if (reservation.status === "NO_SHOW") {
        return {
            id: `noshow-${reservation.id}`,
            category: "alerts",
            kind: "alert",
            badgeLabel: "No show",
            title: "No-show recorded",
            message: `${guestName} was marked as a no-show at ${restaurantName}.`,
            meta: [
                restaurantName,
                formatDate(reservation.startsAt),
                formatTime(reservation.startsAt),
            ],
            details: [
                `Guest: ${guestName}`,
                `Party size: ${reservation.partySize}`,
                `Table: ${reservation.table?.name || "Not assigned"}`,
                `Status: ${reservation.status}`,
            ],
            primaryAction: {
                label: "View bookings",
                target: "/owner/bookings",
            },
            secondaryAction: {
                label: "Open check-ins",
                target: "/owner/check-ins",
            },
            sortAt: eventTime,
        };
    }

    if (reservation.status === "DECLINED") {
        return {
            id: `declined-${reservation.id}`,
            category: "requests",
            kind: "info",
            badgeLabel: "Declined",
            title: "Booking request declined",
            message: `A booking request from ${guestName} at ${restaurantName} was declined.`,
            meta: [
                restaurantName,
                formatDate(reservation.startsAt),
                formatTime(reservation.startsAt),
            ],
            details: [
                `Guest: ${guestName}`,
                `Party size: ${reservation.partySize}`,
                `Table: ${reservation.table?.name || "Not assigned"}`,
                `Status: ${reservation.status}`,
            ],
            primaryAction: {
                label: "View bookings",
                target: "/owner/bookings",
            },
            sortAt: eventTime,
        };
    }

    return null;
}

export default function useOwnerNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        setStatus("");

        try {
            const [
                pendingReservationsResult,
                changeRequestsResult,
                allReservationsResult,
                lateArrivalsResult,
            ] = await Promise.allSettled([
                authFetch("/api/owner/reservations/pending"),
                authFetch("/api/owner/change-request"),
                authFetch("/api/owner/reservations"),
                authFetch("/api/owner/dashboard/late-arrivals"),
            ]);

            const pendingReservationsResponse = await readNotificationResult(
                pendingReservationsResult,
                "Failed to load pending reservation notifications."
            );

            const changeRequestsResponse = await readNotificationResult(
                changeRequestsResult,
                "Failed to load booking change notifications."
            );

            const allReservationsResponse = await readNotificationResult(
                allReservationsResult,
                "Failed to load reservation update notifications."
            );

            const lateArrivalsResponse = await readNotificationResult(
                lateArrivalsResult,
                "Failed to load late arrival notifications."
            );

            const pendingReservations = pendingReservationsResponse.data;
            const changeRequests = changeRequestsResponse.data;
            const allReservations = allReservationsResponse.data;
            const lateArrivals = lateArrivalsResponse.data;

            const errors = [
                pendingReservationsResponse.error,
                changeRequestsResponse.error,
                allReservationsResponse.error,
                lateArrivalsResponse.error,
            ].filter(Boolean);

            const requestItems = pendingReservations
                .map(buildPendingReservationNotification)
                .filter(Boolean);

            const changeItems = changeRequests
                .map(buildChangeRequestNotification)
                .filter(Boolean);

            const alertItems = lateArrivals
                .map(buildLateArrivalNotification)
                .filter(Boolean);

            const updateItems = allReservations
                .filter(
                    (reservation) =>
                        ["CANCELLED", "NO_SHOW", "DECLINED"].includes(reservation.status) &&
                        isRecent(getReservationEventTime(reservation), 14)
                )
                .map(buildReservationUpdateNotification)
                .filter(Boolean);

            const items = [
                ...requestItems,
                ...changeItems,
                ...alertItems,
                ...updateItems,
            ].sort(
                (a, b) =>
                    new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime()
            );

            setNotifications(items);

            if (errors.length === 4) {
                setStatus("Failed to load owner notifications.");
            } else if (errors.length > 0) {
                setStatus("Some owner notifications could not be loaded.");
            }
        } catch (error) {
            console.error(error);
            setNotifications([]);
            setStatus("Network/server error while loading owner notifications.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    useEffect(() => {
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");
        const socket = getSocket();

        socket.connect();

        const joinRoom = () => {
            socket.emit("join", { role, userId });
        };

        const refresh = () => {
            loadNotifications();
        };

        socket.on("connect", joinRoom);
        socket.on("reservation:created", refresh);
        socket.on("reservation:updated", refresh);

        return () => {
            socket.off("connect", joinRoom);
            socket.off("reservation:created", refresh);
            socket.off("reservation:updated", refresh);
        };
    }, [loadNotifications]);

    const summary = useMemo(() => {
        const requests = notifications.filter(
            (item) => item.category === "requests"
        ).length;

        const changes = notifications.filter(
            (item) => item.category === "changes"
        ).length;

        const alerts = notifications.filter(
            (item) => item.category === "alerts"
        ).length;

        const cancellations = notifications.filter(
            (item) => item.category === "cancellations"
        ).length;

        return {
            total: notifications.length,
            requests,
            changes,
            alerts,
            cancellations,
        };
    }, [notifications]);

    return {
        notifications,
        loading,
        status,
        summary,
        reloadNotifications: loadNotifications,
    };
}