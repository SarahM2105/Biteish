import React, { useEffect, useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";

export default function CustomerProfile() {
    const fallbackName = localStorage.getItem("name") || "customer";

    const [me, setMe] = useState({ name: fallbackName, email: "—", role: "—" });
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            setStatus("");
            try {
                const token = localStorage.getItem("token");
                const res = await fetch("/api/customer/me", {
                    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                });

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    setStatus(data?.error || data?.message || "Failed to load profile");
                    return;
                }
                setMe({
                    name: data?.name || fallbackName,
                    email: data?.email || "—",
                    role: data?.role || "—",
                });
            } catch (e) {
                console.error(e);
                setStatus("Network/server error");
            } finally {
                setLoading(false);
            }
        })();
    }, [fallbackName]);

    return (
        <AppLayout name={me.name} sideNav={<CustomerSideNav active="Profile and Preferences" />}>
            <h1 className="page-title">Profile</h1>

            {loading && <div style={{ opacity: 0.85 }}>Loading…</div>}
            {status && <div style={{ opacity: 0.85 }}>{status}</div>}

            <div className="dashboard-panel" style={{ maxWidth: 520 }}>
                <div style={{ display: "grid", gap: 12 }}>
                    <div>
                        <div style={{ opacity: 0.7, fontSize: 13 }}>Name</div>
                        <div style={{ fontWeight: 600 }}>{me.name}</div>
                    </div>

                    <div>
                        <div style={{ opacity: 0.7, fontSize: 13 }}>Email</div>
                        <div style={{ fontWeight: 600 }}>{me.email}</div>
                    </div>

                    <div>
                        <div style={{ opacity: 0.7, fontSize: 13 }}>Role</div>
                        <div style={{ fontWeight: 600 }}>{me.role}</div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
