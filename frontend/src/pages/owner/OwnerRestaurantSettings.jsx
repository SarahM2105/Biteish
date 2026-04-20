import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import { useTheme } from "../../ThemeContext";
import "../../components/Owner/Settings/Settings.css";

export default function OwnerRestaurantSettings() {
    const name = localStorage.getItem("name") || "Owner";
    const { isDarkMode, setIsDarkMode } = useTheme();

    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("Restaurant Settings");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [restaurantName, setRestaurantName] = useState("Restaurant settings");

    const [settings, setSettings] = useState({
        bookingRule: {
            maxPartySize: "",
            daysAhead: "",
            slotMinutes: "",
            turnoverMinutes: "",
            cancellationCutoffMinutes: "",
            graceMinutes: "",
        },
    });

    useEffect(() => {
        async function loadSettings() {
            setLoading(true);
            setStatus({ type: "", message: "" });

            try {
                const token = localStorage.getItem("token");
                const res = await fetch("/api/owner/restaurant/profile", {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setStatus({
                        type: "error",
                        message: data?.error || data?.message || "Failed to load profile",
                    });
                    return;
                }

                setRestaurantName(data.name || "Restaurant settings");

                setSettings({
                    bookingRule: {
                        maxPartySize: data.bookingRule?.maxPartySize ?? "",
                        daysAhead: data.bookingRule?.daysAhead ?? "",
                        slotMinutes: data.bookingRule?.slotMinutes ?? "",
                        turnoverMinutes: data.bookingRule?.turnoverMinutes ?? "",
                        cancellationCutoffMinutes:
                            data.bookingRule?.cancellationCutoffMinutes ?? "",
                        graceMinutes: data.bookingRule?.graceMinutes ?? "",
                    },
                });
            } catch (error) {
                console.error(error);
                setStatus({
                    type: "error",
                    message: "Failed to load profile",
                });
            } finally {
                setLoading(false);
            }
        }

        loadSettings();
    }, []);

    function handleNavigate(label) {
        setActive(label);
    }

    function handleBookingRuleChange(event) {
        const { name, value } = event.target;

        setSettings((prev) => ({
            ...prev,
            bookingRule: {
                ...prev.bookingRule,
                [name]: value,
            },
        }));
    }

    async function handleSaveSettings() {
        setSaving(true);
        setStatus({ type: "", message: "" });

        try {
            const token = localStorage.getItem("token");

            const payload = {
                bookingRule: {
                    maxPartySize:
                        settings.bookingRule.maxPartySize === ""
                            ? undefined
                            : Number(settings.bookingRule.maxPartySize),
                    daysAhead:
                        settings.bookingRule.daysAhead === ""
                            ? undefined
                            : Number(settings.bookingRule.daysAhead),
                    slotMinutes:
                        settings.bookingRule.slotMinutes === ""
                            ? undefined
                            : Number(settings.bookingRule.slotMinutes),
                    turnoverMinutes:
                        settings.bookingRule.turnoverMinutes === ""
                            ? undefined
                            : Number(settings.bookingRule.turnoverMinutes),
                    cancellationCutoffMinutes:
                        settings.bookingRule.cancellationCutoffMinutes === ""
                            ? undefined
                            : Number(settings.bookingRule.cancellationCutoffMinutes),
                    graceMinutes:
                        settings.bookingRule.graceMinutes === ""
                            ? undefined
                            : Number(settings.bookingRule.graceMinutes),
                },
            };

            const res = await fetch("/api/owner/restaurant/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus({
                    type: "error",
                    message: data?.error || data?.message || "Failed to save settings",
                });
                return;
            }

            setStatus({
                type: "success",
                message: "Booking rules saved successfully.",
            });

            if (data?.restaurant?.name) {
                setRestaurantName(data.restaurant.name);
            }

            if (data?.restaurant?.bookingRule) {
                setSettings({
                    bookingRule: {
                        maxPartySize: data.restaurant.bookingRule.maxPartySize ?? "",
                        daysAhead: data.restaurant.bookingRule.daysAhead ?? "",
                        slotMinutes: data.restaurant.bookingRule.slotMinutes ?? "",
                        turnoverMinutes:
                            data.restaurant.bookingRule.turnoverMinutes ?? "",
                        cancellationCutoffMinutes:
                            data.restaurant.bookingRule.cancellationCutoffMinutes ?? "",
                        graceMinutes: data.restaurant.bookingRule.graceMinutes ?? "",
                    },
                });
            }
        } catch (error) {
            console.error(error);
            setStatus({
                type: "error",
                message: "Failed to save settings",
            });
        } finally {
            setSaving(false);
        }
    }

    const bookingSummary = useMemo(
        () => [
            {
                label: "Max party",
                value: settings.bookingRule.maxPartySize || "—",
            },
            {
                label: "Slot duration",
                value: settings.bookingRule.slotMinutes
                    ? `${settings.bookingRule.slotMinutes} mins`
                    : "—",
            },
            {
                label: "Turnover gap",
                value: settings.bookingRule.turnoverMinutes
                    ? `${settings.bookingRule.turnoverMinutes} mins`
                    : "—",
            },
            {
                label: "Grace period",
                value: settings.bookingRule.graceMinutes
                    ? `${settings.bookingRule.graceMinutes} mins`
                    : "—",
            },
        ],
        [settings.bookingRule]
    );

    return (
        <AppLayout
            name={name}
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
            <div className="owner-settings-page">
                <section className="owner-settings-hero">
                    <div className="owner-settings-hero__content">
                        <p className="owner-settings-hero__eyebrow">{restaurantName}</p>
                        <h1 className="owner-settings-hero__title">
                            Restaurant settings
                        </h1>
                        <p className="owner-settings-hero__text">
                            Adjust your core booking rules in one place so reservations,
                            timing, and service flow stay consistent.
                        </p>
                    </div>

                    <div className="owner-settings-hero__summary">
                        {bookingSummary.map((item) => (
                            <div key={item.label} className="owner-settings-summary-card">
                                <span>{item.label}</span>
                                <strong>{item.value}</strong>
                            </div>
                        ))}
                    </div>
                </section>

                {loading && (
                    <div className="owner-settings-alert owner-settings-alert--neutral">
                        Loading settings...
                    </div>
                )}

                {!loading && status.message && (
                    <div
                        className={`owner-settings-alert ${
                            status.type === "success"
                                ? "owner-settings-alert--success"
                                : status.type === "error"
                                    ? "owner-settings-alert--error"
                                    : "owner-settings-alert--neutral"
                        }`}
                    >
                        {status.message}
                    </div>
                )}

                {!loading && (
                    <div className="owner-settings-grid">
                        <section className="owner-settings-card owner-settings-card--wide">
                            <div className="owner-settings-card__header">
                                <div>
                                    <p className="owner-settings-card__eyebrow">Booking rules</p>
                                    <h2>Core booking settings</h2>
                                    <p>
                                        Control how long bookings last, how far ahead they can be
                                        made, and how much gap you want between reservations.
                                    </p>
                                </div>
                            </div>

                            <div className="owner-settings-form-grid">
                                <label className="owner-settings-field">
                                    <span className="owner-settings-field__label">
                                        Max party size
                                    </span>
                                    <span className="owner-settings-field__hint">
                                        Largest group size accepted per booking.
                                    </span>
                                    <input
                                        type="number"
                                        name="maxPartySize"
                                        value={settings.bookingRule.maxPartySize}
                                        onChange={handleBookingRuleChange}
                                        className="owner-settings-field__input"
                                    />
                                </label>

                                <label className="owner-settings-field">
                                    <span className="owner-settings-field__label">
                                        Days ahead allowed
                                    </span>
                                    <span className="owner-settings-field__hint">
                                        How many days in advance customers can book.
                                    </span>
                                    <input
                                        type="number"
                                        name="daysAhead"
                                        value={settings.bookingRule.daysAhead}
                                        onChange={handleBookingRuleChange}
                                        className="owner-settings-field__input"
                                    />
                                </label>

                                <label className="owner-settings-field">
                                    <span className="owner-settings-field__label">
                                        Slot duration
                                    </span>
                                    <span className="owner-settings-field__hint">
                                        Maximum booking length in minutes.
                                    </span>
                                    <input
                                        type="number"
                                        name="slotMinutes"
                                        value={settings.bookingRule.slotMinutes}
                                        onChange={handleBookingRuleChange}
                                        className="owner-settings-field__input"
                                    />
                                </label>

                                <label className="owner-settings-field">
                                    <span className="owner-settings-field__label">
                                        Turnover gap
                                    </span>
                                    <span className="owner-settings-field__hint">
                                        Gap between bookings for cleanup and reset time.
                                    </span>
                                    <input
                                        type="number"
                                        name="turnoverMinutes"
                                        value={settings.bookingRule.turnoverMinutes}
                                        onChange={handleBookingRuleChange}
                                        className="owner-settings-field__input"
                                    />
                                </label>

                                <label className="owner-settings-field">
                                    <span className="owner-settings-field__label">
                                        Cancellation cutoff
                                    </span>
                                    <span className="owner-settings-field__hint">
                                        Last point a customer can cancel or change a booking.
                                    </span>
                                    <input
                                        type="number"
                                        name="cancellationCutoffMinutes"
                                        value={settings.bookingRule.cancellationCutoffMinutes}
                                        onChange={handleBookingRuleChange}
                                        className="owner-settings-field__input"
                                    />
                                </label>

                                <label className="owner-settings-field">
                                    <span className="owner-settings-field__label">
                                        Grace period
                                    </span>
                                    <span className="owner-settings-field__hint">
                                        How long a customer can be late before being flagged.
                                    </span>
                                    <input
                                        type="number"
                                        name="graceMinutes"
                                        value={settings.bookingRule.graceMinutes}
                                        onChange={handleBookingRuleChange}
                                        className="owner-settings-field__input"
                                    />
                                </label>
                            </div>

                            <div className="owner-settings-actions">
                                <button
                                    type="button"
                                    className="owner-settings-button owner-settings-button--primary"
                                    onClick={handleSaveSettings}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save booking rules"}
                                </button>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}