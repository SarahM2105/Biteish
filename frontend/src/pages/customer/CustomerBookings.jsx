import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import { useNavigate } from "react-router-dom";
import { logout } from "../../components/utils/logout";
import "../../components/Customer/MyBookings/css/MyBookingPage.css";
import "../../components/Customer/MyBookings/css/BookingTheme.css";
import "../../components/Customer/MyBookings/css/QRModal.css";
import "../../components/Customer/MyBookings/css/Responsive.css";
import "../../components/Customer/MyBookings/css/BookingCard.css";
import "../../components/Customer/MyBookings/css/Tabs.css";
import BookingsHeader from "../../components/Customer/MyBookings/Header";
import BookingsSummaryCards from "../../components/Customer/MyBookings/SummaryCards";
import BookingTabs from "../../components/Customer/MyBookings/Tabs";
import BookingCard from "../../components/Customer/MyBookings/BookingCard";
import BookingQrModal from "../../components/Customer/MyBookings/QRModal";

export default function CustomerBookings() {
    const name = localStorage.getItem("name") || "customer";
    const [collapsed, setCollapsed] = useState(true);
    const [active, setActive] = useState("My Bookings");
    const [isDarkMode, setIsDarkMode] = useState(true);

    const [tab, setTab] = useState("UPCOMING");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [qrImage, setQrImage] = useState("");
    const [qrExpiresAt, setQrExpiresAt] = useState("");
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrToken, setQrToken] = useState("");

    const navigate = useNavigate();

    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate);
            return;
        }
        setActive(label);
    }

    useEffect(() => {
        (async () => {
            setLoading(true);
            setStatus("");

            const tokenNow = localStorage.getItem("token");
            if (!tokenNow) {
                setStatus("No token found. Please log in again.");
                setBookings([]);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("/api/customer/reservations", {
                    headers: { Authorization: `Bearer ${tokenNow}` },
                });

                const text = await res.text();
                let data = [];
                try {
                    data = text ? JSON.parse(text) : [];
                } catch {
                    setStatus("Bad response from server");
                    data = [];
                }

                if (!res.ok) {
                    setStatus(data?.error || data?.message || "Failed to load bookings");
                    setBookings([]);
                    return;
                }

                setBookings(Array.isArray(data) ? data : []);
            } catch (e) {
                console.error(e);
                setStatus("Network/server error");
                setBookings([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function handleShowQr(reservationId) {
        setStatus("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/customer/reservations/${reservationId}/qr`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to load qr code");
                return;
            }

            setQrImage(data.qrImage || "");
            setQrExpiresAt(data.expiresAt || "");
            setQrToken(data.qrToken || "");
            setShowQrModal(true);
        } catch (error) {
            console.error(error);
            setStatus("Network/server error loading qr code");
        }
    }

    function handleCloseQrModal() {
        setShowQrModal(false);
        setQrImage("");
        setQrExpiresAt("");
        setQrToken("");
    }

    const now = Date.now();

    function hasChangeRequest(b) {
        return Array.isArray(b.reservationChangeRequests) && b.reservationChangeRequests.length > 0;
    }

    function isPastBooking(b) {
        return new Date(b.startsAt).getTime() < now;
    }

    const canEdit = (b) => {
        if (isPastBooking(b)) return false;
        return !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(b.status);
    };

    const canCancel = (b) => {
        if (isPastBooking(b)) return false;
        return !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(b.status);
    };

    const canShowQr = (b) => {
        return b.status === "CONFIRMED";
    };

    function handleRequestChange(reservationId) {
        navigate(`/customer/bookings/${reservationId}/edit`);
    }

    async function handleCancel(reservationId) {
        const ok = window.confirm("Cancel this booking?");
        if (!ok) return;

        setStatus("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/customer/reservations/${reservationId}/cancel`, {
                method: "PATCH",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Cancel failed");
                return;
            }

            setBookings((prev) =>
                prev.map((b) => (b.id === reservationId ? { ...b, status: "CANCELLED" } : b))
            );
        } catch (e) {
            console.error(e);
            setStatus("Network/server error");
        }
    }

    const upcoming = useMemo(
        () =>
            bookings.filter(
                (b) =>
                    new Date(b.startsAt).getTime() >= now &&
                    b.status === "CONFIRMED"
            ),
        [bookings, now]
    );

    const pending = useMemo(
        () =>
            bookings.filter(
                (b) =>
                    new Date(b.startsAt).getTime() >= now &&
                    (b.status === "PENDING" || hasChangeRequest(b))
            ),
        [bookings, now]
    );

    const past = useMemo(
        () => bookings.filter((b) => new Date(b.startsAt).getTime() < now),
        [bookings, now]
    );

    const shown = useMemo(() => {
        if (tab === "UPCOMING") return upcoming;
        if (tab === "PENDING") return pending;
        if (tab === "PAST") return past;
        return bookings;
    }, [tab, upcoming, pending, past, bookings]);

    const upcomingCount = upcoming.length;
    const pendingCount = pending.length;
    const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
    const pastCount = past.length;

    function getEmptyTitle() {
        if (tab === "UPCOMING") return "No upcoming bookings yet.";
        if (tab === "PENDING") return "No pending bookings yet.";
        if (tab === "PAST") return "No past bookings yet.";
        return "No bookings yet.";
    }

    function getEmptyText() {
        if (tab === "UPCOMING") {
            return "Confirmed future bookings will appear here.";
        }
        if (tab === "PENDING") {
            return "Bookings waiting for approval or with submitted change requests will appear here.";
        }
        if (tab === "PAST") {
            return "Completed and older reservations will appear here.";
        }
        return "Your reservations will appear here.";
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
            <div className="customer-bookings-page">
                <BookingsHeader />

                <BookingsSummaryCards
                    upcomingCount={upcomingCount}
                    pendingCount={pendingCount}
                    completedCount={completedCount}
                    pastCount={pastCount}
                />

                <BookingTabs
                    tab={tab}
                    setTab={setTab}
                    upcomingCount={upcomingCount}
                    pendingCount={pendingCount}
                    pastCount={pastCount}
                />

                {loading && <div className="bookings-feedback">Loading...</div>}
                {status && <div className="bookings-feedback bookings-feedback--status">{status}</div>}

                {!loading && !status && shown.length === 0 && (
                    <div className="bookings-empty-state">
                        <div className="bookings-empty-state__title">{getEmptyTitle()}</div>
                        <div className="bookings-empty-state__text">{getEmptyText()}</div>
                    </div>
                )}

                {!loading && !status && shown.length > 0 && (
                    <div className="bookings-grid">
                        {shown.map((b) => (
                            <BookingCard
                                key={b.id}
                                b={b}
                                canEdit={canEdit}
                                canCancel={canCancel}
                                canShowQr={canShowQr}
                                handleRequestChange={handleRequestChange}
                                handleShowQr={handleShowQr}
                                handleCancel={handleCancel}
                            />
                        ))}
                    </div>
                )}
            </div>

            <BookingQrModal
                showQrModal={showQrModal}
                qrImage={qrImage}
                qrToken={qrToken}
                qrExpiresAt={qrExpiresAt}
                handleCloseQrModal={handleCloseQrModal}
            />
        </AppLayout>
    );
}