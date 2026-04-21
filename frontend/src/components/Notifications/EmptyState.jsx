import React from "react";

export default function NotificationsEmptyState({
                                                    title,
                                                    text,
                                                    actions = [],
                                                }) {
    return (
        <section className="dashboard-panel notifications-empty">
            <h2>{title}</h2>
            <p>{text}</p>

            {actions.length > 0 && (
                <div className="notifications-empty__actions">
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            type="button"
                            className={`notifications-action notifications-action--${action.variant || "secondary"}`}
                            onClick={action.onClick}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </section>
    );
}