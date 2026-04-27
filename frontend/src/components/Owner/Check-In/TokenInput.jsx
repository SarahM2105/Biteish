import React, { useState } from "react";
import { authFetch } from "../../utils/authFetch";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

export default function TokenInput({ type }) {
    const [token, setToken] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setStatus("");

        if (!token.trim()) {
            setStatus("Please enter a token.");
            return;
        }

        if (type !== "checkin") {
            setStatus("Token check-out is not supported.");
            return;
        }

        try {
            setLoading(true);

            const res = await authFetch("/api/owner/check-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    qrToken: token.trim(),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(getApiErrorMessage(data, "Check-in failed."));
                return;
            }

            setStatus(
                `Checked in ${data.customer?.name || "customer"} at ${data.table?.name || "table"}`
            );
            setToken("");
        } catch (error) {
            console.error(error);
            setStatus("Network error. Try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="checkin-section" onSubmit={handleSubmit}>
            <label>Paste or type QR token</label>

            <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="QR Code Token"
            />

            <button type="submit" className="sf-filterBtn" disabled={loading}>
                {loading ? "Checking in..." : "Check In"}
            </button>

            {status ? <div className="checkin-status">{status}</div> : null}
        </form>
    );
}