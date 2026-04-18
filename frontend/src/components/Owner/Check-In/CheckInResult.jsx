import React from "react";
import { useLocation } from "react-router-dom";

export default function CheckInResult() {
    const location = useLocation();
    const { status, message } = location.state || { status: "Error", message: "An unknown error occurred." };

    return (
        <div className="checkin-result-page">
            <h1>{status}</h1>
            <p>{message}</p>
            <a href="/owner/check-ins">Go back to Check-In</a>
        </div>
    );
}