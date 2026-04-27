import { useCallback, useEffect, useMemo, useState } from "react";
import {
    fetchOwnerRestaurant,
    fetchOwnerZones,
    fetchTableTags,
    fetchTablesForZones,
} from "./api";
import useOwnerTablesActions from "./useOwnerTableActions";
import { getApiErrorMessage } from "../../components/utils/getApiErrorMessage";

export default function useOwnerTables() {
    const [restaurant, setRestaurant] = useState(null);
    const [zones, setZones] = useState([]);
    const [tables, setTables] = useState([]);
    const [tableFeatureTags, setTableFeatureTags] = useState([]);
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

    const clearLayoutData = useCallback(() => {
        setRestaurant(null);
        setZones([]);
        setTables([]);
        setTableFeatureTags([]);
    }, []);

    const closeZoneModal = useCallback(() => {
        setZoneModal({ open: false, mode: "create", zone: null });
        setZoneModalStatus("");
    }, []);

    const closeTableModal = useCallback(() => {
        setTableModal({
            open: false,
            mode: "create",
            table: null,
            zoneId: "",
        });
        setTableModalStatus("");
    }, []);

    const closeDeleteModal = useCallback(() => {
        setDeleteState({ open: false, type: "", item: null });
        setDeleteModalStatus("");
    }, []);

    const loadLayout = useCallback(async () => {
        setLoading(true);
        setPageStatus("");

        try {
            const restaurantResult = await fetchOwnerRestaurant();

            if (!restaurantResult.response.ok) {
                clearLayoutData();
                setPageStatus(
                    getApiErrorMessage(
                        restaurantResult.data,
                        "Failed to load restaurant"
                    )
                );
                return;
            }

            if (!restaurantResult.restaurant) {
                clearLayoutData();
                setPageStatus("No restaurant found for this owner.");
                return;
            }

            setRestaurant(restaurantResult.restaurant);

            const [zonesResult, tagsResult] = await Promise.all([
                fetchOwnerZones(restaurantResult.restaurant.id),
                fetchTableTags(),
            ]);

            if (!zonesResult.response.ok) {
                setZones([]);
                setTables([]);
                setPageStatus(
                    getApiErrorMessage(zonesResult.data, "Failed to load zones")
                );
                return;
            }

            const nextZones = Array.isArray(zonesResult.data) ? zonesResult.data : [];
            setZones(nextZones);

            setTableFeatureTags(
                Array.isArray(tagsResult.data?.tags) ? tagsResult.data.tags : []
            );

            const nextTables = await fetchTablesForZones(nextZones);
            setTables(nextTables);
        } catch (error) {
            console.error(error);
            clearLayoutData();
            setPageStatus("Failed to load tables and zones.");
        } finally {
            setLoading(false);
        }
    }, [clearLayoutData]);

    useEffect(() => {
        void loadLayout();
    }, [loadLayout]);

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

    const selectedZone = useMemo(
        () => zones.find((zone) => zone.id === selectedZoneId) || null,
        [zones, selectedZoneId]
    );

    const selectedZoneTables = useMemo(
        () => tables.filter((table) => table.zoneId === selectedZoneId),
        [tables, selectedZoneId]
    );

    const selectedTable = useMemo(
        () => tables.find((table) => table.id === selectedTableId) || null,
        [tables, selectedTableId]
    );

    const zoneSummaries = useMemo(() => {
        return zones.map((zone) => {
            const zoneTables = tables.filter((table) => table.zoneId === zone.id);
            const seatCount = zoneTables.reduce(
                (sum, table) => sum + Number(table.capacity || 0),
                0
            );

            return {
                ...zone,
                tableCount: zoneTables.length,
                seatCount,
            };
        });
    }, [zones, tables]);

    const { handleSaveZone, handleSaveTable, handleConfirmDelete } =
        useOwnerTablesActions({
            restaurant,
            zoneModal,
            tableModal,
            deleteState,
            selectedZoneId,
            selectedTableId,
            setSaving,
            setDeleting,
            setZoneModalStatus,
            setTableModalStatus,
            setDeleteModalStatus,
            setSelectedZoneId,
            setSelectedTableId,
            closeZoneModal,
            closeTableModal,
            closeDeleteModal,
            loadLayout,
        });

    return {
        restaurant,
        zones,
        tables,
        tableFeatureTags,
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
        closeZoneModal,
        closeTableModal,
        closeDeleteModal,
        handleSaveZone,
        handleSaveTable,
        handleConfirmDelete,
    };
}