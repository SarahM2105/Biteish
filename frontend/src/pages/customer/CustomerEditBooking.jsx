import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import { logout } from "../../components/utils/logout";
import "../../components/Customer/MyBookings/css/EditBookingPage.css";

export default function CustomerEditBooking() {
    const name = localStorage.getItem("name") || "customer";
    const { reservationId } = useParams();
    const navigate = useNavigate();

    const [collapsed, setCollapsed] = useState(true);
    const [active, setActive] = useState("My Bookings");
    const [isDarkMode, setIsDarkMode] = useState(true);

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [durationMins, setDurationMins] = useState(120);
    const [partySize, setPartySize] = useState(2);
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [booking, setBooking] = useState(null);

    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate);
            return;
        }
        setActive(label);
    }

    useEffect(() => {
        async function loadReservation() {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch("/api/customer/reservations", {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                const data = await res.json();

                const foundBooking = Array.isArray(data)
                    ? data.find((r) => r.id === reservationId)
                    : null;

                if (!foundBooking) {
                    setStatus("Booking not found");
                    setLoading(false);
                    return;
                }

                setBooking(foundBooking);

                const start = new Date(foundBooking.startsAt);
                const end = new Date(foundBooking.endsAt);

                setDate(start.toISOString().slice(0, 10));
                setTime(start.toISOString().slice(11, 16));
                setDurationMins((end - start) / 60000);
                setPartySize(foundBooking.partySize);
                setNotes(foundBooking.notes || "");
            } catch (err) {
                console.error(err);
                setStatus("Failed to load booking");
            } finally {
                setLoading(false);
            }
        }

        loadReservation();
    }, [reservationId]);

    const startsAtISO = useMemo(() => {
        if (!date || !time) return "";
        return new Date(`${date}T${time}:00`).toISOString();
    }, [date, time]);

    const endsAtISO = useMemo(() => {
        if (!startsAtISO) return "";
        const end = new Date(new Date(startsAtISO).getTime() + durationMins * 60000);
        return end.toISOString();
    }, [startsAtISO, durationMins]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setStatus("");

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`/api/customer/reservations/${reservationId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    startsAt: startsAtISO,
                    endsAt: endsAtISO,
                    partySize,
                    notes,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setStatus(data.error || "Update failed");
                return;
            }

            setStatus("Change request submitted for approval");
        } catch (err) {
            console.error(err);
            setStatus("Server error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AppLayout
            name={name}
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
            <div className="edit-booking-page">
                <section className="edit-booking-header">
                    <div className="edit-booking-header__content">
                        <p className="edit-booking-header__eyebrow">Booking updates</p>
                        <h1 className="edit-booking-header__title">Request Booking Change</h1>
                        <p className="edit-booking-header__text">
                            Submit a change request for the restaurant to review. Your current
                            booking stays the same until the request is approved.
                        </p>
                    </div>
                </section>

                {loading ? (
                    <div className="edit-booking-feedback">Loading...</div>
                ) : (
                    <>
                        {booking && (
                            <section className="edit-booking-current">
                                <div className="edit-booking-current__top">
                                    <div>
                                        <p className="edit-booking-current__eyebrow">Current booking</p>
                                        <h2 className="edit-booking-current__title">
                                            {booking.restaurant?.name || "Restaurant"}
                                        </h2>
                                    </div>

                                    <div className="edit-booking-current__status">
                                        {booking.status || "BOOKING"}
                                    </div>
                                </div>

                                <div className="edit-booking-current__grid">
                                    <div className="edit-booking-current__item">
                                        <span className="edit-booking-current__label">Date</span>
                                        <span className="edit-booking-current__value">
                                            {new Date(booking.startsAt).toLocaleDateString("en-GB", {
                                                weekday: "long",
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>

                                    <div className="edit-booking-current__item">
                                        <span className="edit-booking-current__label">Time</span>
                                        <span className="edit-booking-current__value">
                                            {new Date(booking.startsAt).toLocaleTimeString("en-GB", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>

                                    <div className="edit-booking-current__item">
                                        <span className="edit-booking-current__label">Party size</span>
                                        <span className="edit-booking-current__value">
                                            {booking.partySize}
                                        </span>
                                    </div>

                                    <div className="edit-booking-current__item">
                                        <span className="edit-booking-current__label">Table</span>
                                        <span className="edit-booking-current__value">
                                            {booking.table?.name || "Not assigned"}
                                        </span>
                                    </div>
                                </div>
                            </section>
                        )}

                        <form onSubmit={handleSubmit} className="edit-booking-form-card">
                            <div className="edit-booking-form-card__heading">
                                <p className="edit-booking-form-card__eyebrow">Requested changes</p>
                                <h2 className="edit-booking-form-card__title">
                                    Update your booking details
                                </h2>
                            </div>

                            <div className="edit-booking-form">
                                <label className="edit-booking-field">
                                    <span className="edit-booking-field__label">New date</span>
                                    <input
                                        className="edit-booking-field__input"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </label>

                                <label className="edit-booking-field">
                                    <span className="edit-booking-field__label">New time</span>
                                    <input
                                        className="edit-booking-field__input"
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                </label>

                                <label className="edit-booking-field">
                                    <span className="edit-booking-field__label">Duration (minutes)</span>
                                    <input
                                        className="edit-booking-field__input"
                                        type="number"
                                        min="15"
                                        step="15"
                                        value={durationMins}
                                        onChange={(e) => setDurationMins(Number(e.target.value))}
                                    />
                                </label>

                                <label className="edit-booking-field">
                                    <span className="edit-booking-field__label">Party size</span>
                                    <input
                                        className="edit-booking-field__input"
                                        type="number"
                                        min="1"
                                        value={partySize}
                                        onChange={(e) => setPartySize(Number(e.target.value))}
                                    />
                                </label>

                                <label className="edit-booking-field edit-booking-field--full">
                                    <span className="edit-booking-field__label">
                                        Notes for the restaurant
                                    </span>
                                    <textarea
                                        className="edit-booking-field__input edit-booking-field__textarea"
                                        rows={4}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any updates or explanation for your request..."
                                    />
                                </label>
                            </div>

                            <div className="edit-booking-notice">
                                Your original reservation remains unchanged until the restaurant
                                reviews and approves this request.
                            </div>

                            <div className="edit-booking-actions">
                                <button
                                    className="edit-booking-button edit-booking-button--primary"
                                    type="submit"
                                    disabled={submitting}
                                >
                                    {submitting ? "Submitting..." : "Submit change request"}
                                </button>

                                <button
                                    className="edit-booking-button edit-booking-button--secondary"
                                    type="button"
                                    onClick={() => navigate("/customer/myBookings")}
                                >
                                    Back to bookings
                                </button>
                            </div>

                            {status && (
                                <div className="edit-booking-feedback edit-booking-feedback--status">
                                    {status}
                                </div>
                            )}
                        </form>
                    </>
                )}
            </div>
        </AppLayout>
    );
}