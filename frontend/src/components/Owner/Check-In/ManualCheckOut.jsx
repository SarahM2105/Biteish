import React, { useEffect, useState } from "react";
import TableVisual from "../Tables/TableVisual";

export default function ManualCheckOut() {
    const [selectedTable, setSelectedTable] = useState("");
    const [tables, setTables] = useState([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function loadTables() {
            try {
                setLoading(true);
                setStatus("");

                const token = localStorage.getItem("token");

                const res = await fetch("/api/owner/manual-check-out/options", {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setStatus(data?.error || "Failed to load occupied tables.");
                    setTables([]);
                    return;
                }

                const nextTables = Array.isArray(data?.tables)
                    ? data.tables.map((table) => ({
                        ...table,
                        capacity: table.capacity ?? 1,
                    }))
                    : [];

                setTables(nextTables);
                setSelectedTable("");
            } catch (error) {
                console.error(error);
                setStatus("Failed to load occupied tables.");
                setTables([]);
            } finally {
                setLoading(false);
            }
        }

        loadTables();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!selectedTable) {
            setStatus("Please select an occupied table.");
            return;
        }

        try {
            setSubmitting(true);
            setStatus("");

            const token = localStorage.getItem("token");

            const res = await fetch("/api/owner/manual-check-out", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    tableId: selectedTable,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || "Check out failed.");
                return;
            }

            const checkedOutTable = tables.find((table) => table.id === selectedTable);

            setStatus(
                checkedOutTable
                    ? `${checkedOutTable.name} checked out successfully.`
                    : "Table checked out successfully."
            );

            setTables((prev) => prev.filter((table) => table.id !== selectedTable));
            setSelectedTable("");

            setTimeout(() => {
                setStatus("");
            }, 5000);
        } catch (error) {
            console.error(error);
            setStatus("Server error.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className="checkin-section" onSubmit={handleSubmit}>
            <label>Occupied tables</label>

            <p className="checkin-helper-text">
                Select a table that is currently occupied to complete the guest visit.
            </p>

            {loading ? (
                <div className="checkin-status">Loading occupied tables...</div>
            ) : tables.length === 0 ? (
                <div className="checkin-empty-state">No occupied tables right now.</div>
            ) : (
                <div className="checkin-table-grid">
                    {tables.map((table) => (
                        <button
                            key={table.id}
                            type="button"
                            className={`checkin-table-visual-button ${
                                selectedTable === table.id ? "is-selected" : ""
                            }`}
                            onClick={() => setSelectedTable(table.id)}
                        >
                            <div className="checkin-table-visual-card">
                                <TableVisual
                                    table={table}
                                    isSelected={selectedTable === table.id}
                                    status="OCCUPIED"
                                />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            <button
                type="submit"
                className="sf-filterBtn"
                disabled={submitting || !selectedTable || loading || tables.length === 0}
            >
                {submitting ? "Checking out..." : "Check Out Table"}
            </button>

            {status ? <div className="checkin-status">{status}</div> : null}
        </form>
    );
}