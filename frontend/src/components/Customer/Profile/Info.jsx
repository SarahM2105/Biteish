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
        <section className="dashboard-panel customer-profile__detailCard">
            <div className="customer-profile__detailHeader">
                <button
                    type="button"
                    className="customer-profile__backButton"
                    onClick={() => setCurrentView("menu")}
                >
                    ⬅️ Back
                </button>

                <div>
                    <p className="customer-profile__sectionLabel">Card 1</p>
                    <h3>Personal Information</h3>
                    <p className="customer-profile__sectionText">
                        Keep your main account details up to date.
                    </p>
                </div>
            </div>

            <div className="customer-profile__panelBox">
                <form className="customer-profile__form" onSubmit={handleSaveProfile}>
                    <label className="customer-profile__field">
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

                    <label className="customer-profile__field">
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

                    <label className="customer-profile__field">
                        <span>Role</span>
                        <input type="text" value={me.role} disabled />
                    </label>

                    {profileStatus ? (
                        <p className="customer-profile__status">{profileStatus}</p>
                    ) : null}

                    {!isEditingProfile ? (
                        <div className="customer-profile__actionsRow">
                            <button
                                type="button"
                                className="customer-profile__button customer-profile__button--primary"
                                onClick={() => {
                                    setIsEditingProfile(true);
                                }}
                            >
                                Edit Information
                            </button>
                        </div>
                    ) : (
                        <div className="customer-profile__actionsRow">
                            <button
                                type="button"
                                className="customer-profile__button customer-profile__button--ghost"
                                onClick={handleCancelEdit}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="customer-profile__button customer-profile__button--primary"
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