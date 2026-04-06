import React from "react";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import useCustomerNotificationCounts from "../../hooks/useCustomerNotificationCounts";

export default function CustomerNotifications() {
    const name = localStorage.getItem("name") || "customer";
    const active = "Notifications";
    const {pendingBookingsCount, upcomingConfirmedCount, updatedBookingCount, totalCustomerNotifications}= useCustomerNotificationCounts();
    return (
        <AppLayout name={name} sideNav={<CustomerSideNav active={active}/>}>
            <h1> Notifications </h1>
            <div className="dashboard-panel" style={{marginTop: 12}}>
                <h2>Customer Notification Summary - to be changed in the next sprint</h2>
                <div style={{display: "grid", gap: 10, marginTop: 12}}>
                    <div>Pending Owner Decisions: {pendingBookingsCount}</div>
                    <div>Upcoming Confirmed Bookings: {upcomingConfirmedCount}</div>
                    <div>Booking Updates: {updatedBookingCount}</div>
                    <div>Total Notifications: {totalCustomerNotifications}</div>
                </div>
            </div>
        </AppLayout>
    );
}