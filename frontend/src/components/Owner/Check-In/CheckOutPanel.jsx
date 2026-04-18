import React from "react";
import ManualCheckOut from "./ManualCheckOut";

export default function CheckOutPanel() {
    return (
        <div className="checkin-panel">
            <div className="checkin-panel__header">
                <h2>Check Out</h2>
                <p>Choose an occupied table to complete the guest visit.</p>
            </div>

            <ManualCheckOut />
        </div>
    );
}