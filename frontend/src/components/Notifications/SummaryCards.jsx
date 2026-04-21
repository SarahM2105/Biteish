import React from "react";

export default function NotificationsSummaryCards({ cards = [] }) {
    return (
        <div className="notifications-summary">
            {cards.map((card) => (
                <div key={card.label} className="notifications-summary__card">
                    <span className="notifications-summary__value">{card.value}</span>
                    <span className="notifications-summary__label">{card.label}</span>
                </div>
            ))}
        </div>
    );
}