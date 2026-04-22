import React, { useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import { useTheme } from "../../ThemeContext";
import useOwnerRequests from "../../hooks/useOwnerRequests";
import RequestsHeader from "../../components/Owner/Requests/Header";
import RequestsSection from "../../components/Owner/Requests/RequestsSection";
import NewBookingCard from "../../components/Owner/Requests/NewBookingCard";
import ChangeRequestCard from "../../components/Owner/Requests/ChangeRequestCard";
import RequestModal from "../../components/Owner/Requests/RequestModal";
import "../../components/Owner/Requests/css/OwnerRequests.css";

export default function Request() {
    const [collapsed, setCollapsed] = useState(false);
    const { isDarkMode, setIsDarkMode } = useTheme();
    const [active, setActive] = useState("Request");

    const {
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
    } = useOwnerRequests();

    function handleNavigate(label) {
        setActive(label);
    }

    return (
        <AppLayout
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((prev) => !prev)}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            sideNav={
                <OwnerSideNav
                    active={active}
                    onNavigate={handleNavigate}
                    collapsed={collapsed}
                />
            }
        >
            <div className="owner-requests-page">
                <RequestsHeader
                    pendingNewCount={pendingNew.length}
                    pendingChangesCount={pendingChanges.length}
                />

                {status && <div className="owner-requests-status">{status}</div>}

                <RequestsSection
                    eyebrow="Incoming"
                    title="New bookings"
                    description="Approve or decline fresh booking requests from customers."
                    count={pendingNew.length}
                    loading={loadingNew}
                    loadingText="Loading new bookings..."
                    emptyText="No pending bookings right now."
                    items={pendingNew}
                    renderItem={(reservation) => (
                        <NewBookingCard
                            key={reservation.id}
                            reservation={reservation}
                            acting={actingKey === `new:${reservation.id}`}
                            onApprove={() => approveNew(reservation.id)}
                            onDecline={() => declineNew(reservation.id)}
                        />
                    )}
                />

                <RequestsSection
                    eyebrow="Updates"
                    title="Booking update requests"
                    description="Compare the current booking with the requested changes before deciding."
                    count={pendingChanges.length}
                    loading={loadingChanges}
                    loadingText="Loading booking update requests..."
                    emptyText="No pending booking updates right now."
                    items={pendingChanges}
                    renderItem={(request) => (
                        <ChangeRequestCard
                            key={request.id}
                            request={request}
                            acting={
                                actingKey === `chg:${request.id}` ||
                                actingKey === `proposal:${request.id}`
                            }
                            onApprove={() => approveChange(request.id)}
                            onDecline={() => declineChange(request.id)}
                            onProposeDifferentChange={() => openProposalModal(request)}
                        />
                    )}
                />
            </div>

            <RequestModal
                isOpen={showProposalModal}
                request={selectedChangeRequest}
                form={proposalForm}
                setForm={setProposalForm}
                acting={
                    selectedChangeRequest
                        ? actingKey === `proposal:${selectedChangeRequest.id}`
                        : false
                }
                onClose={closeProposalModal}
                onSubmit={submitProposedChange}
                availableTables={availableTables}
                loadingTables={loadingTables}
            />
        </AppLayout>
    );
}