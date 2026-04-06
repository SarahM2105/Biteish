import React, { useEffect, useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";

export default function OwnerRestaurantLayout() {
    const name = localStorage.getItem("name") || "owner";
    const active = "Zones and Tables";

    const [restaurant, setRestaurant] = useState(null);
    const [zones, setZones] = useState([]);
    const [tablesByZone, setTablesByZone] = useState({});
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const [showZoneForm, setShowZoneForm] = useState(false);
    const [creatingZone, setCreatingZone] = useState(false);
    const [zoneName, setZoneName] = useState("");
    const [zoneDesc, setZoneDesc] = useState("");

    const [openTableZoneId, setOpenTableZoneId] = useState(null);
    const [creatingTableForZone, setCreatingTableForZone] = useState(null);
    const [tableDraftByZone, setTableDraftByZone] = useState({});

    const [editingZoneId, setEditingZoneId] = useState(null);
    const [zoneEditDraft, setZoneEditDraft] = useState({ name: "", description: "" });
    const [savingZoneId, setSavingZoneId] = useState(null);

    const [editingTableId, setEditingTableId] = useState(null);
    const [tableEditDraft, setTableEditDraft] = useState({
        name: "",
        capacity: 2,
        reservable: true,
        active: true,
    });
    const [savingTableId, setSavingTableId] = useState(null);

    const [deletingZoneId, setDeletingZoneId] = useState(null);
    const [deletingTableId, setDeletingTableId] = useState(null);

    const [unavsByTable, setUnavsByTable] = useState({});
    const [openUnavTableId, setOpenUnavTableId] = useState(null);
    const [unavDraftByTable, setUnavDraftByTable] = useState({});
    const [creatingUnavForTable, setCreatingUnavForTable] = useState(null);
    const [deletingUnavId, setDeletingUnavId] = useState(null);

    function getDraft(zoneId) {
        return (
            tableDraftByZone[zoneId] || {
                name: "",
                capacity: 2,
                reservable: true,
                active: true,
            }
        );
    }

    function updateDraft(zoneId, patch) {
        setTableDraftByZone((prev) => ({
            ...prev,
            [zoneId]: { ...getDraft(zoneId), ...patch },
        }));
    }

    function fmtDT(v) {
        if (!v) return "—";
        return new Date(v).toLocaleString("en-GB");
    }

    function getUnavDraft(tableId) {
        return (
            unavDraftByTable[tableId] || {
                startDate: "",
                startTime: "",
                endDate: "",
                endTime: "",
                reason: "",
            }
        );
    }

    function setUnavDraft(tableId, patch) {
        setUnavDraftByTable((prev) => ({
            ...prev,
            [tableId]: { ...getUnavDraft(tableId), ...patch },
        }));
    }

    function toISO(dateStr, timeStr) {
        if (!dateStr || !timeStr) return "";
        const d = new Date(`${dateStr}T${timeStr}:00`);
        return d.toISOString();
    }

    async function fetchUnavsForTable(tableId) {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/tables/${tableId}/unavailability`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });
            const text = await res.text();
            const data = text ? JSON.parse(text) : [];
            if (!res.ok) {
                return [];
            }
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    useEffect(() => {
        (async () => {
            setLoading(true);
            setStatus("");
            try {
                const token = localStorage.getItem("token");

                const rRes = await fetch("/api/owner/restaurants", {
                    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                });
                const rText = await rRes.text();
                const rData = rText ? JSON.parse(rText) : [];
                const first = Array.isArray(rData) ? rData[0] : null;

                if (!rRes.ok) {
                    setRestaurant(null);
                    setZones([]);
                    setTablesByZone({});
                    setUnavsByTable({});
                    setStatus((rData && (rData.error || rData.message)) || "Failed to load restaurant");
                    return;
                }

                if (!first) {
                    setRestaurant(null);
                    setZones([]);
                    setTablesByZone({});
                    setUnavsByTable({});
                    setStatus("No restaurant found for this owner.");
                    return;
                }

                setRestaurant(first);

                const zRes = await fetch(`/api/owner/restaurants/${first.id}/zones`, {
                    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                });
                const zText = await zRes.text();
                const zData = zText ? JSON.parse(zText) : [];
                const zonesList = Array.isArray(zData) ? zData : [];

                if (!zRes.ok) {
                    setZones([]);
                    setTablesByZone({});
                    setUnavsByTable({});
                    setStatus((zData && (zData.error || zData.message)) || "Failed to load zones");
                    return;
                }

                setZones(zonesList);

                const nextTables = {};
                for (const z of zonesList) {
                    const tRes = await fetch(`/api/owner/zones/${z.id}/tables`, {
                        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                    });
                    const tText = await tRes.text();
                    const tData = tText ? JSON.parse(tText) : [];
                    nextTables[z.id] = Array.isArray(tData) ? tData : [];
                }
                setTablesByZone(nextTables);

                const allTables = Object.values(nextTables).flat();
                const nextUnavs = {};
                for (const t of allTables) {
                    nextUnavs[t.id] = await fetchUnavsForTable(t.id);
                }
                setUnavsByTable(nextUnavs);
            } catch (e) {
                console.error(e);
                setStatus("Failed to load layout.");
                setRestaurant(null);
                setZones([]);
                setTablesByZone({});
                setUnavsByTable({});
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function handleCreateZone() {
        if (!restaurant?.id) return;
        if (!zoneName.trim()) {
            setStatus("Zone name is required");
            return;
        }

        setStatus("");
        setCreatingZone(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/restaurants/${restaurant.id}/zones`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    name: zoneName.trim(),
                    description: zoneDesc.trim() ? zoneDesc.trim() : null,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to create zone");
                return;
            }

            setZones((prev) => [...prev, data]);
            setTablesByZone((prev) => ({ ...prev, [data.id]: [] }));

            setZoneName("");
            setZoneDesc("");
            setShowZoneForm(false);
        } catch (e) {
            console.error(e);
            setStatus("Network/server error creating zone");
        } finally {
            setCreatingZone(false);
        }
    }

    async function handleCreateTable(zoneId) {
        if (!zoneId) return;

        const draft = getDraft(zoneId);

        if (!draft.name.trim()) {
            setStatus("Table name is required");
            return;
        }
        if (!draft.capacity || Number(draft.capacity) < 1) {
            setStatus("Capacity must be >= 1");
            return;
        }

        setStatus("");
        setCreatingTableForZone(zoneId);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/zones/${zoneId}/tables`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    name: draft.name.trim(),
                    capacity: Number(draft.capacity),
                    reservable: Boolean(draft.reservable),
                    active: Boolean(draft.active),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to create table");
                return;
            }

            setTablesByZone((prev) => ({
                ...prev,
                [zoneId]: [...(prev[zoneId] || []), data],
            }));

            setUnavsByTable((prev) => ({ ...prev, [data.id]: [] }));

            updateDraft(zoneId, { name: "", capacity: 2, reservable: true, active: true });
            setOpenTableZoneId(null);
        } catch (e) {
            console.error(e);
            setStatus("Network/server error creating table");
        } finally {
            setCreatingTableForZone(null);
        }
    }

    function startEditZone(z) {
        setStatus("");
        setEditingZoneId(z.id);
        setZoneEditDraft({ name: z.name || "", description: z.description || "" });
    }

    function cancelEditZone() {
        setEditingZoneId(null);
        setZoneEditDraft({ name: "", description: "" });
    }

    async function saveEditZone(zoneId) {
        if (!zoneId) return;
        if (!zoneEditDraft.name.trim()) {
            setStatus("Zone name is required");
            return;
        }

        setStatus("");
        setSavingZoneId(zoneId);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/zones/${zoneId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    name: zoneEditDraft.name.trim(),
                    description: zoneEditDraft.description.trim() ? zoneEditDraft.description.trim() : null,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to update zone");
                return;
            }

            setZones((prev) => prev.map((z) => (z.id === zoneId ? { ...z, ...data } : z)));
            cancelEditZone();
        } catch (e) {
            console.error(e);
            setStatus("Network/server error updating zone");
        } finally {
            setSavingZoneId(null);
        }
    }

    async function handleDeleteZone(zoneId) {
        const ok = window.confirm("Delete this zone? This will also remove its tables.");
        if (!ok) return;

        setStatus("");
        setDeletingZoneId(zoneId);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/zones/${zoneId}`, {
                method: "DELETE",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to delete zone");
                return;
            }

            const removedTables = (tablesByZone[zoneId] || []).map((t) => t.id);

            setZones((prev) => prev.filter((z) => z.id !== zoneId));
            setTablesByZone((prev) => {
                const next = { ...prev };
                delete next[zoneId];
                return next;
            });

            setUnavsByTable((prev) => {
                const next = { ...prev };
                for (const tid of removedTables) delete next[tid];
                return next;
            });

            if (editingZoneId === zoneId) cancelEditZone();
            if (openTableZoneId === zoneId) setOpenTableZoneId(null);
        } catch (e) {
            console.error(e);
            setStatus("Network/server error deleting zone");
        } finally {
            setDeletingZoneId(null);
        }
    }

    function startEditTable(t) {
        setStatus("");
        setEditingTableId(t.id);
        setTableEditDraft({
            name: t.name || "",
            capacity: t.capacity ?? 2,
            reservable: Boolean(t.reservable),
            active: Boolean(t.active),
        });
    }

    function cancelEditTable() {
        setEditingTableId(null);
        setTableEditDraft({ name: "", capacity: 2, reservable: true, active: true });
    }

    async function saveEditTable(tableId, zoneId) {
        if (!tableId || !zoneId) return;

        if (!tableEditDraft.name.trim()) {
            setStatus("Table name is required");
            return;
        }
        if (!tableEditDraft.capacity || Number(tableEditDraft.capacity) < 1) {
            setStatus("Capacity must be >= 1");
            return;
        }

        setStatus("");
        setSavingTableId(tableId);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/tables/${tableId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    name: tableEditDraft.name.trim(),
                    capacity: Number(tableEditDraft.capacity),
                    reservable: Boolean(tableEditDraft.reservable),
                    active: Boolean(tableEditDraft.active),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to update table");
                return;
            }

            setTablesByZone((prev) => ({
                ...prev,
                [zoneId]: (prev[zoneId] || []).map((t) => (t.id === tableId ? { ...t, ...data } : t)),
            }));

            cancelEditTable();
        } catch (e) {
            console.error(e);
            setStatus("Network/server error updating table");
        } finally {
            setSavingTableId(null);
        }
    }

    async function handleDeleteTable(tableId, zoneId) {
        const ok = window.confirm("Delete this table?");
        if (!ok) return;

        setStatus("");
        setDeletingTableId(tableId);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/tables/${tableId}`, {
                method: "DELETE",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to delete table");
                return;
            }

            setTablesByZone((prev) => ({
                ...prev,
                [zoneId]: (prev[zoneId] || []).filter((t) => t.id !== tableId),
            }));

            setUnavsByTable((prev) => {
                const next = { ...prev };
                delete next[tableId];
                return next;
            });

            if (editingTableId === tableId) cancelEditTable();
            if (openUnavTableId === tableId) setOpenUnavTableId(null);
        } catch (e) {
            console.error(e);
            setStatus("Network/server error deleting table");
        } finally {
            setDeletingTableId(null);
        }
    }

    async function handleCreateUnavailability(tableId) {
        const d = getUnavDraft(tableId);
        const startsAt = toISO(d.startDate, d.startTime);
        const endsAt = toISO(d.endDate, d.endTime);

        if (!startsAt || !endsAt) {
            setStatus("Pick start and end date/time for unavailability");
            return;
        }
        if (!d.reason.trim()) {
            setStatus("Reason is required");
            return;
        }
        if (new Date(startsAt) >= new Date(endsAt)) {
            setStatus("End must be after start");
            return;
        }

        setStatus("");
        setCreatingUnavForTable(tableId);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/tables/${tableId}/unavailability`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    startsAt,
                    endsAt,
                    reason: d.reason.trim(),
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to add unavailability");
                return;
            }

            setUnavsByTable((prev) => ({
                ...prev,
                [tableId]: [...(prev[tableId] || []), data],
            }));

            setUnavDraft(tableId, { startDate: "", startTime: "", endDate: "", endTime: "", reason: "" });
        } catch (e) {
            console.error(e);
            setStatus("Network/server error adding unavailability");
        } finally {
            setCreatingUnavForTable(null);
        }
    }

    async function handleDeleteUnavailability(tableId, unavailabilityId) {
        const ok = window.confirm("Delete this unavailability?");
        if (!ok) return;

        setStatus("");
        setDeletingUnavId(unavailabilityId);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/owner/tables/unavailability/${unavailabilityId}`, {
                method: "DELETE",
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to delete unavailability");
                return;
            }

            setUnavsByTable((prev) => ({
                ...prev,
                [tableId]: (prev[tableId] || []).filter((u) => u.id !== unavailabilityId),
            }));
        } catch (e) {
            console.error(e);
            setStatus("Network/server error deleting unavailability");
        } finally {
            setDeletingUnavId(null);
        }
    }

    return (
        <AppLayout name={name} sideNav={<OwnerSideNav active={active} />}>
            <h1 className="page-title">Restaurant Layout</h1>

            {loading && <div style={{ opacity: 0.85 }}>Loading…</div>}
            {status && <div style={{ opacity: 0.85 }}>{status}</div>}

            {!loading && restaurant && (
                <div className="dashboard-panel">
                    <h2 style={{ marginBottom: 16 }}>{restaurant.name}</h2>

                    <div style={{ display: "grid", gap: 18 }}>
                        <section className="dashboard-panel">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                                <h3 style={{ margin: 0 }}>Zones</h3>
                                <button className="sf-filterBtn" type="button" onClick={() => setShowZoneForm((v) => !v)}>
                                    {showZoneForm ? "Close" : "Add Zone"}
                                </button>
                            </div>

                            {showZoneForm && (
                                <div style={{ display: "grid", gap: 10, maxWidth: 420, marginTop: 12 }}>
                                    <input className="sf-input" value={zoneName} onChange={(e) => setZoneName(e.target.value)} placeholder="Zone name" />
                                    <input className="sf-input" value={zoneDesc} onChange={(e) => setZoneDesc(e.target.value)} placeholder="Description (optional)" />
                                    <button className="sf-filterBtn" type="button" onClick={handleCreateZone} disabled={creatingZone}>
                                        {creatingZone ? "Creating…" : "Create Zone"}
                                    </button>
                                </div>
                            )}

                            <div style={{ marginTop: 14 }}>
                                {zones.length === 0 ? (
                                    <div style={{ opacity: 0.85 }}>No zones for this restaurant yet.</div>
                                ) : (
                                    <div style={{ display: "grid", gap: 10 }}>
                                        {zones.map((z) => {
                                            const isEditing = editingZoneId === z.id;

                                            return (
                                                <div key={z.id} className="dashboard-panel">
                                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                                                        <div style={{ fontWeight: 700 }}>{z.name || "Unnamed zone"}</div>

                                                        {!isEditing ? (
                                                            <div style={{ display: "flex", gap: 10 }}>
                                                                <button className="sf-filterBtn" type="button" onClick={() => startEditZone(z)}>
                                                                    Edit
                                                                </button>
                                                                <button className="sf-filterBtn" type="button" onClick={() => handleDeleteZone(z.id)} disabled={deletingZoneId === z.id}>
                                                                    {deletingZoneId === z.id ? "Deleting…" : "Delete"}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: "flex", gap: 10 }}>
                                                                <button className="sf-filterBtn" type="button" onClick={() => saveEditZone(z.id)} disabled={savingZoneId === z.id}>
                                                                    {savingZoneId === z.id ? "Saving…" : "Save"}
                                                                </button>
                                                                <button className="sf-filterBtn" type="button" onClick={cancelEditZone}>
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {!isEditing ? (
                                                        z.description ? <div style={{ opacity: 0.85, marginTop: 6 }}>{z.description}</div> : null
                                                    ) : (
                                                        <div style={{ display: "grid", gap: 10, maxWidth: 420, marginTop: 12 }}>
                                                            <input
                                                                className="sf-input"
                                                                value={zoneEditDraft.name}
                                                                onChange={(e) => setZoneEditDraft((p) => ({ ...p, name: e.target.value }))}
                                                                placeholder="Zone name"
                                                            />
                                                            <input
                                                                className="sf-input"
                                                                value={zoneEditDraft.description}
                                                                onChange={(e) => setZoneEditDraft((p) => ({ ...p, description: e.target.value }))}
                                                                placeholder="Description (optional)"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="dashboard-panel">
                            <h3 style={{ marginBottom: 10 }}>Tables</h3>

                            {zones.length === 0 ? (
                                <div style={{ opacity: 0.85 }}>No tables to show because there are no zones for this restaurant.</div>
                            ) : (
                                <div style={{ display: "grid", gap: 14 }}>
                                    {zones.map((z) => {
                                        const tables = tablesByZone[z.id] || [];
                                        const draft = getDraft(z.id);
                                        const isOpen = openTableZoneId === z.id;

                                        return (
                                            <div key={z.id} className="dashboard-panel">
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                                                    <div style={{ fontWeight: 800 }}>{z.name || "Zone"}</div>
                                                    <button className="sf-filterBtn" type="button" onClick={() => setOpenTableZoneId((prev) => (prev === z.id ? null : z.id))}>
                                                        {isOpen ? "Close" : "Add Table"}
                                                    </button>
                                                </div>

                                                {isOpen && (
                                                    <div style={{ display: "grid", gap: 10, maxWidth: 420, marginTop: 12 }}>
                                                        <input className="sf-input" value={draft.name} onChange={(e) => updateDraft(z.id, { name: e.target.value })} placeholder="Table name" />
                                                        <input
                                                            className="sf-input"
                                                            type="number"
                                                            min="1"
                                                            value={draft.capacity}
                                                            onChange={(e) => updateDraft(z.id, { capacity: e.target.value })}
                                                            placeholder="Capacity"
                                                        />

                                                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                                            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                                <input type="checkbox" checked={draft.reservable} onChange={(e) => updateDraft(z.id, { reservable: e.target.checked })} />
                                                                Reservable
                                                            </label>

                                                            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                                <input type="checkbox" checked={draft.active} onChange={(e) => updateDraft(z.id, { active: e.target.checked })} />
                                                                Active
                                                            </label>
                                                        </div>

                                                        <button className="sf-filterBtn" type="button" onClick={() => handleCreateTable(z.id)} disabled={creatingTableForZone === z.id}>
                                                            {creatingTableForZone === z.id ? "Creating…" : `Create Table in ${z.name || "Zone"}`}
                                                        </button>
                                                    </div>
                                                )}

                                                <div style={{ marginTop: 14 }}>
                                                    {tables.length === 0 ? (
                                                        <div style={{ opacity: 0.85 }}>No tables for this zone yet.</div>
                                                    ) : (
                                                        <div style={{ display: "grid", gap: 8 }}>
                                                            {tables.map((t) => {
                                                                const isEditing = editingTableId === t.id;
                                                                const openUnav = openUnavTableId === t.id;
                                                                const unavs = unavsByTable[t.id] || [];
                                                                const ud = getUnavDraft(t.id);

                                                                return (
                                                                    <div key={t.id} className="dashboard-panel">
                                                                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                                                                            <div style={{ fontWeight: 700 }}>{t.name || "Table"}</div>

                                                                            {!isEditing ? (
                                                                                <div style={{ display: "flex", gap: 10 }}>
                                                                                    <button className="sf-filterBtn" type="button" onClick={() => startEditTable(t)}>
                                                                                        Edit
                                                                                    </button>
                                                                                    <button
                                                                                        className="sf-filterBtn"
                                                                                        type="button"
                                                                                        onClick={() => handleDeleteTable(t.id, z.id)}
                                                                                        disabled={deletingTableId === t.id}
                                                                                    >
                                                                                        {deletingTableId === t.id ? "Deleting…" : "Delete"}
                                                                                    </button>
                                                                                </div>
                                                                            ) : (
                                                                                <div style={{ display: "flex", gap: 10 }}>
                                                                                    <button className="sf-filterBtn" type="button" onClick={() => saveEditTable(t.id, z.id)} disabled={savingTableId === t.id}>
                                                                                        {savingTableId === t.id ? "Saving…" : "Save"}
                                                                                    </button>
                                                                                    <button className="sf-filterBtn" type="button" onClick={cancelEditTable}>
                                                                                        Cancel
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {!isEditing ? (
                                                                            <>
                                                                                <div style={{ opacity: 0.85, marginTop: 6 }}>Seats: {t.capacity}</div>
                                                                                <div style={{ opacity: 0.85 }}>
                                                                                    {t.active ? "Active" : "Inactive"} · {t.reservable ? "Reservable" : "Not reservable"}
                                                                                </div>

                                                                                <div style={{ marginTop: 12 }}>
                                                                                    <button
                                                                                        className="sf-filterBtn"
                                                                                        type="button"
                                                                                        onClick={() => setOpenUnavTableId((prev) => (prev === t.id ? null : t.id))}
                                                                                    >
                                                                                        {openUnav ? "Close unavailabilities" : "Manage unavailabilities"}
                                                                                    </button>
                                                                                </div>

                                                                                {openUnav && (
                                                                                    <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                                                                                        <div className="dashboard-panel">
                                                                                            <div style={{ fontWeight: 700, marginBottom: 10 }}>Add unavailability</div>

                                                                                            <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
                                                                                                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
                                                                                                    <input
                                                                                                        className="sf-input"
                                                                                                        type="date"
                                                                                                        value={ud.startDate}
                                                                                                        onChange={(e) => setUnavDraft(t.id, { startDate: e.target.value })}
                                                                                                    />
                                                                                                    <input
                                                                                                        className="sf-input"
                                                                                                        type="time"
                                                                                                        value={ud.startTime}
                                                                                                        onChange={(e) => setUnavDraft(t.id, { startTime: e.target.value })}
                                                                                                    />
                                                                                                </div>

                                                                                                <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
                                                                                                    <input
                                                                                                        className="sf-input"
                                                                                                        type="date"
                                                                                                        value={ud.endDate}
                                                                                                        onChange={(e) => setUnavDraft(t.id, { endDate: e.target.value })}
                                                                                                    />
                                                                                                    <input
                                                                                                        className="sf-input"
                                                                                                        type="time"
                                                                                                        value={ud.endTime}
                                                                                                        onChange={(e) => setUnavDraft(t.id, { endTime: e.target.value })}
                                                                                                    />
                                                                                                </div>

                                                                                                <input
                                                                                                    className="sf-input"
                                                                                                    value={ud.reason}
                                                                                                    onChange={(e) => setUnavDraft(t.id, { reason: e.target.value })}
                                                                                                    placeholder="Reason (e.g., maintenance)"
                                                                                                />

                                                                                                <button
                                                                                                    className="sf-filterBtn"
                                                                                                    type="button"
                                                                                                    onClick={() => handleCreateUnavailability(t.id)}
                                                                                                    disabled={creatingUnavForTable === t.id}
                                                                                                >
                                                                                                    {creatingUnavForTable === t.id ? "Adding…" : "Add"}
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="dashboard-panel">
                                                                                            <div style={{ fontWeight: 700, marginBottom: 10 }}>Existing unavailabilities</div>

                                                                                            {unavs.length === 0 ? (
                                                                                                <div style={{ opacity: 0.85 }}>No unavailabilities for this table yet.</div>
                                                                                            ) : (
                                                                                                <div style={{ display: "grid", gap: 10 }}>
                                                                                                    {unavs.map((u) => (
                                                                                                        <div key={u.id} className="dashboard-panel">
                                                                                                            <div style={{ fontWeight: 700 }}>{u.reason || "Unavailability"}</div>
                                                                                                            <div style={{ opacity: 0.85 }}>{fmtDT(u.startsAt)} → {fmtDT(u.endsAt)}</div>

                                                                                                            <div style={{ marginTop: 10 }}>
                                                                                                                <button
                                                                                                                    className="sf-filterBtn"
                                                                                                                    type="button"
                                                                                                                    onClick={() => handleDeleteUnavailability(t.id, u.id)}
                                                                                                                    disabled={deletingUnavId === u.id}
                                                                                                                >
                                                                                                                    {deletingUnavId === u.id ? "Deleting…" : "Delete"}
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        ) : (
                                                                            <div style={{ display: "grid", gap: 10, maxWidth: 420, marginTop: 12 }}>
                                                                                <input
                                                                                    className="sf-input"
                                                                                    value={tableEditDraft.name}
                                                                                    onChange={(e) => setTableEditDraft((p) => ({ ...p, name: e.target.value }))}
                                                                                    placeholder="Table name"
                                                                                />
                                                                                <input
                                                                                    className="sf-input"
                                                                                    type="number"
                                                                                    min="1"
                                                                                    value={tableEditDraft.capacity}
                                                                                    onChange={(e) => setTableEditDraft((p) => ({ ...p, capacity: e.target.value }))}
                                                                                    placeholder="Capacity"
                                                                                />

                                                                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                                                                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={tableEditDraft.reservable}
                                                                                            onChange={(e) => setTableEditDraft((p) => ({ ...p, reservable: e.target.checked }))}
                                                                                        />
                                                                                        Reservable
                                                                                    </label>

                                                                                    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={tableEditDraft.active}
                                                                                            onChange={(e) => setTableEditDraft((p) => ({ ...p, active: e.target.checked }))}
                                                                                        />
                                                                                        Active
                                                                                    </label>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
