import React, {useState} from 'react';
import DashboardLayout from "../../layouts/DashboardLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import {Scanner} from "@yudiel/react-qr-scanner";

export default function OwnerCheckIn() {
    const name = localStorage.getItem("name") || "owner";
    const [tokenInput, setTokenInput] = useState("");
    const [status, setStatus] = useState("");
    const [scanEnabled, setScanEnabled] = useState(false);
    const [checkInResult, setCheckInResult] = useState(false);

    async function handleCheckIn(e) {
        e.preventDefault();
        setStatus("");
        setCheckInResult(false);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/owner/check-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? {Authorization: `Bearer ${token}`} : {}),
                },
                body: JSON.stringify({
                    qrToken: tokenInput,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setStatus(data?.error || "check in failed");
                return;
            }
            setStatus("customer has been successfully checked in");
            setCheckInResult(data);
            setTokenInput("");
            setScanEnabled(false);
        } catch (error) {
            console.error(error);
            setStatus("Server Error");
        }
    }
    function handleScannerResult(codes){
        if (!codes || !codes.length) return;
        const scannedValue = codes[0]?.rawValue;
        if (!scannedValue) return;
        let extractedToken = scannedValue;
        try{
            const parsed = JSON.parse(scannedValue);
            if (parsed.type === "reservation_checkin" && parsed.token){
                extractedToken = parsed.token;
            }
        } catch {}

        setTokenInput(extractedToken);
        setStatus("QR scanned successfully. please press check in to continue");
        setScanEnabled(false);
    }

    return (
        <DashboardLayout name={name} sideNav={<OwnerSideNav active="Check In"/>}>
            <h1> QR Check in </h1>
            <div className="dashboard-panel" style={{ maxWidth: 520, marginBottom:20}}>
                <h3 style={{marginBottom: 12}}>Scan QR code</h3>
                <button
                    type="button"
                    className="button-to-be-designed"
                    onClick={() => setScanEnabled((prev)=> !prev)}
                    style={{marginBottom:12}}
                    > {scanEnabled ? "stop camera": "Start Camera Scammar"}</button>
                {scanEnabled && (
                    <div style={{width:"100%", maxWidth: 420}}>
                        <Scanner
                            onScan={handleScannerResult}
                            onError={(error)=> console.error(error)}
                            constraints={{facingMode: "environment"}}
                            />
                    </div>
                )}
            </div>
            <form onSubmit={handleCheckIn} className="dashboard-panel" style={{maxWidth:400}}>
                <label> paste or type in qr token</label>
                <input
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="QR Code Token"
                    style={{width: '100%', marginTop: 8}}
                />
                <button
                    className="sf-filterBtn"
                    style={{marginTop: 12}}
                >Check In
                </button>
                {status && (
                    <div style={{marginTop: 12}}>
                        {status}
                    </div>
                )}
            </form>
            {checkInResult && (
                <div className="dashboard-panel" style={{ maxWidth: 520, marginTop:20}}>
                    <h3 style={{marginBottom:12}}>Check In Suceesfull</h3>
                    <div>Customer: {checkInResult.customer?.name || "Customer"}</div>
                    <div>Restaurant: {checkInResult.restaurant?.name || "restaurant"}</div>
                    <div>Table: {checkInResult.table?.name || "Table"}</div>
                    <div>Party Size: {checkInResult.reservation?.partySize ?? "-"}</div>
                <div>
                    Booking time: {""}
                    {checkInResult.reservation?.startsAt
                    ? new Date(checkInResult.reservation.startsAt).toLocaleString("en-GB")
                    : "-"}
                </div>
                </div>
            )}
        </DashboardLayout>
    );
}