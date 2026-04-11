import React, { useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import useCustomerProfile from "../../hooks/useCustomerProfile";
import ProfileHeader from "../../components/Customer/Profile/Header";
import ProfileMenu from "../../components/Customer/Profile/Menu";
import ProfileInfo from "../../components/Customer/Profile/Info";
import ProfileSecurity from "../../components/Customer/Profile/Security";
import ProfileActions from "../../components/Customer/Profile/Actions";
import "../../components/Customer/Profile/css/ProfileAction.css";
import "../../components/Customer/Profile/css/ProfileBase.css";
import "../../components/Customer/Profile/css/ProfileDetail.css";
import "../../components/Customer/Profile/css/ProfileHeader.css";
import "../../components/Customer/Profile/css/ProfileResponsive.css";
import "../../components/Customer/Profile/css/ProfileMenu.css";
import { useTheme } from "../../ThemeContext";

export default function CustomerProfile() {
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("Profile and Preferences");
    const {isDarkMode, setIsDarkMode} = useTheme();

    const profile = useCustomerProfile();

    function handleNavigate(label) {
        setActive(label);
    }

    return (
        <AppLayout
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((prev) => !prev)}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            sideNav={
                <CustomerSideNav
                    active={active}
                    onNavigate={handleNavigate}
                    collapsed={collapsed}
                />
            }
        >
            <div className="customer-profile-page">
                <h1 className="page-title">Profile & Preferences</h1>

                {profile.loading && <div className="customer-profile__banner">Loading profile...</div>}
                {profile.loadStatus && <div className="customer-profile__banner">{profile.loadStatus}</div>}

                <ProfileHeader
                    avatarLetter={profile.avatarLetter}
                    name={profile.me.name}
                    email={profile.me.email}
                    role={profile.me.role}
                />

                {profile.currentView === "menu" && (
                    <ProfileMenu openView={profile.openView} />
                )}

                {profile.currentView === "personal" && (
                    <ProfileInfo
                        me={profile.me}
                        profileForm={profile.profileForm}
                        isEditingProfile={profile.isEditingProfile}
                        profileStatus={profile.profileStatus}
                        setIsEditingProfile={profile.setIsEditingProfile}
                        setCurrentView={profile.setCurrentView}
                        handleProfileChange={profile.handleProfileChange}
                        handleCancelEdit={profile.handleCancelEdit}
                        handleSaveProfile={profile.handleSaveProfile}
                    />
                )}

                {profile.currentView === "security" && (
                    <ProfileSecurity
                        passwordForm={profile.passwordForm}
                        passwordStatus={profile.passwordStatus}
                        setCurrentView={profile.setCurrentView}
                        handlePasswordChange={profile.handlePasswordChange}
                        handleUpdatePassword={profile.handleUpdatePassword}
                    />
                )}

                {profile.currentView === "actions" && (
                    <ProfileActions
                        issueOpen={profile.issueOpen}
                        issueForm={profile.issueForm}
                        issueStatus={profile.issueStatus}
                        actionStatus={profile.actionStatus}
                        setCurrentView={profile.setCurrentView}
                        setIssueOpen={profile.setIssueOpen}
                        setIssueStatus={profile.setIssueStatus}
                        setActionStatus={profile.setActionStatus}
                        handleIssueChange={profile.handleIssueChange}
                        handleSubmitIssue={profile.handleSubmitIssue}
                    />
                )}
            </div>
        </AppLayout>
    );
}