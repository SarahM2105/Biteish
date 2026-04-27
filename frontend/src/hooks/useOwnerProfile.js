import { useEffect, useMemo, useState } from "react";
import { authFetch } from "../components/utils/authFetch";
import { getApiErrorMessage } from "../components/utils/getApiErrorMessage";

export default function useOwnerProfile() {
    const fallbackName = localStorage.getItem("name") || "owner";

    const [loading, setLoading] = useState(false);
    const [loadStatus, setLoadStatus] = useState("");
    const [currentView, setCurrentView] = useState("menu");

    const [me, setMe] = useState({
        name: fallbackName,
        email: "—",
        role: "OWNER",
    });

    const [profileForm, setProfileForm] = useState({
        name: fallbackName,
        email: "",
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileStatus, setProfileStatus] = useState("");

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordStatus, setPasswordStatus] = useState("");

    const [issueOpen, setIssueOpen] = useState(false);
    const [issueForm, setIssueForm] = useState({
        issueType: "Bug",
        description: "",
    });
    const [issueStatus, setIssueStatus] = useState("");
    const [actionStatus, setActionStatus] = useState("");

    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            setLoadStatus("");

            try {
                const res = await authFetch("/api/owner/me");
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setLoadStatus(
                        getApiErrorMessage(data, "Failed to load profile")
                    );
                    return;
                }

                const nextUser = {
                    name: data?.name || fallbackName,
                    email: data?.email || "—",
                    role: data?.role || "OWNER",
                };

                setMe(nextUser);
                setProfileForm({
                    name: nextUser.name,
                    email: nextUser.email,
                });
            } catch (error) {
                console.error(error);
                setLoadStatus("Network/server error");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [fallbackName]);

    const avatarLetter = useMemo(() => {
        return (
            (profileForm.name || me.name || fallbackName)
                .trim()
                .charAt(0)
                .toUpperCase() || "O"
        );
    }, [profileForm.name, me.name, fallbackName]);

    function openView(view) {
        setCurrentView(view);
        setProfileStatus("");
        setPasswordStatus("");
        setIssueStatus("");
        setActionStatus("");
        setIssueOpen(false);
        setIsEditingProfile(false);
        setProfileForm({
            name: me.name,
            email: me.email,
        });
        setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    }

    function handleProfileChange(event) {
        const { name, value } = event.target;

        setProfileForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handlePasswordChange(event) {
        const { name, value } = event.target;

        setPasswordForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleIssueChange(event) {
        const { name, value } = event.target;

        setIssueForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleCancelEdit() {
        setProfileForm({
            name: me.name,
            email: me.email,
        });
        setProfileStatus("");
        setIsEditingProfile(false);
    }

    async function handleSaveProfile(event) {
        event.preventDefault();

        if (!profileForm.name.trim()) {
            setProfileStatus("Please enter your full name.");
            return;
        }

        if (!profileForm.email.trim()) {
            setProfileStatus("Please enter your email address.");
            return;
        }

        try {
            setProfileStatus("Saving...");

            const res = await authFetch("/api/owner/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: profileForm.name,
                    email: profileForm.email,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setProfileStatus(
                    getApiErrorMessage(data, "Failed to update profile.")
                );
                return;
            }

            const nextUser = {
                name: data?.name || profileForm.name.trim(),
                email: data?.email || profileForm.email.trim(),
                role: data?.role || me.role,
            };

            setMe(nextUser);
            setProfileForm({
                name: nextUser.name,
                email: nextUser.email,
            });

            localStorage.setItem("name", nextUser.name);
            setProfileStatus("Profile updated successfully.");
            setIsEditingProfile(false);
        } catch (error) {
            console.error(error);
            setProfileStatus("Network/server error.");
        }
    }

    async function handleUpdatePassword(event) {
        event.preventDefault();

        if (
            !passwordForm.currentPassword ||
            !passwordForm.newPassword ||
            !passwordForm.confirmPassword
        ) {
            setPasswordStatus("Please complete all password fields.");
            return;
        }

        try {
            setPasswordStatus("Updating...");

            const res = await authFetch("/api/owner/me/password", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(passwordForm),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setPasswordStatus(
                    getApiErrorMessage(data, "Failed to update password.")
                );
                return;
            }

            setPasswordStatus(data?.message || "Password updated successfully.");
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            console.error(error);
            setPasswordStatus("Network/server error.");
        }
    }

    function handleSubmitIssue(event) {
        event.preventDefault();

        if (!issueForm.description.trim()) {
            setIssueStatus("Please describe the issue before submitting.");
            return;
        }

        setIssueStatus("Issue reporting is not available yet.");
        setIssueForm({
            issueType: "Bug",
            description: "",
        });
        setIssueOpen(false);
    }

    return {
        loading,
        loadStatus,
        currentView,
        setCurrentView,
        me,
        profileForm,
        isEditingProfile,
        setIsEditingProfile,
        profileStatus,
        passwordForm,
        passwordStatus,
        issueOpen,
        setIssueOpen,
        issueForm,
        issueStatus,
        setIssueStatus,
        actionStatus,
        setActionStatus,
        avatarLetter,
        openView,
        handleProfileChange,
        handlePasswordChange,
        handleIssueChange,
        handleCancelEdit,
        handleSaveProfile,
        handleUpdatePassword,
        handleSubmitIssue,
    };
}