import React from "react";
import TablesHeader from "./TablesHeader";
import ZoneTabs from "./ZoneTabs";
import ZoneLayout from "./ZoneLayout";
import TableDetailsPanel from "./TableDetailsPanel";
import ZoneModal from "./ZoneModal";
import TableModal from "./TableModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function TablesContent({
                                          restaurant,
                                          zones,
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
                                      }) {
    return (
        <div className="owner-tables-page">
            <TablesHeader
                restaurantName={restaurant?.name}
                onAddZone={() => {
                    setZoneModalStatus("");
                    setZoneModal({ open: true, mode: "create", zone: null });
                }}
                onAddTable={() => {
                    setTableModalStatus("");
                    setTableModal({
                        open: true,
                        mode: "create",
                        table: null,
                        zoneId: selectedZoneId || zones[0]?.id || "",
                    });
                }}
                disableAddTable={!zones.length}
            />

            {pageStatus ? <div className="owner-tables-status">{pageStatus}</div> : null}

            {loading ? (
                <section className="owner-tables-shell owner-tables-shell--loading">
                    <div className="owner-tables-empty">
                        <h3>Loading tables and zones...</h3>
                    </div>
                </section>
            ) : !restaurant ? (
                <section className="owner-tables-shell">
                    <div className="owner-tables-empty">
                        <h3>No restaurant found</h3>
                        <p>Create your restaurant profile first, then come back to manage zones and tables.</p>
                    </div>
                </section>
            ) : (
                <>
                    <ZoneTabs
                        zones={zoneSummaries}
                        selectedZoneId={selectedZoneId}
                        onSelectZone={setSelectedZoneId}
                        onEditZone={(zone) => {
                            setZoneModalStatus("");
                            setZoneModal({ open: true, mode: "edit", zone });
                        }}
                        onDeleteZone={(zone) => {
                            setDeleteModalStatus("");
                            setDeleteState({ open: true, type: "zone", item: zone });
                        }}
                    />

                    <section className="owner-tables-workspace">
                        <ZoneLayout
                            zone={selectedZone}
                            tables={selectedZoneTables}
                            selectedTableId={selectedTableId}
                            onSelectTable={setSelectedTableId}
                            onEditTable={(table) =>
                                setTableModal({
                                    open: true,
                                    mode: "edit",
                                    table,
                                    zoneId: table.zoneId,
                                })
                            }
                            onDeleteTable={(table) => {
                                setDeleteModalStatus("");
                                setDeleteState({ open: true, type: "table", item: table });
                            }}
                        />

                        <TableDetailsPanel
                            zone={selectedZone}
                            table={selectedTable}
                            zoneTables={selectedZoneTables}
                            onAddTable={() => {
                                setTableModalStatus("");
                                setTableModal({
                                    open: true,
                                    mode: "create",
                                    table: null,
                                    zoneId: selectedZoneId,
                                });
                            }}
                            onEditTable={(table) => {
                                setTableModalStatus("");
                                setTableModal({
                                    open: true,
                                    mode: "edit",
                                    table,
                                    zoneId: table.zoneId,
                                });
                            }}
                            onDeleteTable={(table) => {
                                setDeleteModalStatus("");
                                setDeleteState({ open: true, type: "table", item: table });
                            }}
                            onEditZone={(zone) => {
                                setZoneModalStatus("");
                                setZoneModal({ open: true, mode: "edit", zone });
                            }}
                            onDeleteZone={(zone) => {
                                setDeleteModalStatus("");
                                setDeleteState({ open: true, type: "zone", item: zone });
                            }}
                        />
                    </section>
                </>
            )}

            <ZoneModal
                open={zoneModal.open}
                mode={zoneModal.mode}
                zone={zoneModal.zone}
                saving={saving}
                status={zoneModalStatus}
                onClose={() => {
                    setZoneModalStatus("");
                    setZoneModal({ open: false, mode: "create", zone: null });
                }}
                onSubmit={handleSaveZone}
            />

            <TableModal
                open={tableModal.open}
                mode={tableModal.mode}
                table={tableModal.table}
                zones={zones}
                initialZoneId={tableModal.zoneId}
                saving={saving}
                status={tableModalStatus}
                onClose={() => {
                    setTableModalStatus("");
                    setTableModal({
                        open: false,
                        mode: "create",
                        table: null,
                        zoneId: "",
                    });
                }}
                onSubmit={handleSaveTable}
            />

            <DeleteConfirmModal
                open={deleteState.open}
                type={deleteState.type}
                item={deleteState.item}
                deleting={deleting}
                status={deleteModalStatus}
                onClose={() => {
                    setDeleteModalStatus("");
                    setDeleteState({ open: false, type: "", item: null });
                }}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}