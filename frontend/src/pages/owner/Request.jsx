import React, { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import { getSocket } from "../../socket";

export default function Request() {
    const name = localStorage.getItem("name") || "owner";
    const active = "Request";

    const [loadingNew, setLoadingNew] = useState(false);
    const [loadingChanges, setLoadingChanges] = useState(false);
    const [status, setStatus] = useState("");

    const [reservations, setReservations] = useState([]);
    const [changeRequests, setChangeRequests] = useState([]);

    const [actingKey, setActingKey] = useState(null);

    const loadPendingBookings = useCallback(async () => {
        setStatus("");
        setLoadingNew(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/owner/reservations/pending", {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });

            const text = await res.text();
            let data = [];
            try {
                data = text ? JSON.parse(text) : [];
            } catch {
                setStatus("Bad response from server (new bookings)");
                setReservations([]);
                return;
            }

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to load new bookings");
                setReservations([]);
                return;
            }

            setReservations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setStatus("Network/server error (new bookings)");
            setReservations([]);
        } finally {
            setLoadingNew(false);
        }
    }, []);

    const loadPendingBookingUpdates = useCallback(async () => {
        setStatus("");
        setLoadingChanges(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/owner/change-request", {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });

            const text = await res.text();
            let data = [];
            try {
                data = text ? JSON.parse(text) : [];
            } catch {
                setStatus("Bad response from server (change requests)");
                setChangeRequests([]);
                return;
            }

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to load change requests");
                setChangeRequests([]);
                return;
            }

            setChangeRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setStatus("Network/server error (change requests)");
            setChangeRequests([]);
        } finally {
            setLoadingChanges(false);
        }
    }, []);

    useEffect(() => {
        loadPendingBookings();
        loadPendingBookingUpdates();
    }, [loadPendingBookings, loadPendingBookingUpdates]);

    useEffect(() => {
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");

        const socket = getSocket();
        socket.connect();

        socket.on("connect", () => {
            socket.emit("join", { role, userId });
        });

        const refreshRequests = () => {
            loadPendingBookings();
            loadPendingBookingUpdates();
        };

        socket.on("reservation:created", refreshRequests);
        socket.on("reservation:updated", refreshRequests);

        return () => {
            socket.off("reservation:created", refreshRequests);
            socket.off("reservation:updated", refreshRequests);
            socket.disconnect();
        };
    }, [loadPendingBookings, loadPendingBookingUpdates]);

    const pendingNew = useMemo(
        () => reservations.filter((r) => r.status === "PENDING"),
        [reservations]
    );

    const pendingChanges = useMemo(
        () => changeRequests.filter((cr) => cr.status === "PENDING"),
        [changeRequests]
    );

    async function approveNew(reservationId) {
        setStatus("");
        setActingKey(`new:${reservationId}`);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/reservations/${reservationId}/approve`, {
                method: "PATCH",
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setStatus(data?.error || data?.message || "Approve failed");
                return;
            }

            setReservations((prev) =>
                prev.map((r) => (r.id === reservationId ? { ...r, status: "CONFIRMED" } : r))
            );
        } catch (e) {
            console.error(e);
            setStatus("Network/server error approving booking");
        } finally {
            setActingKey(null);
        }
    }

    async function declineNew(reservationId) {
        setStatus("");
        setActingKey(`new:${reservationId}`);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/reservations/${reservationId}/decline`, {
                method: "PATCH",
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setStatus(data?.error || data?.message || "Decline failed");
                return;
            }

            setReservations((prev) =>
                prev.map((r) => (r.id === reservationId ? { ...r, status: "DECLINED" } : r))
            );
        } catch (e) {
            console.error(e);
            setStatus("Network/server error declining booking");
        } finally {
            setActingKey(null);
        }
    }

    async function approveChange(requestId) {
        setStatus("");
        setActingKey(`chg:${requestId}`);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/change-request/${requestId}/approve`, {
                method: "PATCH",
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setStatus(data?.error || data?.message || "Approve change failed");
                return;
            }

            setChangeRequests((prev) =>
                prev.map((cr) => (cr.id === requestId ? { ...cr, status: "APPROVED" } : cr))
            );
        } catch (e) {
            console.error(e);
            setStatus("Network/server error approving change request");
        } finally {
            setActingKey(null);
        }
    }

    async function declineChange(requestId) {
        setStatus("");
        setActingKey(`chg:${requestId}`);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/change-request/${requestId}/decline`, {
                method: "PATCH",
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setStatus(data?.error || data?.message || "Decline change failed");
                return;
            }

            setChangeRequests((prev) =>
                prev.map((cr) => (cr.id === requestId ? { ...cr, status: "DECLINED" } : cr))
            );
        } catch (e) {
            console.error(e);
            setStatus("Network/server error declining change request");
        } finally {
            setActingKey(null);
        }
    }

    function fmt(v) {
        if (!v) return "—";
        return new Date(v).toLocaleString("en-GB");
    }

    return (
        <DashboardLayout name={name} sideNav={<OwnerSideNav active={active} />}>
            <h1 className="page-title">Requests</h1>

            {status && <div style={{ opacity: 0.9, marginBottom: 12 }}>{status}</div>}

            <div className="dashboard-panel" style={{ marginTop: 12 }}>
                <h2 style={{ marginBottom: 12 }}>New bookings</h2>

                {loadingNew && <div style={{ opacity: 0.85 }}>Loading…</div>}

                {!loadingNew && pendingNew.length === 0 && (
                    <div style={{ opacity: 0.85 }}>No pending bookings right now.</div>
                )}

                <div style={{ display: "grid", gap: 12 }}>
                    {pendingNew.map((r) => (
                        <div key={r.id} className="dashboard-panel">
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>
                                        {r.user?.name || "Customer"} · Party {r.partySize}
                                    </div>
                                    <div style={{ opacity: 0.85 }}>
                                        {fmt(r.startsAt)} → {fmt(r.endsAt)}
                                    </div>
                                    <div style={{ opacity: 0.85 }}>
                                        Table: {r.table?.name || "—"}{" "}
                                        {r.table?.capacity ? `(seats ${r.table.capacity})` : ""}
                                    </div>
                                    {r.notes && <div style={{ opacity: 0.85 }}>Notes: {r.notes}</div>}
                                    <div style={{ opacity: 0.85, marginTop: 6 }}>Status: {r.status}</div>
                                </div>

                                <div style={{ display: "grid", gap: 10, minWidth: 180 }}>
                                    <button
                                        className="sf-filterBtn"
                                        type="button"
                                        onClick={() => approveNew(r.id)}
                                        disabled={actingKey === `new:${r.id}`}
                                    >
                                        {actingKey === `new:${r.id}` ? "Working…" : "Approve"}
                                    </button>
                                    <button
                                        className="sf-filterBtn"
                                        type="button"
                                        onClick={() => declineNew(r.id)}
                                        disabled={actingKey === `new:${r.id}`}
                                    >
                                        {actingKey === `new:${r.id}` ? "Working…" : "Decline"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="dashboard-panel" style={{ marginTop: 18 }}>
                <h2 style={{ marginBottom: 12 }}>Booking update requests</h2>

                {loadingChanges && <div style={{ opacity: 0.85 }}>Loading…</div>}

                {!loadingChanges && pendingChanges.length === 0 && (
                    <div style={{ opacity: 0.85 }}>No pending booking updates right now.</div>
                )}

                <div style={{ display: "grid", gap: 12 }}>
                    {pendingChanges.map((cr) => {
                        const r = cr.reservation;
                        return (
                            <div key={cr.id} className="dashboard-panel">
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>
                                            Request from {cr.requestedBy?.name || "Customer"}
                                        </div>

                                        <div style={{ opacity: 0.85, marginTop: 6 }}>
                                            Current: {fmt(r?.startsAt)} → {fmt(r?.endsAt)} · Party {r?.partySize ?? "—"}
                                        </div>

                                        <div style={{ opacity: 0.85, marginTop: 6 }}>
                                            Proposed: {fmt(cr.newStartsAt || r?.startsAt)} → {fmt(cr.newEndsAt || r?.endsAt)}
                                            {" · "}Party {cr.newPartySize ?? r?.partySize ?? "—"}
                                        </div>

                                        <div style={{ opacity: 0.85, marginTop: 6 }}>
                                            Notes: {(cr.newNotes ?? r?.notes) || "—"}
                                        </div>

                                        <div style={{ opacity: 0.85, marginTop: 6 }}>Status: {cr.status}</div>
                                    </div>

                                    <div style={{ display: "grid", gap: 10, minWidth: 180 }}>
                                        <button
                                            className="sf-filterBtn"
                                            type="button"
                                            onClick={() => approveChange(cr.id)}
                                            disabled={actingKey === `chg:${cr.id}`}
                                        >
                                            {actingKey === `chg:${cr.id}` ? "Working…" : "Approve update"}
                                        </button>
                                        <button
                                            className="sf-filterBtn"
                                            type="button"
                                            onClick={() => declineChange(cr.id)}
                                            disabled={actingKey === `chg:${cr.id}`}
                                        >
                                            {actingKey === `chg:${cr.id}` ? "Working…" : "Decline update"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}