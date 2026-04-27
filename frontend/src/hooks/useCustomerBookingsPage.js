import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toDateKey } from "../components/Customer/MyBookings/dateHelpers";
import {
    canCancelBooking,
    canEditBooking,
    canShowQrForBooking,
    hasOutgoingChangeRequest,
} from "../components/Customer/MyBookings/bookingHelpers";
import { authFetch } from "../components/utils/authFetch";
import { getApiErrorMessage } from "../components/utils/getApiErrorMessage";

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
            const res = await authFetch("/api/customer/reservations");
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(getApiErrorMessage(data, "Failed to load bookings."));
                setBookings([]);
                return;
            }

            setBookings(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setStatus("Network/server error");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadIncomingRequests = useCallback(async () => {
        setLoadingIncomingRequests(true);
        setIncomingStatus("");

        try {
            const res = await authFetch("/api/customer/change-request");
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setIncomingStatus(
                    getApiErrorMessage(
                        data,
                        "Failed to load booking change requests."
                    )
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
            const res = await authFetch(`/api/customer/reservations/${reservationId}/qr`);
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(getApiErrorMessage(data, "Failed to load QR code."));
                return;
            }

            setQrImage(data.qrImage || "");
            setQrExpiresAt(data.expiresAt || "");
            setQrToken(data.qrToken || "");
            setShowQrModal(true);
        } catch (error) {
            console.error(error);
            setStatus("Network/server error loading QR code");
        }
    }

    async function handleCancel(reservationId) {
        if (!window.confirm("Cancel this booking?")) return;

        setStatus("");

        try {
            const res = await authFetch(`/api/customer/reservations/${reservationId}/cancel`, {
                method: "PATCH",
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(getApiErrorMessage(data, "Cancel failed."));
                return;
            }

            setBookings((prev) =>
                prev.map((booking) =>
                    booking.id === reservationId
                        ? { ...booking, status: "CANCELLED" }
                        : booking
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
            const res = await authFetch(`/api/customer/change-request/${requestId}/approve`, {
                method: "PATCH",
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setIncomingStatus(
                    getApiErrorMessage(data, "Failed to approve change request.")
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
            const res = await authFetch(`/api/customer/change-request/${requestId}/decline`, {
                method: "PATCH",
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setIncomingStatus(
                    getApiErrorMessage(data, "Failed to decline change request.")
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
        () =>
            bookings.filter(
                (booking) => new Date(booking.startsAt).getTime() < now
            ).length,
        [bookings, now]
    );

    const completedCount = useMemo(
        () => bookings.filter((booking) => booking.status === "COMPLETED").length,
        [bookings]
    );

    const confirmedShown = useMemo(
        () =>
            selectedDate
                ? upcomingConfirmed.filter(
                    (booking) => toDateKey(booking.startsAt) === selectedDate
                )
                : upcomingConfirmed,
        [upcomingConfirmed, selectedDate]
    );

    const pendingShown = useMemo(
        () =>
            selectedDate
                ? pendingBookings.filter(
                    (booking) => toDateKey(booking.startsAt) === selectedDate
                )
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

            if (
                booking.status === "CONFIRMED" &&
                !hasOutgoingChangeRequest(booking, userId)
            ) {
                acc[key].confirmed += 1;
            }

            if (
                booking.status === "PENDING" ||
                hasOutgoingChangeRequest(booking, userId)
            ) {
                acc[key].pending += 1;
            }

            if (booking.status === "COMPLETED") {
                acc[key].completed += 1;
            }

            return acc;
        }, {});
    }, [bookings, userId]);

    const noResultsForDate =
        selectedDate && !confirmedShown.length && !pendingShown.length;

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