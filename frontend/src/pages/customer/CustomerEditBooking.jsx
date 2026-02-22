import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import CustomerSideNav from "../../components/CustomerSideNav";

export default function CustomerEditBooking() {
    const name = localStorage.getItem("name") || "customer";
    const { reservationId } = useParams();

    const [active, setActive] = useState("My Bookings");

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [durationMins, setDurationMins] = useState(120);
    const [partySize, setPartySize] = useState(2);
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function loadReservation() {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch("/api/customer/reservations", {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                const data = await res.json();

                const booking = data.find(r => r.id === reservationId);
                if (!booking) {
                    setStatus("Booking not found");
                    setLoading(false);
                    return;
                }

                const start = new Date(booking.startsAt);
                const end = new Date(booking.endsAt);

                setDate(start.toISOString().slice(0, 10));
                setTime(start.toISOString().slice(11, 16));
                setDurationMins((end - start) / 60000);
                setPartySize(booking.partySize);
                setNotes(booking.notes || "");
            } catch (err) {
                console.error(err);
                setStatus("Failed to load booking");
            } finally {
                setLoading(false);
            }
        }

        loadReservation();
    }, [reservationId]);

    const startsAtISO = useMemo(() => {
        if (!date || !time) return "";
        return new Date(`${date}T${time}:00`).toISOString();
    }, [date, time]);

    const endsAtISO = useMemo(() => {
        if (!startsAtISO) return "";
        const end = new Date(new Date(startsAtISO).getTime() + durationMins * 60000);
        return end.toISOString();
    }, [startsAtISO, durationMins]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setStatus("");

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`/api/customer/reservations/${reservationId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    startsAt: startsAtISO,
                    endsAt: endsAtISO,
                    partySize,
                    notes,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus(data.error || "Update failed");
                return;
            }

            setStatus(" Change request submitted for approval");
        } catch (err) {
            console.error(err);
            setStatus("Server error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <DashboardLayout
            name={name}
            sideNav={<CustomerSideNav active={active} onNavigate={setActive} />}
        >
            <h1 className="page-title">Request booking change</h1>

            {loading ? (
                <div className="dashboard-panel">Loading…</div>
            ) : (
                <form onSubmit={handleSubmit} className="dashboard-panel">
                    <div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
                        <label>
                            Date
                            <input
                                className="sf-input"
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                            />
                        </label>

                        <label>
                            Time
                            <input
                                className="sf-input"
                                type="time"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                            />
                        </label>

                        <label>
                            Duration (minutes)
                            <input
                                className="sf-input"
                                type="number"
                                min="15"
                                step="15"
                                value={durationMins}
                                onChange={e => setDurationMins(Number(e.target.value))}
                            />
                        </label>

                        <label>
                            Party size
                            <input
                                className="sf-input"
                                type="number"
                                min="1"
                                value={partySize}
                                onChange={e => setPartySize(Number(e.target.value))}
                            />
                        </label>

                        <label>
                            Notes
                            <textarea
                                className="sf-input"
                                rows={3}
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </label>

                        <button className="sf-filterBtn" type="submit" disabled={submitting}>
                            {submitting ? "Submitting…" : "Submit change request"}
                        </button>

                        {status && <div>{status}</div>}
                    </div>
                </form>
            )}
        </DashboardLayout>
    );
}
