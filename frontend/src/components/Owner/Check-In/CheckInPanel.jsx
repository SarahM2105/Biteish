import React, { useState } from "react";
import ManualCheckIn from "./ManualCheckIn";
import QrScanner from "./QrScanner";
import TokenInput from "./TokenInput";

export default function CheckInPanel() {
    const [method, setMethod] = useState("");
    const [status, setStatus] = useState("");

    const clearStatus = () => {
        setTimeout(() => {
            setStatus("");
        }, 3000);
    };

    return (
        <section className="checkin-card">
            <div className="checkin-card__header">
                <h3>Check In</h3>
                <p>Choose how you want to check a guest in.</p>
            </div>

            <div className="checkin-method-list">
                <button
                    type="button"
                    className={`checkin-method-button ${method === "qr" ? "is-active" : ""}`}
                    onClick={() => setMethod("qr")}
                >
                    QR Camera
                </button>

                <button
                    type="button"
                    className={`checkin-method-button ${method === "token" ? "is-active" : ""}`}
                    onClick={() => setMethod("token")}
                >
                    Token
                </button>

                <button
                    type="button"
                    className={`checkin-method-button ${method === "manual" ? "is-active" : ""}`}
                    onClick={() => setMethod("manual")}
                >
                    Manual Table
                </button>
            </div>

            {method === "qr" && (
                <QrScanner
                    type="checkin"
                    setStatus={setStatus}
                    clearStatus={clearStatus}
                />
            )}

            {method === "token" && (
                <TokenInput
                    type="checkin"
                    setStatus={setStatus}
                    clearStatus={clearStatus}
                />
            )}

            {method === "manual" && (
                <ManualCheckIn
                    setStatus={setStatus}
                    clearStatus={clearStatus}
                />
            )}

            {status && <div className="checkin-status">{status}</div>}
        </section>
    );
}