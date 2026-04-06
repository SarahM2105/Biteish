import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";

export default function CustomerBookingForm() {
    const name = localStorage.getItem("name") || "customer";
    const { tableId } = useParams();
    const [active] = useState("Search and Filter");

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [partySize, setPartySize] = useState(2);
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const startsAtISO = useMemo(() => {
        if (!date || !time) return "";
        return new Date(`${date}T${time}:00`).toISOString();
    }, [date, time]);

    const endsAtISO = useMemo(() => {
        if (!startsAtISO) return "";
        const start = new Date(startsAtISO);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        return end.toISOString();
    }, [startsAtISO]);

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus("");

        if (!tableId) return setStatus("missing table id in url");
        if (!date || !time) return setStatus("Please choose a date and time");
        if (!partySize || Number(partySize) < 1) return setStatus("Party size must be >= 1");

        setSubmitting(true);

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`/api/customer/tables/${tableId}/book`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    startsAt: startsAtISO,
                    endsAt: endsAtISO,
                    partySize: Number(partySize),
                    notes: notes || "",
                }),
            });

            const text = await res.text();
            let data = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                data = {};
            }

            if (!res.ok) {
                setStatus(data?.error || data?.message || "booking failed");
                return;
            }

            setStatus("booking created");
        } catch (error) {
            console.log(error);
            setStatus("Network/server error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AppLayout name={name} sideNav={<CustomerSideNav active={active} />}>
            <h1 className="page-title">Restaurant name</h1>

            <form onSubmit={handleSubmit} className="dashboard-panel">
                <div style={{ display: "grid", maxWidth: 400, gap: 14 }}>
                    <label>
                        date
                        <input
                            className="sf-input"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Time
                        <input
                            className="sf-input"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Party size
                        <input
                            className="sf-input"
                            type="number"
                            min="1"
                            value={partySize}
                            onChange={(e) => setPartySize(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Notes
                        <textarea
                            className="sf-input"
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="optional"
                        />
                    </label>

                    <button className="sf-filterBtn" type="submit" disabled={submitting}>
                        {submitting ? "Submitting...." : "submit booking"}
                    </button>

                    {status && <div style={{ opacity: 0.85 }}>{status}</div>}
                </div>
            </form>
        </AppLayout>
    );
}
