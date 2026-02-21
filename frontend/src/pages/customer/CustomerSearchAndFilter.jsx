import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import CustomerSideNav from "../../components/CustomerSideNav";
import { useNavigate } from "react-router-dom";

export default function CustomerSearchAndFilter() {
    const name = localStorage.getItem('name') || 'customer';
    const [active, setActive] = useState("Search and Filter");
    const [q, setQ] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [restaurants, setRestaurants] = useState([]);
    const [selected, setSelected] = useState(null);
    const [zones, setZones] = useState([]);
    const [zoneId, setZoneId] = useState("");
    const [zoneLoading, setZoneLoading] = useState(false);
    const [tables, setTables] = useState([]);
    const [tablesLoading, setTablesLoading] = useState(false);

    const navigate = useNavigate();

    function authFetch(url, options = {}) {
        const token = localStorage.getItem("token");
        return fetch(url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });
    }

    useEffect(() => {
        async function load() {
            try {
                const res = await authFetch("/api/customer/restaurants/search");
                const text = await res.text();
                const data = text ? JSON.parse(text) : [];
                setRestaurants(Array.isArray(data) ? data : data.restaurants || []);
            } catch (error) {
                console.log(error);
                setRestaurants([]);
            }
        }
        load();
    }, []);

    const filtered = restaurants.filter((r) =>
        (r.name || "").toLowerCase().includes(q.toLowerCase())
    );

    async function handleSelectRestaurant(restaurant) {
        setSelected(restaurant);
        setZones([]);
        setZoneId("");
        setTables([]);
        setZoneLoading(true);

        try {
            const res = await authFetch(`/api/customer/restaurants/${restaurant.id}/zones`);
            const text = await res.text();
            const data = text ? JSON.parse(text) : [];
            setZones(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log(error);
            setZones([]);
        } finally {
            setZoneLoading(false);
        }
    }

    async function handleSelectZone(zoneId) {
        setZoneId(zoneId);
        setTables([]);
        setTablesLoading(true);

        try {
            const res = await authFetch(`/api/customer/zones/${zoneId}/tables`);
            const text = await res.text();
            const data = text ? JSON.parse(text) : [];
            setTables(Array.isArray(data) ? data : []);
        } catch (error) {
            console.log(error);
            setTables([]);
        } finally {
            setTablesLoading(false);
        }
    }

    return (
        <DashboardLayout
            name={name}
            sideNav={<CustomerSideNav active={active} onNavigate={setActive} />}
        >
            <div className="sf-top">
                <div className="sf-search">
                    <span className="sf-search-icon">🔍︎</span>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search Restaurants"
                    />
                </div>

                <input
                    className="sf-input"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <input
                    className="sf-input"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />

                <button className="sf-filterBtn" type="button">
                    Filters
                </button>
            </div>

            <div className="sf-grid">
                <section className="sf-map">
                    <div className="sf-mapPlaceholder">map api</div>
                </section>

                <section className="sf-list">
                    <h3>Restaurants</h3>
                    <p style={{ opacity: 0.7 }}>
                        Loaded: {restaurants.length} | Showing: {filtered.length}
                    </p>

                    <div className="sf-cards">
                        {filtered.map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                className={`sf-card ${selected?.id === r.id ? "is-selected" : ""}`}
                                onClick={() => handleSelectRestaurant(r)}
                            >
                                <div className="sf-cardName">{r.name}</div>
                                <div className="sf-cardMeta">
                                    <span>{r.location || "Location"}</span>
                                    {r.cuisine && <span>{r.cuisine}</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                <aside className="sf-preview">
                    <div className="sf-previewBox">
                        {selected ? (
                            <>
                                <div className="sf-previewTitle">{selected.name}</div>
                                <div className="sf-previewText">{selected.location || " "}</div>

                                <h4 style={{ marginTop: 14 }}>Choose a zone</h4>

                                {zoneLoading && <div>Loading...</div>}
                                {!zoneLoading && zones.length === 0 && <div>No zones available.</div>}

                                <select
                                    className="sf-input"
                                    value={zoneId}
                                    onChange={(e) => handleSelectZone(e.target.value)}
                                    disabled={!zones.length}
                                >
                                    <option value="">Select Zone</option>
                                    {zones.map((z) => (
                                        <option key={z.id} value={z.id}>
                                            {z.name}
                                        </option>
                                    ))}
                                </select>

                                <h4 style={{ marginTop: 14 }}>Choose a table</h4>

                                {tablesLoading && <div>Loading...</div>}
                                {!tablesLoading && zoneId && tables.length === 0 && (
                                    <div>No tables available.</div>
                                )}

                                <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                                    {tables.map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            className="sf-bookBtn"
                                            onClick={() => navigate(`/customer/book/${t.id}`)}
                                        >
                                            {t.name || "Table"} | Seats {t.capacity}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div>Click a restaurant to preview details</div>
                        )}
                    </div>
                </aside>
            </div>
        </DashboardLayout>
    );
}
