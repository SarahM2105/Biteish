import React from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/logout";

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
                    <p className="customer-profile__sectionLabel">Card 3</p>
                    <h3>Account Actions</h3>
                    <p className="customer-profile__sectionText">
                        Manage support actions and future account controls.
                    </p>
                </div>
            </div>

            <div className="customer-profile__panelBox">
                <div className="customer-profile__actionStack">
                    <div className="customer-profile__actionItem">
                        <div>
                            <h4>Logout</h4>
                            <p>Sign out of your customer account on this device.</p>
                        </div>
                        <button
                            type="button"
                            className="customer-profile__button customer-profile__button--secondary"
                            onClick={() => logout(navigate)}
                        >
                            Logout
                        </button>
                    </div>

                    <div className="customer-profile__actionItem">
                        <div>
                            <h4>Delete Account</h4>
                            <p>This is currently a placeholder for future account removal handling.</p>
                        </div>
                        <button
                            type="button"
                            className="customer-profile__button customer-profile__button--danger"
                            onClick={() => setActionStatus("Account deletion is not available yet.")}
                        >
                            Delete Account
                        </button>
                    </div>

                    <div className="customer-profile__actionItem customer-profile__actionItem--column">
                        <div className="customer-profile__actionTop">
                            <div>
                                <h4>Report an Issue</h4>
                                <p>This feature is not available yet.</p>
                            </div>

                            <button
                                type="button"
                                className="customer-profile__button customer-profile__button--secondary"
                                onClick={() => {
                                    setIssueOpen((prev) => !prev);
                                    setIssueStatus("");
                                }}
                            >
                                {issueOpen ? "Close" : "Report"}
                            </button>
                        </div>

                        {issueOpen ? (
                            <form className="customer-profile__issueForm" onSubmit={handleSubmitIssue}>
                                <label className="customer-profile__field">
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

                                <label className="customer-profile__field">
                                    <span>Description</span>
                                    <textarea
                                        name="description"
                                        value={issueForm.description}
                                        onChange={handleIssueChange}
                                        rows="5"
                                        placeholder="Describe the issue you experienced"
                                    />
                                </label>

                                <div className="customer-profile__actionsRow">
                                    <button
                                        type="submit"
                                        className="customer-profile__button customer-profile__button--primary"
                                    >
                                        Submit Report
                                    </button>
                                </div>
                            </form>
                        ) : null}

                        {issueStatus ? (
                            <p className="customer-profile__status">{issueStatus}</p>
                        ) : null}
                    </div>

                    {actionStatus ? (
                        <p className="customer-profile__status">{actionStatus}</p>
                    ) : null}
                </div>
            </div>
        </section>
    );
}