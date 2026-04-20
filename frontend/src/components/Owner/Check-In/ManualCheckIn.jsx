import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TableVisual from "../Tables/TableVisual";

export default function ManualCheckIn() {
    const [guestName, setGuestName] = useState("");
    const [partySize, setPartySize] = useState(2);
    const [notes, setNotes] = useState("");
    const [selectedTable, setSelectedTable] = useState("");
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [checkInStatus, setCheckInStatus] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        async function loadTables() {
            try {
                setLoading(true);
                setCheckInStatus("");

                const token = localStorage.getItem("token");
                const res = await fetch(
                    `/api/owner/manual-check-in/options?partySize=${partySize}`,
                    {
                        headers: {
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                    }
                );

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setCheckInStatus(data?.error || "Failed to load available tables");
                    setTables([]);
                    return;
                }

                setTables(Array.isArray(data?.tables) ? data.tables : []);
            } catch (error) {
                console.error(error);
                setCheckInStatus("Failed to load available tables");
                setTables([]);
            } finally {
                setLoading(false);
            }
        }

        loadTables();
    }, [partySize]);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!guestName.trim()) {
            setCheckInStatus("Please enter a guest name.");
            return;
        }

        if (!selectedTable) {
            setCheckInStatus("Please select a table.");
            return;
        }

        try {
            setSubmitting(true);
            setCheckInStatus("");

            const token = localStorage.getItem("token");
            const res = await fetch("/api/owner/manual-check-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    guestName,
                    partySize,
                    tableId: selectedTable,
                    notes,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setCheckInStatus(data?.error || "Manual check-in failed");
                return;
            }

            setCheckInStatus("Guest checked in successfully.");
            setGuestName("");
            setPartySize(2);
            setNotes("");
            setSelectedTable("");

            setTimeout(() => {
                navigate("/owner/check-in/result", {
                    state: {
                        status: "Success",
                        message: "The guest has been checked in successfully!",
                    },
                });
            }, 2000);
        } catch (error) {
            console.error(error);
            setCheckInStatus("Server error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="checkin-section" onSubmit={handleSubmit}>
            <label>Guest name</label>
            <input
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Guest name"
            />

            <label>Party size</label>
            <input
                type="number"
                min="1"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
            />

            <label>Available tables</label>

            {loading ? (
                <div className="checkin-status">Loading tables...</div>
            ) : tables.length === 0 ? (
                <div className="checkin-empty-state">No tables available</div>
            ) : (
                <div className="checkin-table-grid">
                    {tables.map((table) => (
                        <button
                            key={table.id}
                            type="button"
                            onClick={() => setSelectedTable(table.id)}
                            className={`checkin-table-visual-button ${
                                selectedTable === table.id ? "is-selected" : ""
                            }`}
                        >
                            <div className="checkin-table-visual-card">
                                <TableVisual
                                    table={table}
                                    isSelected={selectedTable === table.id}
                                />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <label>Notes</label>
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes"
            />

            <button
                type="submit"
                className="sf-filterBtn"
                disabled={submitting || !selectedTable}
            >
                {submitting ? "Checking In..." : "Check In Guest"}
            </button>

            {checkInStatus && <div className="checkin-status">{checkInStatus}</div>}
        </form>
    );
}