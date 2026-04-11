import React from "react";

export default function ProfileMenu({ openView }) {
    return (
        <section className="customer-profile__hub">
            <button
                type="button"
                className="dashboard-panel customer-profile__hubCard"
                onClick={() => openView("personal")}
            >
                <div className="customer-profile__hubIcon">🪪</div>
                <div className="customer-profile__hubText">
                    <p className="customer-profile__sectionLabel">Card 1</p>
                    <h3>Personal Information</h3>
                    <p>View and update your name and email details.</p>
                </div>
                <span className="customer-profile__hubArrow">➡️</span>
            </button>

            <button
                type="button"
                className="dashboard-panel customer-profile__hubCard"
                onClick={() => openView("security")}
            >
                <div className="customer-profile__hubIcon">🔏</div>
                <div className="customer-profile__hubText">
                    <p className="customer-profile__sectionLabel">Card 2</p>
                    <h3>Security</h3>
                    <p>Change your password in a more focused, private view.</p>
                </div>
                <span className="customer-profile__hubArrow">➡️</span>
            </button>

            <button
                type="button"
                className="dashboard-panel customer-profile__hubCard"
                onClick={() => openView("actions")}
            >
                <div className="customer-profile__hubIcon">⚙️</div>
                <div className="customer-profile__hubText">
                    <p className="customer-profile__sectionLabel">Card 3</p>
                    <h3>Account Actions</h3>
                    <p>Access logout, account deletion placeholder, and issue reporting.</p>
                </div>
                <span className="customer-profile__hubArrow">➡️</span>
            </button>
        </section>
    );
}