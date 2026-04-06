import React, {useEffect, useMemo, useState} from "react";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";

export default function OwnerAnalytics() {
    const name = localStorage.getItem("name");
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [occupancy, setOccupancy] = useState({
        occupiedGuests: 0,
        occupiedTables: 0,
        activeReservations: 0,
    });
    const [pendingReservations, setPendingReservations] = useState([]);
    const [changeRequests, setChangeRequests] = useState([]);
    useEffect(() => {
        async function loadAnalytics(){
            setLoading(true);
            setStatus("");
            try{
                const token = localStorage.getItem("token");
                const [occupancyRes, pendingRes, changeReqRes] = await Promise.all([
                    fetch("/api/owner/occupancy",{
                        headers: {
                            ...(token ? {Authorization: `Bearer ${token}`} : {}),
                        },
                    }),
                    fetch("/api/owner/reservations/pending", {
                        headers: {
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                    }),
                    fetch("/api/owner/change-request", {
                        headers: {
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                    }),
                ]);
                const occupancyData = await occupancyRes.json().catch(()=> ({}));
                const pendingData = await pendingRes.json().catch(()=> ([]));
                const changeReqData = await changeReqRes.json().catch(()=> ([]));
                if (!occupancyRes.ok){
                    throw new Error(occupancyData?.error || "Failed to load occupancy");
                }
                if(!pendingRes.ok){
                    throw new Error(occupancyData?.error || "Failed to load restaurant");
                }
                if (!pendingRes.ok){
                    throw new Error(
                        pendingData?.error || "Failed to load pending reservations"
                    );
                }
                if (!changeReqRes.ok) {
                    throw new Error(
                        changeReqData?.error || `Failed to load change requests (${changeReqRes.status})`
                    );
                }
                setOccupancy({
                    occupiedGuests: occupancyData?.occupiedGuests || 0,
                    occupiedTables: occupancyData?.occupiedTables || 0,
                    activeReservations: occupancyData?.activeReservations || 0,
                });
                setPendingReservations(Array.isArray(pendingData)? pendingData : []);
                setChangeRequests(Array.isArray(changeReqData)? changeReqData : []);
            } catch (err){
                console.error(err);
                setStatus(err.message|| "Failed to load analytics");
            } finally {
                setLoading(false);
            }
        }
        loadAnalytics();
    }, []);
    const analytics = useMemo(()=> {
        const pendingBookings = pendingReservations.length;
        const pendingChangeRequests = changeRequests.filter(
            (item) => item.status === "PENDING"
        ).length;
        const approvedChangeRequests = changeRequests.filter(
            (item) => item.status === "APPROVED"
        ).length;
        const declinedChangeRequests = changeRequests.filter(
            (item) => item.status === "DECLINED"
        ).length;
        return{
            liveGuests: occupancy.occupiedGuests,
            liveTables: occupancy.occupiedTables,
            activeCheckIns: occupancy.activeReservations,
            pendingBookings,
            pendingChangeRequests,
            approvedChangeRequests,
            declinedChangeRequests,
        };
    }, [occupancy, pendingReservations, changeRequests]);
    function StatCard({title, value, subtitle}){
        return (
            <div
                className="dashboard-panel"
                style={{
                    flex: "1 1 220px",
                    minWidth: 220,
                }}
                >
                <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.8 }}>{title}</div>
                <div style={{ fontSize: 32, fontWeight: 600, marginBottom: 8}}>{value}</div>
                {subtitle && <div style={{ fontSize: 14, marginBottom: 8 }}>{subtitle}</div>}
            </div>
        );
    }
    return(
        <AppLayout
            name={name}
            sideNav={<OwnerSideNav active="Analytics" />}
        >
            <div style={{ barginBottom:24}}>
                <h1 style={{marginBottom: 8}}>Analytics</h1>
                <p style={{ margin: 0 }}>
                    monitor booking activity, check-in performance, and owner workflow insights.
                </p>
            </div>
            {loading && <div className="dashboard-panel">Loading analytics...</div>}
            {status && <div className="dashboard-panel">{status}</div>}
            {!loading && !status && (
                <>
                <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 16,
                    marginBottom: 20,
                }}
                >
                    <StatCard
                        title="Live Guests Checked In"
                        value={analytics.liveGuests}
                        subtitle="Current guests in the restaurant"
                        />
                    <StatCard
                        title="Occupied Tables"
                        value={analytics.liveTables}
                        subtitle="Reservations currently checked in"
                    />
                    <StatCard
                        title="Active Check Ins"
                        value={analytics.activeCheckIns}
                        subtitle="Reservations currently checked in"
                    />
                    <StatCard
                        title="Pending Booking Requests"
                        value={analytics.pendingBookings}
                        subtitle="Bookings awaiting owner action"
                    />
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap:16,
                        marginBottom: 20,
                    }}
                    >
                    <section className="dashboard-panel">
                        <h3 style={{marginTop:0}}>Booking Workflow</h3>
                        <div style={{marginBottom:10}}>
                            <strong>Penidng Booking Requests</strong>{" "}
                            {analytics.pendingBookings}
                        </div>
                        <div style={{ marginBottom: 10}}>
                            <strong>Active Checked In Reservations:</strong>{" "}
                            {analytics.activeCheckIns}
                        </div>
                        <div>
                            <strong>Occupied Tables Right Now:</strong>{" "}
                            {analytics.liveTables}
                        </div>
                    </section>
                    <section className="dashboard-panel">
                        <h3 style={{marginTop:0}}>Change Request Summary</h3>
                        <div style={{marginBottom:10}}>
                            <strong>Pending:</strong>{analytics.pendingChangeRequests}
                        </div>
                        <div style={{marginBottom:10}}>
                            <strong>Approved:</strong>{analytics.approvedChangeRequests}
                        </div>
                        <div>
                            <strong>Declined:</strong>{analytics.declinedChangeRequests}
                        </div>
                    </section>
                </div>
                    <div
                        style={{
                            display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                        gap: 16,
                    }}
                        >
                        <section className="dashboard-panel">
                            <h3 style={{marginTop:0}}>Insights</h3>
                            <div style={{marginBottom:10}}>
                                Owners can use this page to monitor current service activity and operational demand.
                            </div>
                            <div style={{marginBottom: 10}}>
                                the live check in figures are useful for showing how the qr attendance feature supports real-time restaurant management.
                            </div>
                            <div>
                                the approval and change requests figures show how the system supports owner decision making beyond simple booking storage
                            </div>
                        </section>
                        <section className="dashboard-panel">
                            <h3 style={{marginTop:0}}>Planned extensions</h3>
                            <div style={{marginBottom:10}}>Bookings by day of the week</div>
                            <div style={{marginBottom:10}}>Busiest booking times</div>
                            <div style={{marginBottom:10}}>most used tables</div>
                            <div> check in rate vs confirmed reservation</div>
                        </section>
                    </div>
                </>
            )}
        </AppLayout>
    );
}