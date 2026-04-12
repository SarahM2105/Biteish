import React from "react";

function formatTime(value) {
    return new Date(value).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ExpectedCustomersPanel({ expectedGuests }) {
    return (
        <section className="dashboard-panel owner-panel">
            <p className="owner-panel-kicker">Expected customers</p>
            <h3>Who is expected today</h3>

            {expectedGuests.length === 0 ? (
                <p className="owner-empty-state">
                    No customers are expected right now.
                </p>
            ) : (
                <div className="owner-expected-list">
                    {expectedGuests.map((guest) => {
                        const metaText = guest.checkedInAt
                            ? `Checked in at ${formatTime(guest.checkedInAt)}`
                            : `Expected at ${formatTime(guest.startsAt)}`;

                        const badgeText = guest.checkedInAt
                            ? "Checked in"
                            : guest.status === "PENDING"
                                ? "Pending"
                                : "Confirmed";

                        return (
                            <article
                                key={guest.id}
                                className="owner-expected-card"
                            >
                                <div className="owner-expected-card__main">
                                    <strong>{guest.customerName}</strong>
                                    <p>
                                        Party of {guest.partySize}
                                        {guest.tableName ? ` · ${guest.tableName}` : ""}
                                    </p>
                                </div>

                                <div className="owner-expected-card__side">
                                    <span className="owner-expected-card__time">
                                        {metaText}
                                    </span>
                                    <span className="owner-expected-card__badge">
                                        {badgeText}
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}