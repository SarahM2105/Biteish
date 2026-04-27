import { useCallback } from "react";
import {
    saveZoneRequest,
    saveTableRequest,
    deleteRequest,
} from "./api";
import { getApiErrorMessage } from "../../components/utils/getApiErrorMessage";

export default function useOwnerTablesActions({
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
                                              }) {
    const handleSaveZone = useCallback(
        async (values) => {
            if (!restaurant?.id) return;

            setSaving(true);
            setZoneModalStatus("");

            try {
                const { response, data, isEdit } = await saveZoneRequest({
                    restaurantId: restaurant.id,
                    zoneModal,
                    values,
                });

                if (!response.ok) {
                    setZoneModalStatus(
                        getApiErrorMessage(data, "Failed to save zone")
                    );
                    return;
                }

                closeZoneModal();
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
        },
        [
            restaurant,
            zoneModal,
            setSaving,
            setZoneModalStatus,
            closeZoneModal,
            loadLayout,
            setSelectedZoneId,
        ]
    );

    const handleSaveTable = useCallback(
        async (values) => {
            setSaving(true);
            setTableModalStatus("");

            try {
                const { response, data, isEdit } = await saveTableRequest({
                    tableModal,
                    values,
                });

                if (!response.ok) {
                    setTableModalStatus(
                        getApiErrorMessage(data, "Failed to save table")
                    );
                    return;
                }

                closeTableModal();
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
        },
        [
            tableModal,
            setSaving,
            setTableModalStatus,
            closeTableModal,
            loadLayout,
            setSelectedZoneId,
            setSelectedTableId,
        ]
    );

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteState.item || !deleteState.type) return;

        setDeleting(true);
        setDeleteModalStatus("");

        try {
            const { response, data } = await deleteRequest(deleteState);

            if (!response.ok) {
                setDeleteModalStatus(
                    getApiErrorMessage(data, "Failed to delete item")
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

            closeDeleteModal();
            await loadLayout();
        } catch (error) {
            console.error(error);
            setDeleteModalStatus("Failed to delete item");
        } finally {
            setDeleting(false);
        }
    }, [
        deleteState,
        selectedZoneId,
        selectedTableId,
        setDeleting,
        setDeleteModalStatus,
        setSelectedZoneId,
        setSelectedTableId,
        closeDeleteModal,
        loadLayout,
    ]);

    return {
        handleSaveZone,
        handleSaveTable,
        handleConfirmDelete,
    };
}