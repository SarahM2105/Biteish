import React from "react";

export default function BookingTabs({
                                        tab,
                                        setTab,
                                        upcomingCount,
                                        pendingCount,
                                        pastCount,
                                    }) {
    const tabs = [
        { key: "UPCOMING", label: "Upcoming", count: upcomingCount },
        { key: "PENDING", label: "Pending", count: pendingCount },
        { key: "PAST", label: "Past", count: pastCount },
    ];

    return (
        <div className="bookings-tabs">
            {tabs.map((item) => (
                <button
                    key={item.key}
                    className={`bookings-tabs__button ${tab === item.key ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setTab(item.key)}
                >
                    <span>{item.label}</span>
                    <span className="bookings-tabs__count">{item.count}</span>
                </button>
            ))}
        </div>
    );
}