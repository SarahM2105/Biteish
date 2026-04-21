import React from "react";

export default function ProfileSecurity({
                                            passwordForm,
                                            passwordStatus,
                                            setCurrentView,
                                            handlePasswordChange,
                                            handleUpdatePassword,
                                        }) {
    return (
        <section className="dashboard-panel profile__detail-card">
            <div className="profile__detail-header">
                <button
                    type="button"
                    className="profile__back-button"
                    onClick={() => setCurrentView("menu")}
                >
                    ← Back
                </button>

                <div>
                    <p className="profile__section-label">Card 2</p>
                    <h3>Security</h3>
                    <p className="profile__section-text">
                        Change your password in a dedicated section.
                    </p>
                </div>
            </div>

            <div className="profile__panel-box profile__panel-box--narrow">
                <form className="profile__form" onSubmit={handleUpdatePassword}>
                    <label className="profile__field">
                        <span>Current Password</span>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter current password"
                        />
                    </label>

                    <label className="profile__field">
                        <span>New Password</span>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password"
                        />
                    </label>

                    <label className="profile__field">
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
                        <p className="profile__status">{passwordStatus}</p>
                    ) : null}

                    <div className="profile__actions-row">
                        <button
                            type="submit"
                            className="profile__button profile__button--primary"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}