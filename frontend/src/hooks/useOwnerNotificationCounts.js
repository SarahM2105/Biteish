import {useCallback, useEffect, useState}  from "react";
import {getSocket} from "../socket";

export default function useOwnerNotificationCounts(){
    const [newBookingsCount, setNewBookingsCount] = useState(0);
    const [changeRequestsCount, setChangeRequestsCount] = useState(0);
    const loadCounts = useCallback(async ()=>{
        try{
            const token = localStorage.getItem("token");
            const [resBookings, resChanges]= await Promise.all([
                fetch("/api/owner/reservations/pending", {
                    headers:{...(token ? {Authorization: `Bearer ${token}`}:{})},
                }),
                fetch("/api/owner/change-request", {
                    headers: {...(token ? { Authorization: `Bearer ${token}`}:{})},
                }),
            ]);
            const bookingsText = await resBookings.text();
            const changesText = await resChanges.text();

            const bookingsData = bookingsText ? JSON.parse(bookingsText) : [];
            const changesData = changesText ? JSON.parse(changesText) : [];

            const pendingBookings = Array.isArray(bookingsData)
            ? bookingsData.filter((r)=> r.status ==="PENDING").length
                : 0;
            const pendingChanges = Array.isArray(changesData)
            ? changesData.filter((r)=> r.status === "PENDING").length
                : 0;

            setNewBookingsCount(pendingBookings);
            setChangeRequestsCount(pendingChanges);
        } catch (error){
            console.error("failed to load owner notification counts", error);
            setNewBookingsCount(0);
        }
    }, []);
    useEffect(()=>{
        loadCounts();
    }, [loadCounts]);
    useEffect(()=> {
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");
        const socket = getSocket();
        socket.connect();
        socket.on("connect", () => {
            socket.emit("join", {role,userId});
        });
        const refresh = () => {
            loadCounts();
        };
        return () => {
        socket.on("reservation:created", refresh);
        socket.on("reservation:updated", refresh);
    };
        },[loadCounts]);
    return{
        newBookingsCount, changeRequestsCount, totalRequestsCount: newBookingsCount + changeRequestsCount,
    };
}