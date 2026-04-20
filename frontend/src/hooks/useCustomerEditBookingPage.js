import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    formatDateTime,
    toLocalDateInput,
    toLocalTimeInput,
} from "../components/Customer/EditBooking/editBookingHelpers";

export default function useCustomerEditBookingPage() {
    const currentUserId = localStorage.getItem("userId");
    const { reservationId } = useParams();
    const navigate = useNavigate();

    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [durationMins, setDurationMins] = useState(120);
    const [partySize, setPartySize] = useState(2);
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [booking, setBooking] = useState(null);

    const activePendingRequest = useMemo(() => {
        return (
            booking?.ReservationChangeRequest?.find(
                (request) => request.status === "PENDING"
            ) || null
        );
    }, [booking]);

    const isOwnPendingRequest = useMemo(() => {
        if (!activePendingRequest) return false;
        return String(activePendingRequest.requestedById) === String(currentUserId);
    }, [activePendingRequest, currentUserId]);

    const isIncomingOwnerRequest = Boolean(activePendingRequest && !isOwnPendingRequest);

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
                    ? data.find((reservation) => reservation.id === reservationId)
                    : null;

                if (!foundBooking) {
                    setStatus("Booking not found");
                    setLoading(false);
                    return;
                }

                setBooking(foundBooking);

                const start = new Date(foundBooking.startsAt);
                const end = new Date(foundBooking.endsAt);

                setDate(toLocalDateInput(start));
                setTime(toLocalTimeInput(start));
                setDurationMins((end - start) / 60000);
                setPartySize(foundBooking.partySize);
                setNotes(foundBooking.notes || "");
            } catch (error) {
                console.error(error);
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

    async function handleSubmit(event) {
        event.preventDefault();

        if (activePendingRequest) {
            setStatus(
                isOwnPendingRequest
                    ? "You already have a pending change request. Cancel it first to submit another."
                    : "The restaurant already has a pending change request for this booking. Review that request before sending your own."
            );
            return;
        }

        setSubmitting(true);
        setStatus("");

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`/api/customer/reservations/${reservationId}/update`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    startsAt: startsAtISO,
                    endsAt: endsAtISO,
                    partySize,
                    notes,
                    replaceActive: false,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Update failed");
                return;
            }

            setStatus("Change request submitted for approval.");

            setBooking((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    ReservationChangeRequest: [
                        ...(prev.ReservationChangeRequest || []),
                        data.request,
                    ],
                };
            });
        } catch (error) {
            console.error(error);
            setStatus("Server error");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleCancelCurrentRequest() {
        if (!activePendingRequest || !isOwnPendingRequest) return;
        if (!window.confirm("Cancel your current change request?")) return;

        setSubmitting(true);
        setStatus("");

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `/api/customer/change-request/${activePendingRequest.id}/cancel`,
                {
                    method: "PATCH",
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(
                    data?.error || data?.message || "Failed to cancel current change request"
                );
                return;
            }

            setStatus("Current change request cancelled. You can now submit a new one.");

            setBooking((prev) => {
                if (!prev) return prev;

                return {
                    ...prev,
                    ReservationChangeRequest: (prev.ReservationChangeRequest || []).map(
                        (request) =>
                            request.id === activePendingRequest.id
                                ? { ...request, status: "DECLINED" }
                                : request
                    ),
                };
            });
        } catch (error) {
            console.error(error);
            setStatus("Server error");
        } finally {
            setSubmitting(false);
        }
    }

    function handleBackToBookings() {
        navigate("/customer/myBookings");
    }

    return {
        booking,
        loading,
        status,
        submitting,
        date,
        setDate,
        time,
        setTime,
        durationMins,
        setDurationMins,
        partySize,
        setPartySize,
        notes,
        setNotes,
        activePendingRequest,
        isOwnPendingRequest,
        isIncomingOwnerRequest,
        startsAtISO,
        endsAtISO,
        handleSubmit,
        handleCancelCurrentRequest,
        handleBackToBookings,
        formatDateTime,
    };
}