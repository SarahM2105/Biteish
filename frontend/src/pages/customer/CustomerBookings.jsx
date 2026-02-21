import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import { useNavigate } from "react-router-dom";
import {logout} from "../../components/utils/logout";



export default function CustomerBookings() {
    const name = localStorage.getItem("name") || "customer";
    const[active, setActive]  = useState("My Bookings");

    const [tab, setTab] = useState("UPCOMING"); // UPCOMING | PAST
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);

    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate);
            return;
        }
        setActive(label);
    }

    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            setLoading(true);
            setStatus("");

            const tokenNow = localStorage.getItem("token");
            if (!tokenNow) {
                setStatus("No token found. Please log in again.");
                setBookings([]);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("/api/customer/reservations", {
                    headers: { Authorization: `Bearer ${tokenNow}` },
                });

                const text = await res.text();
                let data = [];
                try {
                    data = text ? JSON.parse(text) : [];
                } catch {
                    setStatus("Bad response from server");
                    data = [];
                }

                if (!res.ok) {
                    setStatus(data?.error || data?.message || "Failed to load bookings");
                    setBookings([]);
                    return;
                }

                setBookings(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                setStatus("Network/server error");
                setBookings([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);



    const canEdit = (s) => !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(s);
    const canCancel = (s) => !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(s);

    function handleRequestChange(reservationId) {
        navigate(`/customer/bookings/${reservationId}/edit`);
    }

    async function handleCancel(reservationId) {
        const ok = window.confirm("Cancel this booking?");
        if (!ok) return;

        setStatus("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/customer/reservations/${reservationId}/cancel`, {
                method: "PATCH",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Cancel failed");
                return;
            }

            // update UI without refetch
            setBookings((prev) =>
                prev.map((b) => (b.id === reservationId ? { ...b, status: "CANCELLED" } : b))
            );
        } catch (e) {
            console.error(e);
            setStatus("Network/server error");
        }
    }

    useEffect(() => {
        (async () => {
            setLoading(true);
            setStatus("");

            const token = localStorage.getItem("token");

            console.log("Token in bookings page:", token);

            if (!token) {
                setStatus("No token found. Please log in again.");
                setLoading(false);
                return;
            }

            try {
                await fetch("/api/customer/reservations", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } catch (e) {
                console.error(e);
                setStatus("Network/server error");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const now = Date.now();

    const upcoming = useMemo(
        () => bookings.filter((b) => new Date(b.startsAt).getTime() >= now),
        [bookings, now]
    );

    const past = useMemo(
        () => bookings.filter((b) => new Date(b.startsAt).getTime() < now),
        [bookings, now]
    );

    const shown = tab === "UPCOMING" ? upcoming : past;



    return (
        <DashboardLayout name={name} sideNav={<CustomerSideNav active={active} onNavigate={handleNavigate}/>}>
            <h1 className="page-title">My Bookings</h1>

            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <button
                    className="sf-filterBtn"
                    type="button"
                    onClick={() => setTab("UPCOMING")}
                    disabled={tab === "UPCOMING"}
                >
                    Upcoming Bookings
                </button>

                <button
                    className="sf-filterBtn"
                    type="button"
                    onClick={() => setTab("PAST")}
                    disabled={tab === "PAST"}
                >
                    Past Bookings
                </button>
            </div>

            {loading && <div style={{ opacity: 0.85 }}>Loading…</div>}
            {status && <div style={{ opacity: 0.85 }}>{status}</div>}

            {!loading && !status && shown.length === 0 && (
                <div style={{ opacity: 0.85 }}>
                    {tab === "UPCOMING" ? "No upcoming bookings yet." : "No past bookings yet."}
                </div>
            )}

            <div style={{ display: "grid", gap: 12 }}>
                {shown.map((b) => (
                    <div key={b.id} className="dashboard-panel">
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{b.restaurant?.name || "Restaurant"}</div>

                                <div style={{ opacity: 0.85 }}>
                                    {new Date(b.startsAt).toLocaleString("en-GB")}
                                    {" · "}Party: {b.partySize}
                                </div>

                                <div style={{ opacity: 0.85 }}>Status: {b.status}</div>

                                {b.table?.name && (
                                    <div style={{ opacity: 0.85 }}>Table: {b.table.name}</div>
                                )}

                                {b.notes && <div style={{ opacity: 0.85 }}>Notes: {b.notes}</div>}

                                <div style={{ marginTop: 12, display: "grid", gap: 10, maxWidth: 220 }}>
                                    {canEdit(b.status) && (
                                        <button
                                            type="button"
                                            className="sf-filterBtn"
                                            onClick={() => handleRequestChange(b.id)}
                                        >
                                            Request change
                                        </button>
                                    )}

                                    {canCancel(b.status) && (
                                        <button
                                            type="button"
                                            className="sf-filterBtn"
                                            onClick={() => handleCancel(b.id)}
                                        >
                                            Cancel booking
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}