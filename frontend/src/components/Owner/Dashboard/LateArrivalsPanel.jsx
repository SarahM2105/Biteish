import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../utils/authFetch";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";
import "./css/LateArrivalsPanel.css";

export default function LateArrivalsPanel() {
    const navigate = useNavigate();

    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [processingId, setProcessingId] = useState("");

    async function loadLateArrivals() {
        try {
            setLoading(true);
            setStatus("");

            const res = await authFetch("/api/owner/dashboard/late-arrivals");
            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(getApiErrorMessage(data, "Failed to load late arrivals."));
                setReservations([]);
                return;
            }

            setReservations(Array.isArray(data?.reservations) ? data.reservations : []);
        } catch (error) {
            console.error(error);
            setStatus("Failed to load late arrivals.");
            setReservations([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadLateArrivals();
    }, []);

    function handleCheckIn() {
        navigate("/owner/check-ins");
    }

    async function handleNoShow(id) {
        try {
            setProcessingId(id);
            setStatus("");

            const res = await authFetch("/api/owner/no-shows/mark", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reservationId: id }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(getApiErrorMessage(data, "Failed to mark no show."));
                return;
            }

            setReservations((prev) => prev.filter((reservation) => reservation.id !== id));
            setStatus("Reservation marked as no-show.");
        } catch (error) {
            console.error(error);
            setStatus("Server error.");
        } finally {
            setProcessingId("");
        }
    }

    return (
        <section className="owner-panel">
            <div className="owner-panel-kicker">Needs Attention</div>
            <h3>Late Arrivals</h3>

            {loading ? (
                <div className="owner-empty-state">Loading late arrivals...</div>
            ) : reservations.length === 0 ? (
                <div className="owner-late-empty">
                    No late arrivals right now.
                </div>
            ) : (
                <div className="owner-late-list">
                    {reservations.map((reservation) => (
                        <div key={reservation.id} className="owner-late-card">
                            <div className="owner-late-card__main">
                                <strong>{reservation.customerName}</strong>
                                <p>
                                    {reservation.tableName} · {reservation.partySize} guests
                                </p>
                            </div>

                            <div className="owner-late-card__side">
                                <div className="owner-late-card__time">
                                    Late by {reservation.minutesLate} mins
                                </div>

                                <div className="owner-late-actions">
                                    <button
                                        type="button"
                                        className="owner-late-btn owner-late-btn--primary"
                                        onClick={handleCheckIn}
                                        disabled={processingId === reservation.id}
                                    >
                                        Check In
                                    </button>

                                    <button
                                        type="button"
                                        className="owner-late-btn owner-late-btn--danger"
                                        onClick={() => handleNoShow(reservation.id)}
                                        disabled={processingId === reservation.id}
                                    >
                                        {processingId === reservation.id ? "Saving..." : "No Show"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {status ? <div className="owner-empty-state">{status}</div> : null}
        </section>
    );
}