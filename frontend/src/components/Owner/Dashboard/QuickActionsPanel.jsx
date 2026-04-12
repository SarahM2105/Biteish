import React from "react";

export default function QuickActionsPanel({ quickActions, onNavigate }) {
    return (
        <section className="dashboard-panel owner-panel">
            <p className="owner-panel-kicker">Quick actions</p>
            <h3>Open a section</h3>

            <div className="owner-actions">
                {quickActions.map((action) => (
                    <button
                        key={action.title}
                        type="button"
                        className="owner-action-card"
                        onClick={() => onNavigate(action.route)}
                    >
                        <strong>{action.title}</strong>
                        <span>{action.description}</span>
                    </button>
                ))}
            </div>
        </section>
    );
}