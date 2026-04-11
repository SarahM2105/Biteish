import React from "react";

export default function ProfileSecurity({
                                            passwordForm,
                                            passwordStatus,
                                            setCurrentView,
                                            handlePasswordChange,
                                            handleUpdatePassword,
                                        }) {
    return (
        <section className="dashboard-panel customer-profile__detailCard">
            <div className="customer-profile__detailHeader">
                <button
                    type="button"
                    className="customer-profile__backButton"
                    onClick={() => setCurrentView("menu")}
                >
                    ← Back
                </button>

                <div>
                    <p className="customer-profile__sectionLabel">Card 2</p>
                    <h3>Security</h3>
                    <p className="customer-profile__sectionText">
                        Change your password in a dedicated section.
                    </p>
                </div>
            </div>

            <div className="customer-profile__panelBox customer-profile__panelBox--narrow">
                <form className="customer-profile__form" onSubmit={handleUpdatePassword}>
                    <label className="customer-profile__field">
                        <span>Current Password</span>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter current password"
                        />
                    </label>

                    <label className="customer-profile__field">
                        <span>New Password</span>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password"
                        />
                    </label>

                    <label className="customer-profile__field">
                        <span>Confirm New Password</span>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Confirm new password"
                        />
                    </label>

                    {passwordStatus ? (
                        <p className="customer-profile__status">{passwordStatus}</p>
                    ) : null}

                    <div className="customer-profile__actionsRow">
                        <button
                            type="submit"
                            className="customer-profile__button customer-profile__button--primary"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}