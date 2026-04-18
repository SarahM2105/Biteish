import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

export default function QrScanner({ type }) {
    const [enabled, setEnabled] = useState(false);
    const [status, setStatus] = useState("");
    const [token, setToken] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    function handleScan(codes) {
        if (!codes || !codes.length) return;

        const scannedValue = codes[0]?.rawValue;
        if (!scannedValue) return;

        let extractedToken = scannedValue;

        try {
            const parsed = JSON.parse(scannedValue);
            if (parsed?.token) {
                extractedToken = parsed.token;
            }
        } catch {}

        setToken(extractedToken);
        setResult(null);
        setStatus(
            type === "checkin"
                ? "QR scanned successfully. Continue to check in."
                : "QR scanned successfully. Continue to check out."
        );
        setEnabled(false);
    }

    async function handleSubmit() {
        if (!token.trim()) {
            setStatus("No token scanned yet.");
            return;
        }

        try {
            setSubmitting(true);
            setStatus("");
            setResult(null);

            const authToken = localStorage.getItem("token");
            const endpoint =
                type === "checkin" ? "/api/owner/check-in" : "/api/owner/check-out";

            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
                },
                body: JSON.stringify({
                    qrToken: token,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || `${type === "checkin" ? "Check in" : "Check out"} failed`);
                return;
            }

            setResult(data);
            setStatus(
                type === "checkin"
                    ? "Customer checked in successfully."
                    : "Customer checked out successfully."
            );
            setToken("");
        } catch (error) {
            console.error(error);
            setStatus("Server error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="checkin-section">
            <label>{type === "checkin" ? "Scan guest QR code" : "Scan checkout QR code"}</label>

            <button
                type="button"
                className="sf-filterBtn"
                onClick={() => {
                    setStatus("");
                    setEnabled((prev) => !prev);
                }}
            >
                {enabled ? "Stop camera" : "Start camera scanner"}
            </button>

            {enabled && (
                <div className="checkin-scanner-shell">
                    <Scanner
                        onScan={handleScan}
                        onError={(error) => {
                            console.error(error);
                            setStatus("Camera access was blocked or dismissed.");
                            setEnabled(false);
                        }}
                        constraints={{ facingMode: "environment" }}
                    />
                </div>
            )}

            {token ? (
                <div className="checkin-status">
                    <strong>Scanned token:</strong> {token}
                </div>
            ) : null}

            {status ? <div className="checkin-status">{status}</div> : null}

            {token ? (
                <button
                    type="button"
                    className="sf-filterBtn"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting
                        ? type === "checkin"
                            ? "Checking In..."
                            : "Checking Out..."
                        : type === "checkin"
                            ? "Check In"
                            : "Check Out"}
                </button>
            ) : null}

            {result ? (
                <div className="checkin-result">
                    <h4>{type === "checkin" ? "Check In Successful" : "Check Out Successful"}</h4>
                    <div>
                        Customer: {result.customer?.name || result.walkInGuest?.name || "Customer"}
                    </div>
                    <div>Table: {result.table?.name || "Table"}</div>
                    {type === "checkin" ? (
                        <div>
                            Booking time:{" "}
                            {result.reservation?.startsAt
                                ? new Date(result.reservation.startsAt).toLocaleString("en-GB")
                                : "-"}
                        </div>
                    ) : (
                        <div>
                            Checked out at:{" "}
                            {result.checkedOutAt
                                ? new Date(result.checkedOutAt).toLocaleString("en-GB")
                                : "-"}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}