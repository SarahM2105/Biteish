
import React from "react";

export default function ProfileAccessibility({ items = [] }) {
    return (
        <div className="profile-card">
            <h3>Accessibility</h3>

            <div className="chips">
                {items.map((a) => (
                    <span key={a.id} className="chip">
                        {a.option?.name}
                    </span>
                ))}
            </div>
        </div>
    );
}