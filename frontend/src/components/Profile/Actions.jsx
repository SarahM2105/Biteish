import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/logout";

export default function ProfileActions({
                                           issueOpen,
                                           issueForm,
                                           issueStatus,
                                           actionStatus,
                                           setCurrentView,
                                           setIssueOpen,
                                           setIssueStatus,
                                           setActionStatus,
                                           handleIssueChange,
                                           handleSubmitIssue,
                                       }) {
    const navigate = useNavigate();

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
                    <p className="profile__section-label">Card 3</p>
                    <h3>Account Actions</h3>
                    <p className="profile__section-text">
                        Manage support actions and future account controls.
                    </p>
                </div>
            </div>

            <div className="profile__panel-box">
                <div className="profile__action-stack">
                    <div className="profile__action-item">
                        <div>
                            <h4>Logout</h4>
                            <p>Sign out of your account on this device.</p>
                        </div>
                        <button
                            type="button"
                            className="profile__button profile__button--secondary"
                            onClick={() => logout(navigate)}
                        >
                            Logout
                        </button>
                    </div>

                    <div className="profile__action-item">
                        <div>
                            <h4>Delete Account</h4>
                            <p>This is currently a placeholder for future account removal handling.</p>
                        </div>
                        <button
                            type="button"
                            className="profile__button profile__button--danger"
                            onClick={() => setActionStatus("Account deletion is not available yet.")}
                        >
                            Delete Account
                        </button>
                    </div>

                    <div className="profile__action-item profile__action-item--column">
                        <div className="profile__action-top">
                            <div>
                                <h4>Report an Issue</h4>
                                <p>This feature is not available yet.</p>
                            </div>

                            <button
                                type="button"
                                className="profile__button profile__button--secondary"
                                onClick={() => {
                                    setIssueOpen((prev) => !prev);
                                    setIssueStatus("");
                                }}
                            >
                                {issueOpen ? "Close" : "Report"}
                            </button>
                        </div>

                        {issueOpen ? (
                            <form className="profile__issue-form" onSubmit={handleSubmitIssue}>
                                <label className="profile__field">
                                    <span>Issue Type</span>
                                    <select
                                        name="issueType"
                                        value={issueForm.issueType}
                                        onChange={handleIssueChange}
                                    >
                                        <option value="Bug">Bug</option>
                                        <option value="Booking issue">Booking issue</option>
                                        <option value="Account issue">Account issue</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </label>

                                <label className="profile__field">
                                    <span>Description</span>
                                    <textarea
                                        name="description"
                                        value={issueForm.description}
                                        onChange={handleIssueChange}
                                        rows="5"
                                        placeholder="Describe the issue you experienced"
                                    />
                                </label>

                                <div className="profile__actions-row">
                                    <button
                                        type="submit"
                                        className="profile__button profile__button--primary"
                                    >
                                        Submit Report
                                    </button>
                                </div>
                            </form>
                        ) : null}

                        {issueStatus ? (
                            <p className="profile__status">{issueStatus}</p>
                        ) : null}
                    </div>

                    {actionStatus ? (
                        <p className="profile__status">{actionStatus}</p>
                    ) : null}
                </div>
            </div>
        </section>
    );
}