import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import { useTheme } from "../../ThemeContext";
import "../../components/Owner/RestaurantProfile/Profile.css";
import { logout } from "../../components/utils/logout";

export default function OwnerEditRestaurantProfile() {
    const ownerName = localStorage.getItem("name") || "owner";
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("Restaurant Profile");
    const { isDarkMode, setIsDarkMode } = useTheme();

    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate);
            return;
        }
        setActive(label);
    }

    const DAYS = [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
    ];

    const [form, setForm] = useState({
        name: "",
        location: "",
        description: "",
        bookingRule: {
            daysAhead: "",
            slotMinutes: "",
            cancellationCutoffMinutes: "",
        },
        openingHours: DAYS.map((day) => ({
            day,
            opensAt: "",
            closesAt: "",
        })),
    });

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");

    useEffect(() => {
        async function loadProfile() {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch("/api/owner/restaurant/profile", {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                const data = await res.json();

                if (!res.ok) {
                    setStatus(data?.error || "Failed to load profile");
                    return;
                }

                const hoursMap = new Map(
                    (data.openingHours || []).map((hour) => [hour.day, hour])
                );

                setForm({
                    name: data.name || "",
                    location: data.location || "",
                    description: data.description || "",
                    bookingRule: {
                        daysAhead: data.bookingRule?.daysAhead ?? "",
                        slotMinutes: data.bookingRule?.slotMinutes ?? "",
                        cancellationCutoffMinutes:
                            data.bookingRule?.cancellationCutoffMinutes ?? "",
                    },
                    openingHours: DAYS.map((day) => ({
                        day,
                        opensAt: hoursMap.get(day)?.opensAt || "",
                        closesAt: hoursMap.get(day)?.closesAt || "",
                    })),
                });
            } catch (error) {
                console.error(error);
                setStatus("Server error");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleRuleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            bookingRule: {
                ...prev.bookingRule,
                [name]: value,
            },
        }));
    }

    function handleHourChange(index, field, value) {
        setForm((prev) => {
            const updatedHours = [...prev.openingHours];
            updatedHours[index] = {
                ...updatedHours[index],
                [field]: value,
            };

            return {
                ...prev,
                openingHours: updatedHours,
            };
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus("Saving...");

        try {
            const token = localStorage.getItem("token");

            const payload = {
                name: form.name,
                location: form.location,
                description: form.description,
                bookingRule: {
                    daysAhead: form.bookingRule.daysAhead,
                    slotMinutes: form.bookingRule.slotMinutes,
                    cancellationCutoffMinutes:
                    form.bookingRule.cancellationCutoffMinutes,
                },
                openingHours: form.openingHours.filter(
                    (hour) => hour.opensAt && hour.closesAt
                ),
            };

            const res = await fetch("/api/owner/restaurant/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus(data?.error || "Failed to save changes");
                return;
            }

            navigate("/owner/restaurant/profile");
        } catch (error) {
            console.error(error);
            setStatus("Server error");
        }
    }

    return (
        <AppLayout
            name={ownerName}
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((prev) => !prev)}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            sideNav={
                <OwnerSideNav
                    active={active}
                    onNavigate={handleNavigate}
                    collapsed={collapsed}
                />
            }
        >
            <div className="owner-profile-page">
                <form className="owner-profile-edit" onSubmit={handleSubmit}>
                    <div className="profile-header">
                        <div className="profile-header__content">
                            <input
                                className="profile-edit__title-input"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Restaurant name"
                            />
                            <input
                                className="profile-edit__subtitle-input"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                placeholder="Location"
                            />
                        </div>
                    </div>

                    {loading && <p>Loading profile...</p>}
                    {status && <p className="status">{status}</p>}

                    {!loading && (
                        <>
                            <div className="profile-card">
                                <h3>Restaurant Info</h3>

                                <div className="profile-edit__stack">
                                    <label className="profile-edit__field">
                                        <span>Description</span>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            placeholder="Add a short restaurant description"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="profile-card">
                                <h3>Opening Hours</h3>

                                <div className="profile-hours">
                                    {form.openingHours.map((hour, index) => (
                                        <div className="profile-hours__row" key={hour.day}>
                                            <span className="profile-hours__day">
                                                {hour.day}
                                            </span>

                                            <input
                                                type="time"
                                                value={hour.opensAt}
                                                onChange={(e) =>
                                                    handleHourChange(index, "opensAt", e.target.value)
                                                }
                                            />

                                            <input
                                                type="time"
                                                value={hour.closesAt}
                                                onChange={(e) =>
                                                    handleHourChange(index, "closesAt", e.target.value)
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="profile-card">
                                <h3>Booking Rules</h3>

                                <div className="profile-edit__grid">
                                    <label className="profile-edit__field">
                                        <span>Days ahead</span>
                                        <input
                                            name="daysAhead"
                                            type="number"
                                            value={form.bookingRule.daysAhead}
                                            onChange={handleRuleChange}
                                        />
                                    </label>

                                    <label className="profile-edit__field">
                                        <span>Slot duration</span>
                                        <input
                                            name="slotMinutes"
                                            type="number"
                                            value={form.bookingRule.slotMinutes}
                                            onChange={handleRuleChange}
                                        />
                                    </label>

                                    <label className="profile-edit__field">
                                        <span>Cancellation cutoff</span>
                                        <input
                                            name="cancellationCutoffMinutes"
                                            type="number"
                                            value={form.bookingRule.cancellationCutoffMinutes}
                                            onChange={handleRuleChange}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="profile-edit__actions">
                                <button
                                    type="submit"
                                    className="profile-header__edit"
                                    disabled={loading}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </AppLayout>
    );
}