import { useEffect, useMemo, useState } from "react";
import { authFetch } from "../components/utils/authFetch";
import { getApiErrorMessage } from "../components/utils/getApiErrorMessage";

export default function useCustomerDashboardData() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        async function loadDashboardData() {
            setLoading(true);
            setStatus("");

            try {
                const res = await authFetch("/api/customer/reservations");
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setStatus(
                        getApiErrorMessage(data, "Failed to load dashboard data")
                    );
                    setReservations([]);
                    return;
                }

                setReservations(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error(error);
                setStatus("Network/server error");
                setReservations([]);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
    }, []);

    const now = new Date();

    const upcomingBookings = useMemo(() => {
        return reservations.filter((reservation) => {
            const startsAt = new Date(reservation.startsAt);
            return (
                startsAt > now &&
                !["CANCELLED", "DECLINED", "COMPLETED", "NO_SHOW"].includes(reservation.status)
            );
        });
    }, [reservations]);

    const pastReservations = useMemo(() => {
        return reservations.filter((reservation) => {
            return ["COMPLETED"].includes(reservation.status);
        });
    }, [reservations]);

    const nextBooking = useMemo(() => {
        if (upcomingBookings.length === 0) return null;
        return upcomingBookings[0];
    }, [upcomingBookings]);

    const summary = useMemo(() => {
        return {
            upcomingBookings: upcomingBookings.length,
            totalVisits: pastReservations.length,
            savedRestaurants: 0,
            mostBookedCuisine: "N/A",
        };
    }, [upcomingBookings.length, pastReservations.length]);

    return {
        loading,
        status,
        reservations,
        upcomingBookings,
        pastReservations,
        nextBooking,
        summary,
    };
}