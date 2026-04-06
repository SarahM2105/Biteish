import React, {useState, useEffect } from 'react';
import AppLayout from '../../layouts/AppLayout';
import OwnerSideNav from "../../components/OwnerSideNav";

export default function OwnerProfilePreference() {
    const [loading, setLoading] = useState(true);
    const[saving, setSaving] = useState(false);
    const [status, setStatus] = useState("");
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        role: "OWNER",
    });
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        bookingAlerts: true,
        changeRequestAlerts: true,
        dashboardTips: true,
        compactDashboard: false
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    useEffect(() => {
        async function loadProfilePreferences() {
            setLoading(true);
            setStatus("");
            try {
                const storedName = localStorage.getItem("name") || "owner";
                const storedRole = localStorage.getItem("role") || "OWNER";
                const storedEmail = localStorage.getItem("email") || "";
                setProfile({
                    name: storedName,
                    email: storedEmail,
                    role: storedRole,
                });
            } catch (error) {
                console.log(error);
                setStatus("Failed to load profile preferences");
            } finally {
                setLoading(false);
            }
        }

        loadProfilePreferences();

    }, []);
    function handleProfileChange(e) {
        const { name, value } = e.target;
        setProfile((prev)=> ({
            ...prev,
            [name]: value,
        }));
    }
    function handlePreferenceToggle(field){
        setPreferences((prev)=> ({
            ...prev,
            [field]: !prev[field],
        }));
    }
    function handlePasswordChange(e) {
        const { name, value } = e.target;
        setPasswordForm((prev)=>({
            ...prev,
            [name]: value,
        }));
    }
    function handlePlaceholderSave(){
        setSaving(true);
        setStatus("");
        setTimeout(() => {
            localStorage.setItem("name", profile.name);
            setSaving(false);
            setStatus("Profile and preference changes saved locally for now");
        }, 300);
    }
    return (
        <AppLayout
            name={profile.name|| "owner"}
            sideNav={<OwnerSideNav active="Profile Preference"/>}
            >
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ marginBottom: 8 }}>Profile and Preferences</h1>
                <p style={{ marginBottom: 8 }}>
                    Manage your owner account details and profile preferences.
                </p>
            </div>
            {loading && <div className="dashboard-panel">Loading profile preferences...</div>}
            {status && <div className="dashboard-panel">{status}</div>}
            {!loading && (
                <>
                    <section className="dashboard-panel">
                        <h3> Profile Details</h3>
                        <label>Name</label>
                        <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleProfileChange}
                    style={{ width: "100%", margin: "8px 0 12px 0" }}/>
                        <label>Email</label>
                        <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handlePreferenceToggle}
                        style={{ width: "100%", margin: "8px 0 12px 0" }}
                        />
                        <div>
                            <strong>Role:</strong> {profile.role}
                        </div>
                    </section>
                    <section className="dashboard-panel">
                        <h3>Notification Preferences</h3>
                        <label style={{ display: "block" , marginBottom: 12}}>
                               <input
                                   type="checkbox"
                                   checked={preferences.emailNotifications}
                                   onChange={()=>handlePreferenceToggle("emailNotifications")}
                                   style={{marginRight: 8}}
                                   />
                            Recieve email notifications
                            </label>
                        <label style={{display: "block" , marginBottom: 12}}>
                            <input
                            type="checkbox"
                            checked={preferences.bookingAlerts}
                            onChange={()=>handlePreferenceToggle("bookingAlerts")}
                            style={{marginRight: 8}}
                            />
                            Receive booking request alerts
                        </label>
                        <label style={{ display: "block" , marginBottom: 12}}>
                        <input
                            type="checkbox"
                            checked={preferences.changeRequestAlerts}
                            onChange={()=>handlePreferenceToggle("changeRequestAlerts")}
                            style={{marginRight: 8}}
                            />
                        Recieve change request alerts
                        </label>
                    </section>
                    <section className="dashboard-panel">
                        <h3> Display Preferences</h3>
                        <label style={{ display: "block" , marginBottom: 12}}>
                            <input
                                type="checkbox"
                                checked={preferences.dashboardTips}
                                onChange={()=> handlePreferenceToggle("dashboardTips")}
                                style={{marginRight:8}}
                                />
                            Show dashboard tips
                        </label>
                        <label style={{ display: "block" , marginBottom: 12}}>
                            <input
                            type="checkbox"
                            checked={preferences.compactDashboard}
                            onChange={()=>handlePreferenceToggle("compactDashboard")}
                            style={{marginRight:8}}
                            />
                            use compact dashboard layout
                        </label>
                    </section>
                    <section className="dashboard-panel">
                        <h3>Security</h3>
                        <label>Current password</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            style={{ width: "100%", margin: "8px 0 12px 0" }}
                            />
                        <label>New Password</label>
                        <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        style={{ width: "100%", margin: "8px 0 12px 0" }}
                        />
                        <div style={{fontSize: 14, opacity:0.8}}>
                            Password update is a placeholder for now.
                        </div>
                    </section>
                    <section className="dashboard-panel">
                        <button
                            type="button"
                            className="sf-filterBtn"
                            onClick={handlePlaceholderSave}
                            disabled={saving}
                            >
                            {saving ? "Saving..." : "Save Preferences"}
                        </button>
                    </section>
                </>
            )}
        </AppLayout>
    );
}