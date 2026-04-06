import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../layouts/AppLayout";
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
    const [qrImage, setQrImage] = useState("");
    const [qrExpiresAt, setQrExpiresAt] = useState("");
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrToken, setQrToken] = useState("");

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

    async function handleShowQr(reservationId){
        setStatus("");
        try{
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/customer/reservations/${reservationId}/qr`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });
            const data = await res.json().catch(() => ({}));
            console.log("qr response", data );
            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to load qr code");
                return;
            }
            setQrImage(data.qrImage || "");
            setQrExpiresAt(data.expiresAt || "");
            setQrToken(data.qrToken||"");
            setShowQrModal(true);
        } catch (error){
            console.error(error);
            setStatus("Network/server error loading qr code");
        }
    }

    function handleCloseQrModal() {
        setShowQrModal(false);
        setQrImage("");
        setQrExpiresAt("");
        setQrToken("");
    }


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

            setBookings((prev) =>
                prev.map((b) => (b.id === reservationId ? { ...b, status: "CANCELLED" } : b))
            );
        } catch (e) {
            console.error(e);
            setStatus("Network/server error");
        }
    }

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
        <AppLayout name={name} sideNav={<CustomerSideNav active={active} onNavigate={handleNavigate}/>}>
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

                                    {b.status === "CONFIRMED" && (
                                        <button
                                            type="button"
                                            className="sf-filterBtn"
                                            onClick={() => handleShowQr(b.id)}>
                                            View QR
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
            {showQrModal && qrImage && (
                <div
                    style={{
                        position:"fixed",
                        inset:0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                    onClick={handleCloseQrModal}
                    >
                    <div
                        className="dashboard-panel"
                        style={{
                            width: "min(92vw, 420px)",
                            padding: 24,
                            position: "relative",
                        }}
                        onClick={(e)=> e.stopPropagation()}>
                    <button
                        type="button"
                        className="sf-filterBtn"
                        onClick={handleCloseQrModal}
                        style={{position:"absolute", top: 12, right: 12}}
                        >
                        close
                    </button>
                    <h3> Your Qr Code</h3>
                    <div style={{display: "flex", justifyContent: "center"}}>
                        <img
                            src={qrImage}
                            alt="Reservation QR Code"
                            style={{ maxWidth: 250, width: "100%" }} />
                    </div>
                        {qrToken && (
                            <div style={{marginTop:16, textAlign: "center"}}>
                            <div style={{fontWeight: 600, marginBottom: 10}}>Booking Code</div>
                            <div
                            style={{
                            wordBreak: "break-all",
                            background: "#f5f5f5",
                            padding: "10px 12px",
                            borderRadius: 8,
                            fontFamily: "monospace",
                            fontSize: 12,
                        }}
                    >
                        {qrToken}
                    </div>
                    <button
                        type="button"
                        className="sf-filterBtn"
                        style={{marginTop: 10}}
                        onClick={()=> navigator.clipboard.writeText(qrToken)}>
                        Copy code
                    </button>
                </div>
                        )}

            {qrExpiresAt && (
                <div style={{ opacity:0.8, marginTop: 16, textAlign: "center" }}>
                    Expires: {new Date(qrExpiresAt).toLocaleString("en-GB")}
                </div>
                )}
                </div>
                </div>
                )}
        </AppLayout>
    );
}