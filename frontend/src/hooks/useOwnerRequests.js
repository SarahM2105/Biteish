import { useCallback, useEffect, useMemo, useState } from "react";
import { getSocket } from "../socket";

function toLocalInputValue(value) {
    if (!value) return "";
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
}

export default function useOwnerRequests() {
    const [loadingNew, setLoadingNew] = useState(false);
    const [loadingChanges, setLoadingChanges] = useState(false);
    const [status, setStatus] = useState("");
    const [reservations, setReservations] = useState([]);
    const [changeRequests, setChangeRequests] = useState([]);
    const [actingKey, setActingKey] = useState(null);

    const [showProposalModal, setShowProposalModal] = useState(false);
    const [selectedChangeRequest, setSelectedChangeRequest] = useState(null);
    const [proposalForm, setProposalForm] = useState({
        startsAt: "",
        endsAt: "",
        partySize: "",
        notes: "",
        tableId: "",
    });

    const [availableTables, setAvailableTables] = useState([]);
    const [loadingTables, setLoadingTables] = useState(false);

    const loadPendingBookings = useCallback(async () => {
        setStatus("");
        setLoadingNew(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/owner/reservations/pending", {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });

            const text = await res.text();
            let data = [];

            try {
                data = text ? JSON.parse(text) : [];
            } catch {
                setStatus("Bad response from server while loading bookings.");
                setReservations([]);
                return;
            }

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to load new bookings.");
                setReservations([]);
                return;
            }

            setReservations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setStatus("Network/server error while loading new bookings.");
            setReservations([]);
        } finally {
            setLoadingNew(false);
        }
    }, []);

    const loadPendingBookingUpdates = useCallback(async () => {
        setStatus("");
        setLoadingChanges(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/owner/change-request", {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });

            const text = await res.text();
            let data = [];

            try {
                data = text ? JSON.parse(text) : [];
            } catch {
                setStatus("Bad response from server while loading booking updates.");
                setChangeRequests([]);
                return;
            }

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to load booking update requests.");
                setChangeRequests([]);
                return;
            }

            setChangeRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setStatus("Network/server error while loading booking update requests.");
            setChangeRequests([]);
        } finally {
            setLoadingChanges(false);
        }
    }, []);

    useEffect(() => {
        loadPendingBookings();
        loadPendingBookingUpdates();
    }, [loadPendingBookings, loadPendingBookingUpdates]);

    useEffect(() => {
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");

        const socket = getSocket();
        socket.connect();

        socket.on("connect", () => {
            socket.emit("join", { role, userId });
        });

        const refreshRequests = () => {
            loadPendingBookings();
            loadPendingBookingUpdates();
        };

        socket.on("reservation:created", refreshRequests);
        socket.on("reservation:updated", refreshRequests);

        return () => {
            socket.off("reservation:created", refreshRequests);
            socket.off("reservation:updated", refreshRequests);
            socket.disconnect();
        };
    }, [loadPendingBookings, loadPendingBookingUpdates]);

    const pendingNew = useMemo(
        () => reservations.filter((reservation) => reservation.status === "PENDING"),
        [reservations]
    );

    const pendingChanges = useMemo(
        () => changeRequests.filter((request) => request.status === "PENDING"),
        [changeRequests]
    );

    async function approveNew(reservationId) {
        setStatus("");
        setActingKey(`new:${reservationId}`);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/reservations/${reservationId}/approve`, {
                method: "PATCH",
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Approve failed.");
                return;
            }

            setReservations((prev) =>
                prev.map((reservation) =>
                    reservation.id === reservationId
                        ? { ...reservation, status: "CONFIRMED" }
                        : reservation
                )
            );
        } catch (error) {
            console.error(error);
            setStatus("Network/server error approving booking.");
        } finally {
            setActingKey(null);
        }
    }

    async function declineNew(reservationId) {
        setStatus("");
        setActingKey(`new:${reservationId}`);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/reservations/${reservationId}/decline`, {
                method: "PATCH",
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Decline failed.");
                return;
            }

            setReservations((prev) =>
                prev.map((reservation) =>
                    reservation.id === reservationId
                        ? { ...reservation, status: "DECLINED" }
                        : reservation
                )
            );
        } catch (error) {
            console.error(error);
            setStatus("Network/server error declining booking.");
        } finally {
            setActingKey(null);
        }
    }

    async function approveChange(requestId) {
        setStatus("");
        setActingKey(`chg:${requestId}`);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/change-request/${requestId}/approve`, {
                method: "PATCH",
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Approve change failed.");
                return;
            }

            setChangeRequests((prev) =>
                prev.map((request) =>
                    request.id === requestId ? { ...request, status: "APPROVED" } : request
                )
            );
        } catch (error) {
            console.error(error);
            setStatus("Network/server error approving change request.");
        } finally {
            setActingKey(null);
        }
    }

    async function declineChange(requestId) {
        setStatus("");
        setActingKey(`chg:${requestId}`);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/change-request/${requestId}/decline`, {
                method: "PATCH",
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Decline change failed.");
                return;
            }

            setChangeRequests((prev) =>
                prev.map((request) =>
                    request.id === requestId ? { ...request, status: "DECLINED" } : request
                )
            );
        } catch (error) {
            console.error(error);
            setStatus("Network/server error declining change request.");
        } finally {
            setActingKey(null);
        }
    }

    async function openProposalModal(request) {
        const reservation = request.reservation;
        const restaurantId = reservation?.table?.restaurant?.id || reservation?.restaurantId;

        setSelectedChangeRequest(request);
        setProposalForm({
            startsAt: toLocalInputValue(request.newStartsAt || reservation?.startsAt),
            endsAt: toLocalInputValue(request.newEndsAt || reservation?.endsAt),
            partySize: String(request.newPartySize ?? reservation?.partySize ?? ""),
            notes: request.newNotes ?? reservation?.notes ?? "",
            tableId: request.newTableId || reservation?.tableId || "",
        });

        setShowProposalModal(true);
        setAvailableTables([]);

        if (!restaurantId) return;

        setLoadingTables(true);

        try {
            const token = localStorage.getItem("token");

            const zonesRes = await fetch(`/api/owner/restaurants/${restaurantId}/zones`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });
            const zonesData = await zonesRes.json().catch(() => []);

            if (!zonesRes.ok || !Array.isArray(zonesData)) {
                setLoadingTables(false);
                return;
            }

            const tableResponses = await Promise.all(
                zonesData.map((zone) =>
                    fetch(`/api/owner/zones/${zone.id}/tables`, {
                        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                    }).then(async (res) => ({
                        ok: res.ok,
                        zone,
                        data: await res.json().catch(() => []),
                    }))
                )
            );

            const flattened = tableResponses.flatMap(({ ok, zone, data }) => {
                if (!ok || !Array.isArray(data)) return [];
                return data.map((table) => ({
                    id: table.id,
                    name: table.name || `Table ${table.tableNumber || ""}`.trim(),
                    capacity: table.capacity,
                    zoneName: zone.name,
                }));
            });

            setAvailableTables(flattened);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingTables(false);
        }
    }

    function closeProposalModal() {
        setShowProposalModal(false);
        setSelectedChangeRequest(null);
        setAvailableTables([]);
        setLoadingTables(false);
        setProposalForm({
            startsAt: "",
            endsAt: "",
            partySize: "",
            notes: "",
            tableId: "",
        });
    }

    async function submitProposedChange() {
        const reservationId =
            selectedChangeRequest?.reservationId || selectedChangeRequest?.reservation?.id;

        if (!reservationId || !selectedChangeRequest) return;

        setStatus("");
        setActingKey(`proposal:${selectedChangeRequest.id}`);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/reservations/${reservationId}/change-request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    startsAt: proposalForm.startsAt
                        ? new Date(proposalForm.startsAt).toISOString()
                        : null,
                    endsAt: proposalForm.endsAt
                        ? new Date(proposalForm.endsAt).toISOString()
                        : null,
                    partySize: proposalForm.partySize ? Number(proposalForm.partySize) : null,
                    notes: proposalForm.notes,
                    tableId: proposalForm.tableId || null,
                    replaceActive: true,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to propose a different change.");
                return;
            }

            closeProposalModal();
            await loadPendingBookingUpdates();
        } catch (error) {
            console.error(error);
            setStatus("Network/server error while proposing a different change.");
        } finally {
            setActingKey(null);
        }
    }

    return {
        loadingNew,
        loadingChanges,
        status,
        actingKey,
        pendingNew,
        pendingChanges,
        approveNew,
        declineNew,
        approveChange,
        declineChange,
        showProposalModal,
        selectedChangeRequest,
        proposalForm,
        setProposalForm,
        openProposalModal,
        closeProposalModal,
        submitProposedChange,
        availableTables,
        loadingTables,
    };
}