import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toDateKey } from "../components/Customer/MyBookings/dateHelpers";
import {
    canCancelBooking,
    canEditBooking,
    canShowQrForBooking,
    hasOutgoingChangeRequest,
} from "../components/Customer/MyBookings/bookingHelpers";

export default function useCustomerBookingsPage() {
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();
    const now = Date.now();

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

    const [incomingRequests, setIncomingRequests] = useState([]);
    const [loadingIncomingRequests, setLoadingIncomingRequests] = useState(false);
    const [incomingStatus, setIncomingStatus] = useState("");
    const [actingIncomingKey, setActingIncomingKey] = useState(null);
    const [selectedIncomingRequest, setSelectedIncomingRequest] = useState(null);

    function canEdit(booking) {
        return canEditBooking(booking, now);
    }

    function canCancel(booking) {
        return canCancelBooking(booking, now);
    }

    function canShowQr(booking) {
        return canShowQrForBooking(booking);
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

    const loadBookings = useCallback(async () => {
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
        } catch (error) {
            console.error(error);
            setStatus("Network error");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadIncomingRequests = useCallback(async () => {
        setLoadingIncomingRequests(true);
        setIncomingStatus("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/customer/change-request", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json().catch(() => []);

            if (!res.ok) {
                setIncomingStatus(
                    data?.error || data?.message || "Failed to load booking change requests"
                );
                setIncomingRequests([]);
                return;
            }

            setIncomingRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setIncomingStatus("Network/server error while loading booking change requests");
            setIncomingRequests([]);
        } finally {
            setLoadingIncomingRequests(false);
        }
    }, []);

    useEffect(() => {
        loadBookings();
        loadIncomingRequests();
    }, [loadBookings, loadIncomingRequests]);

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

    async function handleApproveIncomingRequest(requestId) {
        setIncomingStatus("");
        setActingIncomingKey(`approve:${requestId}`);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/customer/change-request/${requestId}/approve`, {
                method: "PATCH",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setIncomingStatus(
                    data?.error || data?.message || "Failed to approve change request"
                );
                return;
            }

            setSelectedIncomingRequest(null);
            await loadIncomingRequests();
            await loadBookings();
        } catch (error) {
            console.error(error);
            setIncomingStatus("Network/server error while approving change request");
        } finally {
            setActingIncomingKey(null);
        }
    }

    async function handleDeclineIncomingRequest(requestId) {
        setIncomingStatus("");
        setActingIncomingKey(`decline:${requestId}`);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/customer/change-request/${requestId}/decline`, {
                method: "PATCH",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setIncomingStatus(
                    data?.error || data?.message || "Failed to decline change request"
                );
                return;
            }

            setSelectedIncomingRequest(null);
            await loadIncomingRequests();
            await loadBookings();
        } catch (error) {
            console.error(error);
            setIncomingStatus("Network/server error while declining change request");
        } finally {
            setActingIncomingKey(null);
        }
    }

    const upcomingConfirmed = useMemo(
        () =>
            bookings.filter(
                (booking) =>
                    new Date(booking.startsAt).getTime() >= now &&
                    booking.status === "CONFIRMED" &&
                    !hasOutgoingChangeRequest(booking, userId)
            ),
        [bookings, now, userId]
    );

    const pendingBookings = useMemo(
        () =>
            bookings.filter(
                (booking) =>
                    new Date(booking.startsAt).getTime() >= now &&
                    (booking.status === "PENDING" ||
                        hasOutgoingChangeRequest(booking, userId))
            ),
        [bookings, now, userId]
    );

    const pastCount = useMemo(
        () => bookings.filter((booking) => new Date(booking.startsAt).getTime() < now).length,
        [bookings, now]
    );

    const completedCount = useMemo(
        () => bookings.filter((booking) => booking.status === "COMPLETED").length,
        [bookings]
    );

    const confirmedShown = useMemo(
        () =>
            selectedDate
                ? upcomingConfirmed.filter((booking) => toDateKey(booking.startsAt) === selectedDate)
                : upcomingConfirmed,
        [upcomingConfirmed, selectedDate]
    );

    const pendingShown = useMemo(
        () =>
            selectedDate
                ? pendingBookings.filter((booking) => toDateKey(booking.startsAt) === selectedDate)
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

            if (booking.status === "CONFIRMED" && !hasOutgoingChangeRequest(booking, userId)) {
                acc[key].confirmed += 1;
            }

            if (booking.status === "PENDING" || hasOutgoingChangeRequest(booking, userId)) {
                acc[key].pending += 1;
            }

            if (booking.status === "COMPLETED") {
                acc[key].completed += 1;
            }

            return acc;
        }, {});
    }, [bookings, userId]);

    const noResultsForDate = selectedDate && !confirmedShown.length && !pendingShown.length;

    return {
        status,
        loading,
        selectedDate,
        setSelectedDate,
        confirmedOpen,
        setConfirmedOpen,
        pendingOpen,
        setPendingOpen,
        qrImage,
        qrExpiresAt,
        showQrModal,
        qrToken,
        incomingRequests,
        loadingIncomingRequests,
        incomingStatus,
        actingIncomingKey,
        selectedIncomingRequest,
        setSelectedIncomingRequest,
        upcomingConfirmed,
        pendingBookings,
        completedCount,
        pastCount,
        confirmedShown,
        pendingShown,
        bookingDateSummary,
        noResultsForDate,
        canEdit,
        canCancel,
        canShowQr,
        handleRequestChange,
        handleShowQr,
        handleCancel,
        handleCloseQrModal,
        handleApproveIncomingRequest,
        handleDeclineIncomingRequest,
    };
}