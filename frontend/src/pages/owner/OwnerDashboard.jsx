import React, {useState, useEffect} from 'react';
import AppLayout from '../../layouts/AppLayout';
import OwnerSideNav from "../../components/OwnerSideNav";
import {useNavigate} from 'react-router-dom';
import {logout} from "../../components/utils/logout"
import {getSocket} from "../../socket";

function OwnerDashboard() {
    const name= localStorage.getItem('name') || 'owner';
    const [active, setActive] = useState("Dashboard");
    const navigate = useNavigate();
    const [occupancy, setOccupancy] = useState({
        occupiedGuests: 0,
        occupiedTables: 0,
        activeReservations:0,
    });
    const [occupancyStatus, setOccupancyStatus] = useState("");
    const [occupancyLoading, setOccupancyLoading] = useState(true);
    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate)
            return;
        }
        setActive(label);
    }

    useEffect(()=> {
        async function loadOccupancy() {
            setOccupancyLoading(true);
            setOccupancyStatus("");

            try{
                const token = localStorage.getItem("token");
                const res = await fetch("/api/owner/occupancy", {
                    headers: {
                        ...(token ? {Authorization: `Bearer ${token}`} : {}),
                    },
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    setOccupancyStatus(data?.error || "Failed to load occupancy");
                    return;
                }
                setOccupancy({
                    occupiedGuests: data.occupiedGuests || 0,
                    occupiedTables: data.occupiedTables || 0,
                    activeReservations: data.activeReservations || 0,
            });
            } catch (error) {
                console.error(error);
                setOccupancyStatus("Failed to load occupancy");
            } finally {
                setOccupancyLoading(false);
            }
        }
        loadOccupancy();
    }, []);

    useEffect(() => {
        const role = localStorage.getItem("role");
        const userId = localStorage.getItem("userId");
        const socket = getSocket();
        socket.connect();
        socket.on("connect", () => {
            socket.emit("join",{role,userId});
        });
        function handleOccupancyUpdate(data){
            setOccupancy({
                occupiedGuests: data.occupiedGuests || 0,
                occupiedTables: data.occupiedTables || 0,
                activeReservations:data.activeReservations || 0,
            });
            setOccupancyStatus("");
        }
        socket.on("occupancy:update",handleOccupancyUpdate);
        return () => {
            socket.off("occupancy:update", handleOccupancyUpdate);
            socket.disconnect()
        };
    }, []);
    return (
        <AppLayout
            name={name}
            sideNav={<OwnerSideNav active={active} onNavigate={handleNavigate}/>}>
            <h1 className="page-title">Welcome Back, {name}</h1>
            <section className="dashboard-panel">
                <h3>Todays OverView</h3>
                {/*TODO: ...*/}
                {occupancyLoading ? (
                    <div> Loading Occupancy....</div>
                ): (
                    <>
                        <div style={{marginBottom: 8}}>
                            <strong> Current guests that are checked in:</strong>{occupancy.occupiedGuests}
                        </div>

                        <div style={{marginBottom: 8}}>
                            <strong> Tables currently occupied:</strong>{occupancy.occupiedTables}
                        </div>

                        <div style={{marginBottom: 8}}>
                            <strong>Active checked-in reservations:</strong>{occupancy.activeReservations}
                        </div>
                    </>
                )}
                {occupancyStatus && (
                    <div style={{ marginTop: 10}}>
                        {occupancyStatus}
                    </div>
                )}
            </section>

            <section className="dashboard-panel">
                <h3>Todays Bookings</h3>
                {/*TODO: ...*/}
            </section>

            <section className="dashboard-panel">
                <h3>Table Picker</h3>
                {/*TODO: ...*/}
            </section>

            <section className="dashboard-panel">
                <h3>Table Information</h3>
                {/*TODO: ...*/}
            </section>
        </AppLayout>
    );
}


export default OwnerDashboard;