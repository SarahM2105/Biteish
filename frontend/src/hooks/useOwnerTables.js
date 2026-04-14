import { useEffect, useMemo, useState } from "react";

export default function useOwnerTables() {
    const [restaurant, setRestaurant] = useState(null);
    const [zones, setZones] = useState([]);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageStatus, setPageStatus] = useState("");
    const [zoneModalStatus, setZoneModalStatus] = useState("");
    const [tableModalStatus, setTableModalStatus] = useState("");
    const [deleteModalStatus, setDeleteModalStatus] = useState("");

    const [selectedZoneId, setSelectedZoneId] = useState("");
    const [selectedTableId, setSelectedTableId] = useState("");

    const [zoneModal, setZoneModal] = useState({
        open: false,
        mode: "create",
        zone: null,
    });

    const [tableModal, setTableModal] = useState({
        open: false,
        mode: "create",
        table: null,
        zoneId: "",
    });

    const [deleteState, setDeleteState] = useState({
        open: false,
        type: "",
        item: null,
    });

    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function loadLayout() {
        setLoading(true);
        setPageStatus("");

        try {
            const token = localStorage.getItem("token");

            const restaurantRes = await fetch("/api/owner/restaurants", {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const restaurantData = await restaurantRes.json().catch(() => []);

            if (!restaurantRes.ok) {
                setRestaurant(null);
                setZones([]);
                setTables([]);
                setPageStatus(
                    restaurantData?.error ||
                    restaurantData?.message ||
                    "Failed to load restaurant"
                );
                return;
            }

            const ownerRestaurant = Array.isArray(restaurantData)
                ? restaurantData[0]
                : null;

            if (!ownerRestaurant) {
                setRestaurant(null);
                setZones([]);
                setTables([]);
                setPageStatus("No restaurant found for this owner.");
                return;
            }

            setRestaurant(ownerRestaurant);

            const zonesRes = await fetch(
                `/api/owner/restaurants/${ownerRestaurant.id}/zones`,
                {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            const zonesData = await zonesRes.json().catch(() => []);

            if (!zonesRes.ok) {
                setZones([]);
                setTables([]);
                setPageStatus(
                    zonesData?.error ||
                    zonesData?.message ||
                    "Failed to load zones"
                );
                return;
            }

            const nextZones = Array.isArray(zonesData) ? zonesData : [];
            setZones(nextZones);

            const tableResults = await Promise.all(
                nextZones.map(async (zone) => {
                    const res = await fetch(`/api/owner/zones/${zone.id}/tables`, {
                        headers: {
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                    });

                    const data = await res.json().catch(() => []);
                    return Array.isArray(data)
                        ? data.map((table) => ({ ...table, zoneName: zone.name }))
                        : [];
                })
            );

            setTables(tableResults.flat());
        } catch (error) {
            console.error(error);
            setRestaurant(null);
            setZones([]);
            setTables([]);
            setPageStatus("Failed to load tables and zones.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadLayout();
    }, []);

    useEffect(() => {
        if (!zones.length) {
            setSelectedZoneId("");
            setSelectedTableId("");
            return;
        }

        const zoneStillExists = zones.some((zone) => zone.id === selectedZoneId);

        if (!selectedZoneId || !zoneStillExists) {
            setSelectedZoneId(zones[0].id);
        }
    }, [zones, selectedZoneId]);

    useEffect(() => {
        if (!selectedZoneId) {
            setSelectedTableId("");
            return;
        }

        const tableStillVisible = tables.some(
            (table) => table.id === selectedTableId && table.zoneId === selectedZoneId
        );

        if (!tableStillVisible) {
            setSelectedTableId("");
        }
    }, [tables, selectedZoneId, selectedTableId]);

    const selectedZone = useMemo(() => {
        return zones.find((zone) => zone.id === selectedZoneId) || null;
    }, [zones, selectedZoneId]);

    const selectedZoneTables = useMemo(() => {
        return tables.filter((table) => table.zoneId === selectedZoneId);
    }, [tables, selectedZoneId]);

    const selectedTable = useMemo(() => {
        return tables.find((table) => table.id === selectedTableId) || null;
    }, [tables, selectedTableId]);

    const zoneSummaries = useMemo(() => {
        return zones.map((zone) => {
            const zoneTables = tables.filter((table) => table.zoneId === zone.id);
            const seats = zoneTables.reduce((sum, table) => sum + Number(table.capacity || 0), 0);

            return {
                ...zone,
                tableCount: zoneTables.length,
                seatCount: seats,
            };
        });
    }, [zones, tables]);

    async function handleSaveZone(values) {
        if (!restaurant?.id) return;

        setSaving(true);
        setZoneModalStatus("");

        try {
            const token = localStorage.getItem("token");
            const isEdit = zoneModal.mode === "edit" && zoneModal.zone;

            const res = await fetch(
                isEdit
                    ? `/api/owner/zones/${zoneModal.zone.id}`
                    : `/api/owner/restaurants/${restaurant.id}/zones`,
                {
                    method: isEdit ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        name: values.name.trim(),
                        description: values.description.trim() || null,
                    }),
                }
            );

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setZoneModalStatus(data?.error || data?.message || "Failed to save zone");
                return;
            }

            setZoneModal({ open: false, mode: "create", zone: null });
            setZoneModalStatus("");
            await loadLayout();

            if (!isEdit && data?.id) {
                setSelectedZoneId(data.id);
            }
        } catch (error) {
            console.error(error);
            setZoneModalStatus("Failed to save zone");
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveTable(values) {
        setSaving(true);
        setTableModalStatus("");

        try {
            const token = localStorage.getItem("token");
            const isEdit = tableModal.mode === "edit" && tableModal.table;

            const res = await fetch(
                isEdit
                    ? `/api/owner/tables/${tableModal.table.id}`
                    : `/api/owner/zones/${values.zoneId}/tables`,
                {
                    method: isEdit ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({
                        name: values.name.trim(),
                        capacity: Number(values.capacity),
                        reservable: values.reservable,
                        active: values.active,
                    }),
                }
            );

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setTableModalStatus(data?.error || data?.message || "Failed to save table");
                return;
            }

            setTableModal({
                open: false,
                mode: "create",
                table: null,
                zoneId: "",
            });
            setTableModalStatus("");

            await loadLayout();

            if (isEdit) {
                setSelectedTableId(tableModal.table.id);
            } else if (data?.id) {
                setSelectedZoneId(values.zoneId);
                setSelectedTableId(data.id);
            }
        } catch (error) {
            console.error(error);
            setTableModalStatus("Failed to save table");
        } finally {
            setSaving(false);
        }
    }

    async function handleConfirmDelete() {
        if (!deleteState.item || !deleteState.type) return;

        setDeleting(true);
        setDeleteModalStatus("");

        try {
            const token = localStorage.getItem("token");
            const targetUrl =
                deleteState.type === "zone"
                    ? `/api/owner/zones/${deleteState.item.id}`
                    : `/api/owner/tables/${deleteState.item.id}`;

            const res = await fetch(targetUrl, {
                method: "DELETE",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            let data = {};
            try {
                data = await res.json();
            } catch {
                data = {};
            }

            if (!res.ok) {
                setDeleteModalStatus(
                    data?.error || data?.message || "Failed to delete item"
                );
                return;
            }

            if (deleteState.type === "zone" && selectedZoneId === deleteState.item.id) {
                setSelectedZoneId("");
                setSelectedTableId("");
            }

            if (deleteState.type === "table" && selectedTableId === deleteState.item.id) {
                setSelectedTableId("");
            }

            setDeleteModalStatus("");
            setDeleteState({ open: false, type: "", item: null });
            await loadLayout();
        } catch (error) {
            console.error(error);
            setDeleteModalStatus("Failed to delete item");
        } finally {
            setDeleting(false);
        }
    }

    return {
        restaurant,
        zones,
        tables,
        loading,
        pageStatus,
        zoneModalStatus,
        tableModalStatus,
        deleteModalStatus,
        selectedZoneId,
        selectedTableId,
        selectedZone,
        selectedZoneTables,
        selectedTable,
        zoneSummaries,
        zoneModal,
        tableModal,
        deleteState,
        saving,
        deleting,
        setSelectedZoneId,
        setSelectedTableId,
        setZoneModalStatus,
        setTableModalStatus,
        setDeleteModalStatus,
        setZoneModal,
        setTableModal,
        setDeleteState,
        handleSaveZone,
        handleSaveTable,
        handleConfirmDelete,
    };
}