import React, {useState, useEffect} from 'react';
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav"
const DEFAULT_SETTINGS = {
    allowCustomerCancellation: true,
    allowChangeRequests:true,
    enableQrCheckIn: true,
    qrExpiryMinutes:30,

}

export default function OwnerRestaurantSettings(){
    const name = localStorage.getItem("name");
    const [loading, setLoading] = useState(true);
    const[saving, setSaving] = useState(false);
    const[status, setStatus] = useState("");
    const [settings, setSettings] = useState({
        bookingRule: {
            maxPartySize: "",
            daysAhead: "",
            slotMinutes: "",
            cancellationCutoffMinutes: "",
        },
        approval:{
            requireManualApproval: true,
            autoApproveBookings: false,
        },
        qr: {
            enableQrCheckIn: true,
            allowManualTokenEntry: true,
            qrExpiryMinutes: 60,
        },
        notifications:{
            emailNewBookingRequest: true,
            emailChangeRequest: true,
            emailCancellation: true,
        },
        accessibility:{
            showAccessibilityInfo: true,
            enableAccessibilityFilters:true,
        },
    });
    useEffect(()=>{
        async function loadSettings(){
            setLoading(true);
            setStatus("");
            try{
                const token = localStorage.getItem("token");
                const res = await fetch("/api/owner/restaurant/profile", {
                    headers: {
                        ...(token ? {Authorization: `Bearer ${token}`} : {}),
                    },
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    setStatus(data?.error || data?.message || "Failed to load profile");
                    return;
                }
                setSettings((prev)=>({
                    ...prev,
                    bookingRule: {
                        maxPartySize: data.bookingRule?.maxPartySize ?? "",
                        daysAhead: data.bookingRule?.daysAhead ?? "",
                        slotMinutes: data.bookingRule?.slotMinutes ?? "",
                        cancellationCutoffMinutes: data.bookingRule?.cancellationCutoffMinutes ?? "",
                    },
                }));
            } catch (err){
                console.log(err);
                setStatus("Failed to load profile");
            } finally {
                setLoading(false);
            }
        }
        loadSettings();
    },[]);

    function handleBookingRuleChange(e){
        const { name, value } = e.target;
        setSettings((prev)=> ({
            ...prev,
            bookingRule: {
                ...prev.bookingRule,
                [name]: value,
            },
        }));
    }

    function handleToggle(section, field){
        setSettings((prev)=> ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: !prev[section][field],
            },
        }));
    }
    function handleNumberChange(section, field, value){
        setSettings((prev)=> ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    }


    function handlePlaceholderSave(){
        setStatus("Settings UI saved locally for now. Backend wiring can be added later");
    }
    return (
        <AppLayout
            name={name}
            sideNav={<OwnerSideNav active="Settings"/>}
            >
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ marginBottom: 8}}>Restaurant Settings</h1>
                <p style={{margin:0}}>
                    Configure how the booking system behaves for your restaurant.
                </p>
            </div>
            {loading && <div className="dashboard-panel">Loading settings...</div>}
            {status && <div className="dashboard-panel">{status}</div>}
            {!loading && (
                <>
                <section className="dashboard-panel">
                    <h3> Booking Settings</h3>
                    <label> Max Party Size </label>
                    <input
                        type="number"
                        name="maxPartySize"
                        value={settings.bookingRule.maxPartySize}
                        onChange={handleBookingRuleChange}
                        style={{width:'100%', margin:"8px 0 12px 0" }}
                        />
                    <label>Days Ahead Allowed</label>
                    <input
                    type="number"
                    name="daysAhead"
                    value={settings.bookingRule.daysAhead}
                    onChange={handleBookingRuleChange}
                    style={{ width: "100%", margin:"8px 0 12px 0" }}
                    />
                    <label>Slot Duration (minutes)</label>
                    <input
                    type="number"
                    name="slotMinutes"
                    value={settings.bookingRule.slotMinutes}
                    onChange={handleBookingRuleChange}
                    style={{width:"100%", margin:"8px 0 12px 0" }}/>
                    <label>Cancellation Cutoff (minutes)</label>
                    <input
                        type="number"
                        name="cancellationCutoffMinutes"
                        value={settings.bookingRule.cancellationCutoffMinutes}
                        onChange={handleBookingRuleChange}
                        style={{ width: "100%", margin:"8px 0 12px 0" }}
                        />
                </section>
                <section className="dashboard-panel">
                    <h3> Approval Settings</h3>
                    <label style={{ display: "block" , marginBottom:12}}>
                        <input
                            type="checkbox"
                            checked={settings.approval.requireManualApproval}
                            onChange={()=>
                        handleToggle("approval", "requireManualApproval")
                        }
                            style={{marginRight: 8}}
                            />
                        Require Manual Approval
                    </label>
                    <label style={{display:"block", marginBottom:12}}>
                        <input
                            type="checkbox"
                            checked={settings.approval.autoApproveBookings}
                            onChange={()=>
                                handleToggle("approval", "autoApproveBookings")
                        }
                            style={{marginRight: 8}}
                            />
                        Auto-approve Bookings
                    </label>
                </section>
                    <section className="dashboard-panel">
                        <h3>Qr Check In Settings</h3>
                        <label style={{ display: "block" , marginBottom:12}}>
                            <input
                                type="checkbox"
                                checked={settings.qr.allowManualTokenEntry}
                                onChange={()=>
                            handleToggle("qr","allowManualTokenEntry")}
                                style={{marginRight: 8}}
                                />
                            Allow Manual Token Entry
                        </label>
                        <label>QR  Expirey (Minutes)</label>
                        <input
                            type="number"
                            value={settings.qr.qrExpiryMinutes}
                            onChange={(e)=>
                                handleNumberChange("qr","qrExpiryMinutes",e.target.value)
                        }
                            style={{ width: "100%", margin:"8px 0 12px 0" }}
                            />
                    </section>
                    <section className="dashboard-panel">
                        <h3>Notification Settings</h3>
                        <label style={{ display: "block" , marginBottom:12}}>
                            <input
                                type="checkbox"
                                checked={settings.notifications.emailNewBookingRequest}
                                onChange={()=>
                                    handleToggle("notifications", "emailNewBookingRequest")
                            }
                                style={{marginRight: 8}}
                                />
                            Email on New Booking Request
                        </label>
                        <label style={{ display: "block" , marginBottom:12}}>
                            <input
                                type="checkbox"
                                checked={settings.notifications.emailChangeRequest}
                                onChange={()=>
                                    handleToggle("notifications", "emailChangeRequest")
                            }
                                style={{marginRight: 8}}
                                />
                            Email on Change Request
                        </label>
                        <label style={{ display: "block" , marginBottom:12}}>
                            <input
                                type="checkbox"
                                checked={settings.notifications.emailCancellation}
                                onChange={()=>
                                    handleToggle("notifications", "emailCancellation")
                            }
                                style={{marginRight: 8}}
                                />
                            Email on Cancellation
                        </label>
                    </section>
                    <section className="dashboard-panel">
                        <h3> Accessibility Settings</h3>
                        <label style={{ display: "block" , marginBottom:12}}>
                            <input
                            type="checkbox"
                            checked={settings.accessibility.showAccessibilityInfo}
                            onChange={()=>
                            handleToggle("accessibility", "showAccessibilityInfo")
                            }
                            style={{marginRight: 8}}
                            />
                            Show Accessibility Information
                        </label>
                        <label style={{ display: "block" , marginBottom:12}}>
                            <input
                                type="checkbox"
                                checked={settings.accessibility.enableAccessibilityFilters}
                                onChange={()=>
                                    handleToggle("accessibility", "enableAccessibilityFilters")
                            }
                                style={{marginRight: 8}}
                                />
                            Enable Accessibility Filters
                        </label>
                    </section>
                    <section className="dashboard-panel">
                        <button
                            type="button"
                            className="sf-filterBtn"
                            onClick={handlePlaceholderSave}
                            >
                            Save Settings
                        </button>
                    </section>
                </>
            )}
        </AppLayout>
    );
}