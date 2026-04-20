import React from "react";

export default function EmptyState({ title, text }) {
    return (
        <div className="owner-bookings-empty">
            <div className="owner-bookings-empty__title">{title}</div>
            <div className="owner-bookings-empty__text">{text}</div>
        </div>
    );
}