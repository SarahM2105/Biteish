import React from "react";

export default function ProfileInfo({
                                        me,
                                        profileForm,
                                        isEditingProfile,
                                        profileStatus,
                                        setIsEditingProfile,
                                        setCurrentView,
                                        handleProfileChange,
                                        handleCancelEdit,
                                        handleSaveProfile,
                                    }) {
    return (
        <section className="dashboard-panel profile__detail-card">
            <div className="profile__detail-header">
                <button
                    type="button"
                    className="profile__back-button"
                    onClick={() => setCurrentView("menu")}
                >
                    ⬅️ Back
                </button>

                <div>
                    <p className="profile__section-label">Card 1</p>
                    <h3>Personal Information</h3>
                    <p className="profile__section-text">
                        Keep your main account details up to date.
                    </p>
                </div>
            </div>

            <div className="profile__panel-box">
                <form className="profile__form" onSubmit={handleSaveProfile}>
                    <label className="profile__field">
                        <span>Full Name</span>
                        <input
                            type="text"
                            name="name"
                            value={profileForm.name}
                            onChange={handleProfileChange}
                            disabled={!isEditingProfile}
                            placeholder="Enter your full name"
                        />
                    </label>

                    <label className="profile__field">
                        <span>Email Address</span>
                        <input
                            type="email"
                            name="email"
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            disabled={!isEditingProfile}
                            placeholder="Enter your email"
                        />
                    </label>

                    <label className="profile__field">
                        <span>Role</span>
                        <input type="text" value={me.role} disabled />
                    </label>

                    {profileStatus ? (
                        <p className="profile__status">{profileStatus}</p>
                    ) : null}

                    {!isEditingProfile ? (
                        <div className="profile__actions-row">
                            <button
                                type="button"
                                className="profile__button profile__button--primary"
                                onClick={() => {
                                    setIsEditingProfile(true);
                                }}
                            >
                                Edit Information
                            </button>
                        </div>
                    ) : (
                        <div className="profile__actions-row">
                            <button
                                type="button"
                                className="profile__button profile__button--ghost"
                                onClick={handleCancelEdit}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="profile__button profile__button--primary"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </section>
    );
}