import { useCallback, useEffect, useState } from "react";
import { getSocket } from "../socket";

export default function useCustomerNotificationCounts() {
    const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
    const [upcomingConfirmedCount, setUpcomingConfirmedCount] = useState(0);
    const [updatedBookingsCount, setUpdatedBookingsCount] = useState(0);

    const loadCounts = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/customer/reservations", {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const text = await res.text();
            const data = text ? JSON.parse(text) : [];
            const now = Date.now();

            const pending = Array.isArray(data)
                ? data.filter((r) => r.status === "PENDING").length
                : 0;

            const confirmedUpcoming = Array.isArray(data)
                ? data.filter(
                    (r) =>
                        r.status === "CONFIRMED" &&
                        new Date(r.startsAt).getTime() >= now
                ).length
                : 0;

            const changed = Array.isArray(data)
                ? data.filter((r) =>
                    ["DECLINED", "CANCELLED"].includes(r.status)
                ).length
                : 0;

            setPendingBookingsCount(pending);
            setUpcomingConfirmedCount(confirmedUpcoming);
            setUpdatedBookingsCount(changed);
        } catch (error) {
            console.error("failed to load customer notification counts", error);
            setPendingBookingsCount(0);
            setUpcomingConfirmedCount(0);
            setUpdatedBookingsCount(0);
        }
    }, []);

    useEffect(() => {
        loadCounts();
    }, [loadCounts]);

    useEffect(() => {
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");
        const socket = getSocket();

        socket.connect();

        const joinRoom = () => {
            socket.emit("join", { role, userId });
        };

        const refresh = () => {
            loadCounts();
        };
        socket.on("connect", joinRoom);
        socket.on("reservation:created", refresh);
        socket.on("reservation:updated", refresh);

        return () => {
            socket.off("connect", joinRoom);
            socket.off("reservation:created", refresh);
            socket.off("reservation:updated", refresh);
        };
    }, [loadCounts]);

    return {
        pendingBookingsCount,
        upcomingConfirmedCount,
        updatedBookingsCount,
        totalCustomerNotifications:
            pendingBookingsCount + upcomingConfirmedCount + updatedBookingsCount,
    };
}