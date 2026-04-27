import { useCallback, useEffect, useMemo, useState } from "react";
import { getSocket } from "../socket";
import { authFetch } from "../components/utils/authFetch";
import { getApiErrorMessage } from "../components/utils/getApiErrorMessage";

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
        zones: [],
    });

    const loadDashboard = useCallback(async () => {
        setStatus("");

        try {
            const res = await authFetch("/api/owner/dashboard");
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(getApiErrorMessage(data, "Failed to load dashboard"));
                return;
            }

            setDashboard({
                restaurant: data.restaurant || null,
                summary: {
                    occupiedGuests: data.summary?.occupiedGuests || 0,
                    occupiedTables: data.summary?.occupiedTables || 0,
                    activeReservations: data.summary?.activeReservations || 0,
                    pendingBookingsCount: data.summary?.pendingBookingsCount || 0,
                    pendingChangeRequestsCount: data.summary?.pendingChangeRequestsCount || 0,
                },
                expectedGuests: Array.isArray(data.expectedGuests) ? data.expectedGuests : [],
                layoutSummary: {
                    zonesCount: data.layoutSummary?.zonesCount || 0,
                    totalTables: data.layoutSummary?.totalTables || 0,
                    activeTables: data.layoutSummary?.activeTables || 0,
                    reservableTables: data.layoutSummary?.reservableTables || 0,
                    occupiedTables: data.layoutSummary?.occupiedTables || 0,
                    reservedTables: data.layoutSummary?.reservedTables || 0,
                },
                zoneSummaries: Array.isArray(data.zoneSummaries) ? data.zoneSummaries : [],
                zones: Array.isArray(data.zones) ? data.zones : [],
            });
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

        const joinRoom = () => {
            socket.emit("join", { role, userId });
        };

        const refreshDashboard = () => {
            loadDashboard();
        };

        socket.on("connect", joinRoom);
        socket.on("reservation:created", refreshDashboard);
        socket.on("reservation:updated", refreshDashboard);
        socket.on("occupancy:update", refreshDashboard);
        socket.on("occupancy:updated", refreshDashboard);

        const intervalId = window.setInterval(() => {
            refreshDashboard();
        }, 30000);

        return () => {
            socket.off("connect", joinRoom);
            socket.off("reservation:created", refreshDashboard);
            socket.off("reservation:updated", refreshDashboard);
            socket.off("occupancy:update", refreshDashboard);
            socket.off("occupancy:updated", refreshDashboard);
            window.clearInterval(intervalId);
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