import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import { logout } from "../../components/utils/logout";
import { useTheme } from "../../ThemeContext";
import BookingsHeader from "../../components/Customer/MyBookings/Header";
import BookingsSummaryCards from "../../components/Customer/MyBookings/SummaryCards";
import BookingCard from "../../components/Customer/MyBookings/BookingCard";
import BookingQrModal from "../../components/Customer/MyBookings/QRModal";
import BookingDateStrip from "../../components/Customer/MyBookings/BookingDateStrip";
import "../../components/Customer/MyBookings/css/MyBookingPage.css";
import "../../components/Customer/MyBookings/css/BookingTheme.css";
import "../../components/Customer/MyBookings/css/QRModal.css";
import "../../components/Customer/MyBookings/css/Responsive.css";
import "../../components/Customer/MyBookings/css/BookingCard.css";
import "../../components/Customer/MyBookings/css/BookingDateStrip.css";
import "../../components/Customer/MyBookings/css/BookingSections.css";
const CLOSED_STATUSES = ["CANCELLED", "COMPLETED", "NO_SHOW"];

function toDateKey(value) {
    const d = new Date(value);
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
}

function formatSelectedDate(value) {
    if (!value) return "";
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function EmptySection({ title, text }) {
    return (
        <div className="bookings-empty-state bookings-empty-state--section">
            <div className="bookings-empty-state__title">{title}</div>
            <div className="bookings-empty-state__text">{text}</div>
        </div>
    );
}

export default function CustomerBookings() {
    const name = localStorage.getItem("name") || "customer";
    const navigate = useNavigate();
    const now = Date.now();
    const { isDarkMode, setIsDarkMode } = useTheme();

    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("My Bookings");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [confirmedOpen, setConfirmedOpen] = useState(true);
    const [pendingOpen, setPendingOpen] = useState(true);
    const [qrImage, setQrImage] = useState("");
    const [qrExpiresAt, setQrExpiresAt] = useState("");
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrToken, setQrToken] = useState("");

    function handleNavigate(label) {
        if (label === "Logout") return logout(navigate);
        setActive(label);
    }

    function hasChangeRequest(booking) {
        return Array.isArray(booking.reservationChangeRequests) && booking.reservationChangeRequests.length > 0;
    }

    function isPastBooking(booking) {
        return new Date(booking.startsAt).getTime() < now;
    }

    function canEdit(booking) {
        return !isPastBooking(booking) && !CLOSED_STATUSES.includes(booking.status);
    }

    function canCancel(booking) {
        return !isPastBooking(booking) && !CLOSED_STATUSES.includes(booking.status);
    }

    function canShowQr(booking) {
        return booking.status === "CONFIRMED";
    }

    function handleRequestChange(reservationId) {
        navigate(`/customer/bookings/${reservationId}/edit`);
    }

    function handleCloseQrModal() {
        setShowQrModal(false);
        setQrImage("");
        setQrExpiresAt("");
        setQrToken("");
    }

    useEffect(() => {
        (async () => {
            setLoading(true);
            setStatus("");

            try {
                const token = localStorage.getItem("token");
                const res = await fetch("/api/customer/reservations", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                if (!res.ok) {
                    setStatus(data?.error || "Failed to load");
                    setBookings([]);
                    return;
                }

                setBookings(Array.isArray(data) ? data : []);
            } catch {
                setStatus("Network error");
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
                headers: token ? { Authorization: `Bearer ${token}` } : {},
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

    async function handleCancel(reservationId) {
        if (!window.confirm("Cancel this booking?")) return;

        setStatus("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/customer/reservations/${reservationId}/cancel`, {
                method: "PATCH",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Cancel failed");
                return;
            }

            setBookings((prev) =>
                prev.map((booking) =>
                    booking.id === reservationId ? { ...booking, status: "CANCELLED" } : booking
                )
            );
        } catch (error) {
            console.error(error);
            setStatus("Network/server error");
        }
    }

    const upcomingConfirmed = useMemo(
        () => bookings.filter((b) => new Date(b.startsAt).getTime() >= now && b.status === "CONFIRMED"),
        [bookings, now]
    );

    const pendingBookings = useMemo(
        () =>
            bookings.filter(
                (b) =>
                    new Date(b.startsAt).getTime() >= now &&
                    (b.status === "PENDING" || hasChangeRequest(b))
            ),
        [bookings, now]
    );

    const pastCount = useMemo(
        () => bookings.filter((b) => new Date(b.startsAt).getTime() < now).length,
        [bookings, now]
    );

    const completedCount = useMemo(
        () => bookings.filter((b) => b.status === "COMPLETED").length,
        [bookings]
    );

    const confirmedShown = useMemo(
        () =>
            selectedDate
                ? upcomingConfirmed.filter((b) => toDateKey(b.startsAt) === selectedDate)
                : upcomingConfirmed,
        [upcomingConfirmed, selectedDate]
    );

    const pendingShown = useMemo(
        () =>
            selectedDate
                ? pendingBookings.filter((b) => toDateKey(b.startsAt) === selectedDate)
                : pendingBookings,
        [pendingBookings, selectedDate]
    );

    const bookingDateSummary = useMemo(() => {
        return bookings.reduce((acc, booking) => {
            const key = toDateKey(booking.startsAt);

            if (!acc[key]) {
                acc[key] = { total: 0, confirmed: 0, pending: 0, completed: 0 };
            }

            acc[key].total += 1;
            if (booking.status === "CONFIRMED") acc[key].confirmed += 1;
            if (booking.status === "PENDING" || hasChangeRequest(booking)) acc[key].pending += 1;
            if (booking.status === "COMPLETED") acc[key].completed += 1;

            return acc;
        }, {});
    }, [bookings]);

    const noResultsForDate = selectedDate && !confirmedShown.length && !pendingShown.length;

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
                    upcomingCount={upcomingConfirmed.length}
                    pendingCount={pendingBookings.length}
                    completedCount={completedCount}
                    pastCount={pastCount}
                />

                <BookingDateStrip
                    summary={bookingDateSummary}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    onClearDate={() => setSelectedDate("")}
                />

                {selectedDate && !loading && !status && (
                    <div className="bookings-feedback">
                        Showing bookings for {formatSelectedDate(selectedDate)}
                    </div>
                )}

                {loading && <div className="bookings-feedback">Loading...</div>}
                {status && <div className="bookings-feedback bookings-feedback--status">{status}</div>}

                {!loading && !status && noResultsForDate && (
                    <div className="bookings-empty-state">
                        <div className="bookings-empty-state__title">No bookings on this date.</div>
                        <div className="bookings-empty-state__text">
                            Try another day or clear the date filter to see more reservations.
                        </div>
                    </div>
                )}

                {!loading && !status && !noResultsForDate && (
                    <div className="bookings-sections">
                        <section className="bookings-section bookings-section--confirmed">
                            <button
                                type="button"
                                className={`bookings-section__header ${confirmedOpen ? "is-open" : ""}`}
                                onClick={() => setConfirmedOpen((prev) => !prev)}
                            >
                                <div className="bookings-section__title-wrap">
                                    <span className="bookings-section__title">Confirmed Bookings</span>
                                    <span className="bookings-section__subtitle">
                                        Upcoming confirmed reservations
                                    </span>
                                </div>

                                <div className="bookings-section__header-right">
                                    <span className="bookings-section__badge bookings-section__badge--confirmed">
                                        {confirmedShown.length}
                                    </span>
                                    <span className="bookings-section__toggle">
                                        {confirmedOpen ? "−" : "+"}
                                    </span>
                                </div>
                            </button>

                            {confirmedOpen &&
                                (confirmedShown.length ? (
                                    <div className="bookings-grid">
                                        {confirmedShown.map((booking) => (
                                            <BookingCard
                                                key={booking.id}
                                                b={booking}
                                                canEdit={canEdit}
                                                canCancel={canCancel}
                                                canShowQr={canShowQr}
                                                handleRequestChange={handleRequestChange}
                                                handleShowQr={handleShowQr}
                                                handleCancel={handleCancel}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptySection
                                        title="No confirmed bookings to show."
                                        text="Confirmed upcoming reservations will appear here."
                                    />
                                ))}
                        </section>

                        <section className="bookings-section bookings-section--pending">
                            <button
                                type="button"
                                className={`bookings-section__header ${pendingOpen ? "is-open" : ""}`}
                                onClick={() => setPendingOpen((prev) => !prev)}
                            >
                                <div className="bookings-section__title-wrap">
                                    <span className="bookings-section__title">Pending Requests</span>
                                    <span className="bookings-section__subtitle">
                                        Waiting for approval or review
                                    </span>
                                </div>

                                <div className="bookings-section__header-right">
                                    <span className="bookings-section__badge bookings-section__badge--pending">
                                        {pendingShown.length}
                                    </span>
                                    <span className="bookings-section__toggle">
                                        {pendingOpen ? "−" : "+"}
                                    </span>
                                </div>
                            </button>

                            {pendingOpen &&
                                (pendingShown.length ? (
                                    <div className="bookings-grid">
                                        {pendingShown.map((booking) => (
                                            <BookingCard
                                                key={booking.id}
                                                b={booking}
                                                canEdit={canEdit}
                                                canCancel={canCancel}
                                                canShowQr={canShowQr}
                                                handleRequestChange={handleRequestChange}
                                                handleShowQr={handleShowQr}
                                                handleCancel={handleCancel}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptySection
                                        title="No pending requests to show."
                                        text="Pending bookings and change requests will appear here."
                                    />
                                ))}
                        </section>
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