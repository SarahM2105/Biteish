import React from "react";
import { Link } from "react-router-dom";

export default function NotAuthorised() {
    return (
        <div style={{ padding: 40 }}>
            <h1>Not authorised</h1>
            <p>You don’t have access to this page with your current account.</p>
            <Link to="/">Go back to login</Link>
        </div>
    );
}
