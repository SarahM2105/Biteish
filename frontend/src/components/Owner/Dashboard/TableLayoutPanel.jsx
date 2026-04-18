import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LayoutCanvas from "../Tables/LayoutCanvas";
import "./css/TableLayoutPanel.css";

function formatTime(value) {
    if (!value) return "—";

    return new Date(value).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatDate(value) {
    if (!value) return "—";

    return new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
    });
}

function getStatusLabel(table) {
    if (!table) return "No table selected";
    if (table.active === false) return "Inactive";
    if (table.currentReservation?.checkedInAt) return "Occupied";
    if (Array.isArray(table.upcomingReservations) && table.upcomingReservations.length > 0) {
        return "Reserved";
    }
    return "Available";
}

export default function TableLayoutPanel({
                                             layoutSummary,
                                             zoneSummaries,
                                             zones,
                                         }) {
    const navigate = useNavigate();
    const [selectedTableId, setSelectedTableId] = useState(null);
    const [selectedZoneId, setSelectedZoneId] = useState(null);

    const hasFullLayout = Array.isArray(zones) && zones.length > 0;

    useEffect(() => {
        if (hasFullLayout && !selectedZoneId && zones.length > 0) {
            setSelectedZoneId(zones[0].id);
        }
    }, [hasFullLayout, selectedZoneId, zones]);

    const filteredZones = useMemo(() => {
        if (!hasFullLayout) return [];
        return zones.filter((zone) => zone.id === selectedZoneId);
    }, [hasFullLayout, zones, selectedZoneId]);

    const selectedTableDetails = useMemo(() => {
        for (const zone of zones || []) {
            const found = zone.tables?.find((table) => table.id === selectedTableId);
            if (found) {
                return {
                    ...found,
                    zoneName: zone.name,
                };
            }
        }
        return null;
    }, [zones, selectedTableId]);

    const tableSchedule = useMemo(() => {
        if (!selectedTableDetails) return [];

        const bookings = [];

        if (selectedTableDetails.currentReservation) {
            bookings.push({
                ...selectedTableDetails.currentReservation,
                scheduleType: selectedTableDetails.currentReservation.checkedInAt
                    ? "current"
                    : "next",
            });
        }

        if (Array.isArray(selectedTableDetails.upcomingReservations)) {
            selectedTableDetails.upcomingReservations.forEach((booking) => {
                const alreadyIncluded =
                    selectedTableDetails.currentReservation &&
                    booking.id === selectedTableDetails.currentReservation.id;

                if (!alreadyIncluded) {
                    bookings.push({
                        ...booking,
                        scheduleType: "upcoming",
                    });
                }
            });
        }

        return bookings
            .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
            .slice(0, 6);
    }, [selectedTableDetails]);

    return (
        <section className="owner-dashboard__panel owner-dashboard__panel--layout">
            <div className="owner-dashboard__panel-header">
                <div className="owner-dashboard__panel-header-copy">
                    <p className="owner-dashboard__eyebrow">Table layout</p>
                    <h2>Live floor overview</h2>
                    <p>
                        Monitor how busy your restaurant is and inspect bookings table by table.
                    </p>
                </div>

                <button
                    className="owner-dashboard__action-button"
                    onClick={() => navigate("/owner/restaurant-layout")}
                >
                    Manage layout
                </button>
            </div>

            {hasFullLayout ? (
                <>
                    <div className="owner-dashboard__zone-tabs">
                        {zones.map((zone) => (
                            <button
                                key={zone.id}
                                type="button"
                                className={`owner-dashboard__zone-tab ${
                                    selectedZoneId === zone.id ? "is-active" : ""
                                }`}
                                onClick={() => {
                                    setSelectedZoneId(zone.id);
                                    setSelectedTableId(null);
                                }}
                            >
                                {zone.name}
                            </button>
                        ))}
                    </div>

                    <div className="owner-dashboard__layout-shell">
                        <div className="owner-dashboard__layout-preview">
                            <LayoutCanvas
                                zones={filteredZones}
                                selectedTableId={selectedTableId}
                                onSelectTable={setSelectedTableId}
                                mode="owner"
                            />
                        </div>

                        <aside className="owner-dashboard__layout-sidebar">
                            <div className="owner-dashboard__layout-sidebar-card">
                                <p className="owner-dashboard__eyebrow">Selected table</p>

                                {selectedTableDetails ? (
                                    <>
                                        <div className="owner-dashboard__table-heading">
                                            <div>
                                                <h3>{selectedTableDetails.name}</h3>
                                                <p>
                                                    {selectedTableDetails.zoneName} · {selectedTableDetails.capacity} seats
                                                </p>
                                            </div>

                                            <span
                                                className={`owner-dashboard__table-status owner-dashboard__table-status--${getStatusLabel(
                                                    selectedTableDetails
                                                ).toLowerCase()}`}
                                            >
                                                {getStatusLabel(selectedTableDetails)}
                                            </span>
                                        </div>

                                        {tableSchedule.length > 0 ? (
                                            <div className="owner-dashboard__table-timetable">
                                                {tableSchedule.map((booking) => (
                                                    <div
                                                        key={booking.id}
                                                        className="owner-dashboard__table-timetable-row"
                                                    >
                                                        <div className="owner-dashboard__table-timetable-time">
                                                            <strong>{formatTime(booking.startsAt)}</strong>
                                                            <span>{formatTime(booking.endsAt)}</span>
                                                        </div>

                                                        <div className="owner-dashboard__table-timetable-main">
                                                            <div className="owner-dashboard__table-timetable-top">
                                                                <strong>{booking.customerName || "Customer"}</strong>
                                                                <span>
                                                                    {booking.partySize || "—"} guests
                                                                </span>
                                                            </div>

                                                            <div className="owner-dashboard__table-timetable-meta">
                                                                <span>{formatDate(booking.startsAt)}</span>
                                                                <span
                                                                    className={`owner-dashboard__table-timetable-badge owner-dashboard__table-timetable-badge--${booking.scheduleType}`}
                                                                >
                                                                    {booking.scheduleType === "current"
                                                                        ? "Current"
                                                                        : booking.scheduleType === "next"
                                                                            ? "Next"
                                                                            : "Upcoming"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="owner-dashboard__layout-empty-state">
                                                <h3>{selectedTableDetails.name}</h3>
                                                <p>No bookings scheduled for this table right now.</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="owner-dashboard__layout-empty-state">
                                        <h3>No table selected</h3>
                                        <p>Click a table to view its booking details and timings.</p>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>

                    <div className="owner-dashboard__layout-legend owner-dashboard__layout-legend--bottom">
                        <span className="owner-dashboard__legend-item">
                            <span className="owner-dashboard__legend-dot owner-dashboard__legend-dot--available" />
                            Available
                        </span>
                        <span className="owner-dashboard__legend-item">
                            <span className="owner-dashboard__legend-dot owner-dashboard__legend-dot--reserved" />
                            Reserved
                        </span>
                        <span className="owner-dashboard__legend-item">
                            <span className="owner-dashboard__legend-dot owner-dashboard__legend-dot--occupied" />
                            Occupied
                        </span>
                        <span className="owner-dashboard__legend-item">
                            <span className="owner-dashboard__legend-dot owner-dashboard__legend-dot--inactive" />
                            Inactive
                        </span>
                    </div>
                </>
            ) : (
                <div className="owner-dashboard__layout-fallback">
                    <div className="owner-dashboard__layout-summary">
                        <div>
                            <strong>{layoutSummary?.totalTables || 0}</strong>
                            <span>Total tables</span>
                        </div>

                        <div>
                            <strong>{layoutSummary?.activeTables || 0}</strong>
                            <span>Active</span>
                        </div>

                        <div>
                            <strong>{layoutSummary?.occupiedTables || 0}</strong>
                            <span>Occupied</span>
                        </div>

                        <div>
                            <strong>{zoneSummaries?.length || 0}</strong>
                            <span>Zones</span>
                        </div>
                    </div>

                    <div className="owner-dashboard__layout-placeholder">
                        <p>
                            Full layout preview will appear here once table data is available.
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
}