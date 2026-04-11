import { useCallback, useEffect, useMemo, useState } from "react";
import { getSocket } from "../socket";

function buildNotificationFromReservation(reservation) {
    const now = Date.now();
    const startsAtMs = new Date(reservation.startsAt).getTime();
    const hoursUntilBooking = (startsAtMs - now) / (1000 * 60 * 60);

    const restaurantName = reservation.restaurant?.name || "your restaurant";
    const bookingDate = new Date(reservation.startsAt).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    const bookingTime = new Date(reservation.startsAt).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const base = {
        id: reservation.id,
        reservationId: reservation.id,
        restaurantName,
        bookingDate,
        bookingTime,
        startsAt: reservation.startsAt,
        status: reservation.status,
        createdAt: reservation.createdAt,
        tableName: reservation.table?.name || "Table",
        partySize: reservation.partySize,
    };

    if (reservation.checkedInAt) {
        return {
            ...base,
            kind: "checked-in",
            title: "Checked in successfully",
            message: `You have been checked in at ${restaurantName}.`,
            actionLabel: "View booking",
            actionTarget: "/customer/myBookings",
            sortAt: reservation.checkedInAt,
        };
    }

    if (reservation.status === "PENDING") {
        return {
            ...base,
            kind: "pending",
            title: "Booking request sent",
            message: `Your booking for ${restaurantName} on ${bookingDate} at ${bookingTime} is waiting for restaurant approval.`,
            actionLabel: "View booking",
            actionTarget: "/customer/myBookings",
            sortAt: reservation.createdAt,
        };
    }

    if (reservation.status === "CONFIRMED" && startsAtMs >= now && hoursUntilBooking <= 24) {
        return {
            ...base,
            kind: "upcoming",
            title: "Booking coming up soon",
            message: `Reminder: you have a confirmed booking at ${restaurantName} on ${bookingDate} at ${bookingTime}.`,
            actionLabel: "View booking",
            actionTarget: "/customer/myBookings",
            sortAt: reservation.startsAt,
        };
    }

    if (reservation.status === "CONFIRMED" && startsAtMs >= now) {
        return {
            ...base,
            kind: "confirmed",
            title: "Booking confirmed",
            message: `Your booking at ${restaurantName} for ${bookingDate} at ${bookingTime} is confirmed.`,
            actionLabel: "View booking",
            actionTarget: "/customer/myBookings",
            sortAt: reservation.startsAt,
        };
    }

    if (reservation.status === "DECLINED") {
        return {
            ...base,
            kind: "declined",
            title: "Booking declined",
            message: `Your booking request for ${restaurantName} on ${bookingDate} at ${bookingTime} was declined.`,
            actionLabel: "Browse restaurants",
            actionTarget: "/customer/search",
            sortAt: reservation.createdAt,
        };
    }

    if (reservation.status === "CANCELLED") {
        return {
            ...base,
            kind: "cancelled",
            title: "Booking cancelled",
            message: `Your booking at ${restaurantName} on ${bookingDate} at ${bookingTime} has been cancelled.`,
            actionLabel: "Browse restaurants",
            actionTarget: "/customer/search",
            sortAt: reservation.createdAt,
        };
    }

    return null;
}

export default function useCustomerNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");

    const loadNotifications = useCallback(async () => {
        try {
            setLoading(true);
            setStatus("");

            const token = localStorage.getItem("token");
            const res = await fetch("/api/customer/reservations", {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const text = await res.text();
            const data = text ? JSON.parse(text) : [];

            if (!res.ok) {
                setNotifications([]);
                setStatus(data?.error || data?.message || "Failed to load notifications");
                return;
            }

            const items = Array.isArray(data)
                ? data
                    .map(buildNotificationFromReservation)
                    .filter(Boolean)
                    .sort((a, b) => new Date(b.sortAt).getTime() - new Date(a.sortAt).getTime())
                : [];

            setNotifications(items);
        } catch (error) {
            console.error(error);
            setNotifications([]);
            setStatus("Network/server error");
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
        const pending = notifications.filter((item) => item.kind === "pending").length;
        const upcoming = notifications.filter(
            (item) => item.kind === "confirmed" || item.kind === "upcoming"
        ).length;
        const updates = notifications.filter((item) => item.kind === "update").length;

        return {
            pending,
            upcoming,
            updates,
            total: notifications.length,
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