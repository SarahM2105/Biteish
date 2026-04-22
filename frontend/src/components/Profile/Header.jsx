import React from "react";

function formatRoleLabel(role) {
    if (!role) return "User";
    return String(role).charAt(0).toUpperCase() + String(role).slice(1).toLowerCase();
}

export default function ProfileHeader({ avatarLetter, name, email, role }) {
    return (
        <section className="profile__header">
            <div className="profile__avatar">{avatarLetter}</div>

            <div className="profile__header-text">
                <p className="profile__eyebrow">{formatRoleLabel(role)} account</p>
                <h2>{name}</h2>
                <p>{email}</p>
            </div>

            <div className="profile__badge-wrap">
                <span className="profile__badge">{role}</span>
            </div>
        </section>
    );
}