import React from "react";

export default function ProfileMenu({ openView }) {
    return (
        <section className="profile__hub">
            <button
                type="button"
                className="dashboard-panel profile__hub-card"
                onClick={() => openView("personal")}
            >
                <div className="profile__hub-icon">🪪</div>
                <div className="profile__hub-text">
                    <p className="profile__section-label">Card 1</p>
                    <h3>Personal Information</h3>
                    <p>View and update your name and email details.</p>
                </div>
                <span className="profile__hub-arrow">➡️</span>
            </button>

            <button
                type="button"
                className="dashboard-panel profile__hub-card"
                onClick={() => openView("security")}
            >
                <div className="profile__hub-icon">🔏</div>
                <div className="profile__hub-text">
                    <p className="profile__section-label">Card 2</p>
                    <h3>Security</h3>
                    <p>Change your password in a more focused, private view.</p>
                </div>
                <span className="profile__hub-arrow">➡️</span>
            </button>

            <button
                type="button"
                className="dashboard-panel profile__hub-card"
                onClick={() => openView("actions")}
            >
                <div className="profile__hub-icon">⚙️</div>
                <div className="profile__hub-text">
                    <p className="profile__section-label">Card 3</p>
                    <h3>Account Actions</h3>
                    <p>Access logout, account deletion placeholder, and issue reporting.</p>
                </div>
                <span className="profile__hub-arrow">➡️</span>
            </button>
        </section>
    );
}