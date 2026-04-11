import React from "react";

export default function ProfileHeader({ avatarLetter, name, email, role }) {
    return (
        <section className="customer-profile__hero">
            <div className="customer-profile__avatar">{avatarLetter}</div>

            <div className="customer-profile__heroText">
                <p className="customer-profile__eyebrow">Customer account</p>
                <h2>{name}</h2>
                <p>{email}</p>
            </div>

            <div className="customer-profile__badgeWrap">
                <span className="customer-profile__badge">{role}</span>
            </div>
        </section>
    );
}