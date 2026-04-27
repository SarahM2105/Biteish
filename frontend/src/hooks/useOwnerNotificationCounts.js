import { useCallback, useEffect, useState } from "react";
import { getSocket } from "../socket";
import { authFetch } from "../components/utils/authFetch";

export default function useOwnerNotificationCounts() {
    const [newBookingsCount, setNewBookingsCount] = useState(0);
    const [changeRequestsCount, setChangeRequestsCount] = useState(0);

    const resetCounts = useCallback(() => {
        setNewBookingsCount(0);
        setChangeRequestsCount(0);
    }, []);

    const loadCounts = useCallback(async () => {
        try {
            const [resBookings, resChanges] = await Promise.all([
                authFetch("/api/owner/reservations/pending"),
                authFetch("/api/owner/change-request"),
            ]);

            const bookingsText = await resBookings.text();
            const changesText = await resChanges.text();

            const bookingsData = bookingsText ? JSON.parse(bookingsText) : [];
            const changesData = changesText ? JSON.parse(changesText) : [];

            if (!resBookings.ok || !resChanges.ok) {
                resetCounts();
                return;
            }

            const pendingBookings = Array.isArray(bookingsData)
                ? bookingsData.filter((reservation) => reservation.status === "PENDING").length
                : 0;

            const pendingChanges = Array.isArray(changesData)
                ? changesData.filter((request) => request.status === "PENDING").length
                : 0;

            setNewBookingsCount(pendingBookings);
            setChangeRequestsCount(pendingChanges);
        } catch (error) {
            console.error("failed to load owner notification counts", error);
            resetCounts();
        }
    }, [resetCounts]);

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
        socket.on("change-request:created", refresh);
        socket.on("change-request:updated", refresh);

        return () => {
            socket.off("connect", joinRoom);
            socket.off("reservation:created", refresh);
            socket.off("reservation:updated", refresh);
            socket.off("change-request:created", refresh);
            socket.off("change-request:updated", refresh);
        };
    }, [loadCounts]);

    return {
        newBookingsCount,
        changeRequestsCount,
        totalRequestsCount: newBookingsCount + changeRequestsCount,
    };
}