import { useCallback, useEffect, useMemo, useState } from "react";
import { getSocket } from "../socket";

export default function useOwnerDashboard() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [dashboard, setDashboard] = useState({
        restaurant: null,
        summary: {
            occupiedGuests: 0,
            occupiedTables: 0,
            activeReservations: 0,
            pendingBookingsCount: 0,
            pendingChangeRequestsCount: 0,
        },
        expectedGuests: [],
        layoutSummary: {
            zonesCount: 0,
            totalTables: 0,
            activeTables: 0,
            reservableTables: 0,
            occupiedTables: 0,
            reservedTables: 0,
        },
        zoneSummaries: [],
    });

    const loadDashboard = useCallback(async () => {
        setStatus("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/owner/dashboard", {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || "Failed to load dashboard");
                return;
            }

            setDashboard(data);
        } catch (error) {
            console.error(error);
            setStatus("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    useEffect(() => {
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");
        const socket = getSocket();

        socket.connect();

        socket.on("connect", () => {
            socket.emit("join", { role, userId });
        });

        const refreshDashboard = () => {
            loadDashboard();
        };

        socket.on("reservation:created", refreshDashboard);
        socket.on("reservation:updated", refreshDashboard);
        socket.on("occupancy:update", refreshDashboard);
        socket.on("occupancy:updated", refreshDashboard);

        return () => {
            socket.off("reservation:created", refreshDashboard);
            socket.off("reservation:updated", refreshDashboard);
            socket.off("occupancy:update", refreshDashboard);
            socket.off("occupancy:updated", refreshDashboard);
        };
    }, [loadDashboard]);

    const quickActions = useMemo(
        () => [
            {
                title: "Review requests",
                description: `${dashboard.summary.pendingBookingsCount + dashboard.summary.pendingChangeRequestsCount} open items`,
                route: "/owner/request",
            },
            {
                title: "QR check-ins",
                description: `${dashboard.summary.activeReservations} active checked-in bookings`,
                route: "/owner/check-ins",
            },
            {
                title: "Zones and tables",
                description: `${dashboard.layoutSummary.totalTables} tables across ${dashboard.layoutSummary.zonesCount} zones`,
                route: "/owner/restaurant-layout",
            },
            {
                title: "Restaurant profile",
                description: dashboard.restaurant?.name || "Open profile",
                route: "/owner/restaurant/profile",
            },
        ],
        [dashboard]
    );

    return {
        loading,
        status,
        dashboard,
        quickActions,
        reloadDashboard: loadDashboard,
    };
}