import React from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import useOwnerNotificationCounts from "../../hooks/useOwnerNotificationCounts";

export default function OwnerNotifications() {
    const name = localStorage.getItem("name") || "owner";
    const active = "Notifications";
    const {newBookingsCount, changeRequestsCount, totalRequestsCount}= useOwnerNotificationCounts();
    return (
        <DashboardLayout name={name} sideNav={<OwnerSideNav active={active}/>}>
            <h1> Notifications </h1>
            <div className="dashboard-panel" style={{marginTop: 12}}>
                <h2>Owner Notification Summary - to be changed in the next sprint</h2>
                <div style={{ display: "grid", gap: 10, marginTop:12}}>
                    <div>New Booking Requests: {newBookingsCount}</div>
                    <div>Booking Update Requests: {changeRequestsCount}</div>
                    <div>Total Requests Needing Attention: {totalRequestsCount}</div>
                </div>
            </div>
        </DashboardLayout>
    );
}