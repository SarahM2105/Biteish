import {useCallback, useEffect, useState} from "react";
import {getSocket} from "../socket";

export default function useCustomerNotificationCounts(){
    const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
    const [upcommingConfirmedCount, setUpcommingConfirmedCount] = useState(0);
    const [updatedBookingsCount, setUpdatedBookingsCount] = useState=(0);
    const loadCounts = useCallback(async () => {
        try{
            const token = localStorage.getItem("token");
            const res = await fetch("/api/customer/reservations", {
                headers: {...(token ? {Authorization: `Bearer ${token}`}: {})},
            });
            const text = await res.text();
            const data = text ? JSON.parse(text): [];
            const now = Date.now();
            const pending = Array.isArray(data)
            ? data.filter((r) => r.status === "PENDING").length : 0;
            const confirmedUpcomming = Array.isArray(data)
            ? data.filter(
                    (r)=> r.status === "CONFIRMED" && new Date(r.startsAt).getTime()>= now).length : 0;
            setPendingBookingsCount(pending);
            setUpcommingConfirmedCount(confirmedUpcomming);
            setUpdatedBookingsCount(changed);
        } catch (error) {
            console.error("failed to load customer notification counts",error);
            setPendingBookingsCount(0);
            setUpcommingConfirmedCount(0);
            setUpdatedBookingsCount(0);
        }
    }, []);
    useEffect(()=> {
        loadCounts();
    }, [loadCounts]);

    useEffect(()=> {
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");
        const socket = getSocket();
        socket.connect();
        socket.on("connect", () => {
            socket.emit("join", {role, userId});
        });
        const refresh = () => {
            loadCounts();
        };
        socket.on("reservation:updated", refresh);
    }, [loadCounts]);
    return {
        pendingBookingsCount,
        upcommingConfirmedCount,
        updatedBookingsCount,
        totalCustomerNotifications : pendingBookingsCount + upcommingConfirmedCount + updatedBookingsCount,
    };
}