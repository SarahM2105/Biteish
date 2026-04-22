import React, { useEffect, useMemo, useState } from "react";
import BookingRulesCard from "./BookingRulesCard";

export default function RestaurantSettingsContent() {
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
        <div className="owner-settings-page">
            <section className="owner-settings-header">
                <div className="owner-settings-header__content">
                    <p className="owner-settings-header__eyebrow">{restaurantName}</p>
                    <h1 className="owner-settings-header__title">
                        Restaurant settings
                    </h1>
                    <p className="owner-settings-header__text">
                        Adjust your core booking rules in one place so reservations,
                        timing, and service flow stay consistent.
                    </p>
                </div>

                <div className="owner-settings-header__summary">
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
                    <BookingRulesCard
                        bookingRule={settings.bookingRule}
                        saving={saving}
                        onChange={handleBookingRuleChange}
                        onSave={handleSaveSettings}
                    />
                </div>
            )}
        </div>
    );
}