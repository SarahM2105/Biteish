import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import { authFetch } from "../../components/utils/authFetch";
import { getApiErrorMessage } from "../../components/utils/getApiErrorMessage";

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

        if (!tableId) {
            setStatus("Missing table id in URL.");
            return;
        }

        if (!date || !time) {
            setStatus("Please choose a date and time.");
            return;
        }

        if (!partySize || Number(partySize) < 1) {
            setStatus("Party size must be at least 1.");
            return;
        }

        setSubmitting(true);

        try {
            const res = await authFetch(`/api/customer/tables/${tableId}/book`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    startsAt: startsAtISO,
                    endsAt: endsAtISO,
                    partySize: Number(partySize),
                    notes: notes || "",
                }),
            });

            const text = await res.text();
            const data = text ? JSON.parse(text) : {};

            if (!res.ok) {
                setStatus(getApiErrorMessage(data, "Booking failed."));
                return;
            }

            setStatus("Booking created.");
        } catch (error) {
            console.log(error);
            setStatus("Network/server error.");
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
                        Date
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
                            placeholder="Optional"
                        />
                    </label>

                    <button className="sf-filterBtn" type="submit" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit booking"}
                    </button>

                    {status && <div style={{ opacity: 0.85 }}>{status}</div>}
                </div>
            </form>
        </AppLayout>
    );
}