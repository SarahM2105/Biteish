import React, { useState, useEffect } from "react";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";

const DAYS = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];

function normaliseTimeValue(value) {
    if (!value) return "";
    return String(value).slice(0, 5);
}

export default function OwnerRestaurantProfile() {
    const name = localStorage.getItem("name") || "owner";

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false);
    const [status, setStatus] = useState("");
    const [restaurant, setRestaurant] = useState(null);

    const [form, setForm] = useState({
        name: "",
        location: "",
        bookingRule: {
            maxPartySize: "",
            daysAhead: "",
            slotMinutes: "",
            cancellationCutoffMinutes: "",
        },
        openingHours: [],
    });

    function buildFormFromRestaurant(data) {
        const existing = Array.isArray(data?.openingHours) ? data.openingHours : [];

        const openingHours = DAYS.map((day) => {
            const found = existing.find((h) => h.day === day);

            return {
                id: found?.id || day,
                day,
                opensAt: normaliseTimeValue(found?.opensAt),
                closesAt: normaliseTimeValue(found?.closesAt),
                closed: !found,
            };
        });

        return {
            name: data?.name || "",
            location: data?.location || "",
            bookingRule: {
                maxPartySize: data?.bookingRule?.maxPartySize ?? "",
                daysAhead: data?.bookingRule?.daysAhead ?? "",
                slotMinutes: data?.bookingRule?.slotMinutes ?? "",
                cancellationCutoffMinutes:
                    data?.bookingRule?.cancellationCutoffMinutes ?? "",
            },
            openingHours,
        };
    }

    useEffect(() => {
        async function loadProfile() {
            setLoading(true);
            setStatus("");

            try {
                const token = localStorage.getItem("token");

                const res = await fetch("/api/owner/restaurant/profile", {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setStatus(data?.error || "Failed to load restaurant profile");
                    return;
                }

                setRestaurant(data);
                setForm(buildFormFromRestaurant(data));
            } catch (err) {
                console.error(err);
                setStatus("Failed to load restaurant profile");
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

    function handleBookingRuleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            bookingRule: {
                ...prev.bookingRule,
                [name]: value,
            },
        }));
    }

    function handleOpeningHourChange(index, field, value) {
        setForm((prev) => ({
            ...prev,
            openingHours: prev.openingHours.map((hour, i) =>
                i === index ? { ...hour, [field]: value } : hour
            ),
        }));
    }

    function handleToggleClosed(index){
        setForm((prev)=> ({
            ...prev,
            openingHours: prev.openingHours.map((hour, i) =>{
                if (i !== index) return hour;
                const nextClosed = !hour.closed;
                return {
                    ...hour,
                    closed: nextClosed,
                    opensAt: nextClosed ? "" : hour.opensAt,
                    closesAt: nextClosed ? "" : hour.closesAt,
                };
            }),
        }));
    }

    function handleEditStart() {
        setForm(buildFormFromRestaurant(restaurant));
        setEditing(true);
        setStatus("");
    }

    function handleCancelEdit() {
        setForm(buildFormFromRestaurant(restaurant));
        setEditing(false);
        setStatus("");
    }

    async function handleSaveProfile(e) {
        e.preventDefault();
        setSaving(true);
        setStatus("");

        try {
            const token = localStorage.getItem("token");

            const payload = {
                name: form.name.trim(),
                location: form.location.trim(),
                bookingRule: {
                    maxPartySize: Number(form.bookingRule.maxPartySize),
                    daysAhead: Number(form.bookingRule.daysAhead),
                    slotMinutes: Number(form.bookingRule.slotMinutes),
                    cancellationCutoffMinutes: Number(
                        form.bookingRule.cancellationCutoffMinutes
                    ),
                },
                openingHours: form.openingHours
                    .filter((hour)=> !hour.closed)
                    .map((hour) => ({
                    id: hour.id,
                    day: hour.day,
                    opensAt: normaliseTimeValue(hour.opensAt),
                    closesAt: normaliseTimeValue(hour.closesAt),
                })),
            };

            console.log("Saving profile payload:", payload);

            const res = await fetch("/api/owner/restaurant/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json().catch(() => ({}));
            console.log("PATCH response:", data);

            if (!res.ok) {
                setStatus(data?.error || "Failed to update restaurant profile");
                return;
            }

            const updatedRestaurant = data.restaurant || data;
            setRestaurant(updatedRestaurant);
            setForm(buildFormFromRestaurant(updatedRestaurant));
            setEditing(false);
            setStatus(data?.message || "Restaurant profile updated successfully");
        } catch (err) {
            console.error(err);
            setStatus("Failed to update restaurant profile");
        } finally {
            setSaving(false);
        }
    }

    return (
        <AppLayout
            name={name}
            sideNav={<OwnerSideNav active="Restaurant Profile" />}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                }}
            >
                <h1 style={{ margin: 0 }}>Restaurant Profile</h1>

                {!loading && restaurant && !editing && (
                    <button
                        type="button"
                        className="sf-filterBtn"
                        onClick={handleEditStart}
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            {loading && <div className="dashboard-panel">Loading profile...</div>}
            {status && <div className="dashboard-panel">{status}</div>}

            {!loading && restaurant && (
                <>
                    {!editing ? (
                        <>
                            <section className="dashboard-panel">
                                <h3>Restaurant Details</h3>
                                <div><strong>Name:</strong> {restaurant.name}</div>
                                <div><strong>Location:</strong> {restaurant.location}</div>
                                <div><strong>Verified:</strong> {restaurant.verified ? "Yes" : "No"}</div>
                            </section>

                            <section className="dashboard-panel">
                                <h3>Booking Rules</h3>
                                {restaurant.bookingRule ? (
                                    <>
                                        <div><strong>Max Party Size:</strong> {restaurant.bookingRule.maxPartySize}
                                        </div>
                                        <div><strong>Days Ahead:</strong> {restaurant.bookingRule.daysAhead}</div>
                                        <div><strong>Slot Minutes:</strong> {restaurant.bookingRule.slotMinutes}</div>
                                        <div><strong>Cancellation
                                            Cutoff:</strong> {restaurant.bookingRule.cancellationCutoffMinutes} minutes
                                        </div>
                                    </>
                                ) : (
                                    <div>No booking rules set yet.</div>
                                )}
                            </section>

                            <section className="dashboard-panel">
                                <h3>Opening Hours</h3>
                                {DAYS.map((day)=>{
                                    const found = restaurant.openingHours?.find((hour)=> hour.day === day);
                                    return (
                                        <div key={day}>
                                            <strong>{day}:</strong>{found ? `${found.opensAt} - ${found.closesAt}`: "Closed"}
                                        </div>
                                    );
                                })}
                            </section>
                            <section className="dashboard-panel">
                                <h3>Accessibility</h3>

                                {restaurant.accessibility?.length ? (
                                    restaurant.accessibility.map((item) => (
                                        <div key={item.id}>
                                            <strong>{item.option?.optionName}</strong>
                                            {item.option?.description ? ` - ${item.option.description}` : ""}
                                        </div>
                                    ))
                                ) : (
                                    <div>No accessibility options added yet.</div>
                                )}
                            </section>

                        </>
                    ) : (
                        <form onSubmit={handleSaveProfile}>
                            <div style={{marginBottom: 20}}>
                                <button
                                    type="submit"
                                    className="sf-filterBtn"
                                    disabled={saving}
                                    style={{marginRight: 10}}
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>

                                <button
                                    type="button"
                                    className="sf-filterBtn"
                                    onClick={handleCancelEdit}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            </div>

                            <section className="dashboard-panel">
                                <h3>Edit Restaurant Details</h3>

                                <label>Restaurant Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    style={{ width: "100%", margin: "8px 0 12px 0" }}
                                />

                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    style={{ width: "100%", margin: "8px 0 12px 0" }}
                                />
                            </section>

                            <section className="dashboard-panel">
                                <h3>Edit Booking Rules</h3>

                                <label>Max Party Size</label>
                                <input
                                    type="number"
                                    name="maxPartySize"
                                    value={form.bookingRule.maxPartySize}
                                    onChange={handleBookingRuleChange}
                                    style={{ width: "100%", margin: "8px 0 12px 0" }}
                                />

                                <label>Days Ahead</label>
                                <input
                                    type="number"
                                    name="daysAhead"
                                    value={form.bookingRule.daysAhead}
                                    onChange={handleBookingRuleChange}
                                    style={{ width: "100%", margin: "8px 0 12px 0" }}
                                />

                                <label>Slot Minutes</label>
                                <input
                                    type="number"
                                    name="slotMinutes"
                                    value={form.bookingRule.slotMinutes}
                                    onChange={handleBookingRuleChange}
                                    style={{ width: "100%", margin: "8px 0 12px 0" }}
                                />

                                <label>Cancellation Cutoff Minutes</label>
                                <input
                                    type="number"
                                    name="cancellationCutoffMinutes"
                                    value={form.bookingRule.cancellationCutoffMinutes}
                                    onChange={handleBookingRuleChange}
                                    style={{ width: "100%", margin: "8px 0 12px 0" }}
                                />
                            </section>

                            <section className="dashboard-panel">
                                <h3>Edit Opening Hours</h3>

                                {form.openingHours.map((hour, index) => (
                                    <div
                                        key={hour.id}
                                        style={{
                                            marginBottom: 16,
                                            paddingBottom: 12,
                                            borderBottom: "1px solid #ddd",
                                        }}
                                    >
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: 8,
                                        }}>
                                            <strong>{hour.day}</strong>

                                            <label style={{ display: "flex", alignItems: "center", gap: 8}}>
                                                <input
                                                    type="checkbox"
                                                    checked={hour.closed}
                                                    onChange={() => handleToggleClosed(index)}
                                                    />
                                                Closed
                                            </label>
                                        </div>

                                        <label>Opens At</label>
                                        <input
                                            type="time"
                                            value={hour.opensAt}
                                            disabled={hour.closed}
                                            onChange={(e) =>
                                                handleOpeningHourChange(index, "opensAt", e.target.value)
                                            }
                                            style={{ width: "100%", margin: "8px 0 12px 0" }}
                                        />

                                        <label>Closes At</label>
                                        <input
                                            type="time"
                                            value={hour.closesAt}
                                            disabled={hour.closed}
                                            onChange={(e) =>
                                                handleOpeningHourChange(index, "closesAt", e.target.value)
                                            }
                                            style={{ width: "100%", margin: "8px 0 12px 0" }}
                                        />
                                        {hour.closed && (
                                            <div style={{marginTop:6, fontStyle: "italic"}}>
                                                This day will be saved as closed
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </section>
                        </form>
                    )}
                </>
            )}
        </AppLayout>
    );
}