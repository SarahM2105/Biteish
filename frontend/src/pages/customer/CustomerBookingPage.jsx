import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "../../layouts/AppLayout";
import CustomerSideNav from "../../components/CustomerSideNav";
import { logout } from "../../components/utils/logout";
import BookingProgress from "../../components/Customer/BookingForm/BookingProgress";
import BookingStep1Details from "../../components/Customer/BookingForm/BookingStep1Details";
import BookingStep2TableSelect from "../../components/Customer/BookingForm/BookingStep2TableSelect";
import BookingStep3Review from "../../components/Customer/BookingForm/BookingStep3Review";
import BookingStep4Confirmation from "../../components/Customer/BookingForm/BookingStep4Confirmation";
import { useTheme } from "../../ThemeContext";

export default function CustomerBookingPage() {
    const navigate = useNavigate();
    const { restaurantId } = useParams();
    const [collapsed, setCollapsed] = useState(false);
    const {isDarkMode, setIsDarkMode} = useTheme();
    const [active, setActive] = useState("Search and Filter");
    const [step, setStep] = useState(1);
    const [restaurant, setRestaurant] = useState(null);
    const [zones, setZones] = useState([]);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const [submitResult, setSubmitResult] = useState(null);
    const [form, setForm] = useState({
        date: "",
        time: "",
        partySize: 2,
        notes: "",
        zoneId: "",
        tableId: "",
    });
    function handleNavigate(label) {
        if (label === "Logout") {
            logout(navigate);
            return;
        }
        setActive(label);
    }
    useEffect(() => {
        async function loadRestaurant() {
            try {
                setLoading(true);
                setStatus("");
                const token = localStorage.getItem("token");
                const res = await fetch(`/api/customer/restaurants/${restaurantId}`, {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const data = await res.json().catch(() => null);
                if (!res.ok) {
                    setStatus(data?.message || "Failed to load restaurant");
                    return;
                }
                setRestaurant(data);
            } catch (error) {
                console.error(error);
                setStatus("Failed to load restaurant");
            } finally {
                setLoading(false);
            }
        }
        if (restaurantId) {
            loadRestaurant();
        }
    }, [restaurantId]);
    useEffect(() => {
        async function loadZones() {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`/api/customer/restaurants/${restaurantId}/zones`, {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const data = await res.json().catch(() => []);
                if (!res.ok) {
                    return;
                }
                setZones(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error(error);
            }
        }
        if (step >= 2 && restaurantId) {
            loadZones();
        }
    }, [step, restaurantId]);
    useEffect(() => {
        async function loadTables() {
            if (!form.zoneId) {
                setTables([]);
                return;
            }
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`/api/customer/zones/${form.zoneId}/tables`, {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                const data = await res.json().catch(() => []);
                if (!res.ok) {
                    return;
                }
                setTables(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error(error);
            }
        }
        if (step >= 2) {
            loadTables();
        }
    }, [step, form.zoneId]);
    const selectedZone = useMemo(() => {
        return zones.find((zone) => zone.id === form.zoneId) || null;
    }, [zones, form.zoneId]);
    const selectedTable = useMemo(() => {
        return tables.find((table) => table.id === form.tableId) || null;
    }, [tables, form.tableId]);
    function updateForm(field, value) {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    }
    function validateStep1() {
        if (!form.date || !form.time || !form.partySize) {
            setStatus("Please fill in date, time and party size");
            return false;
        }
        return true;
    }
    function validateStep2() {
        if (!form.zoneId || !form.tableId) {
            setStatus("Please choose a zone and a table");
            return false;
        }
        return true;
    }
    function handleNext() {
        setStatus("");
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setStep((prev) => Math.min(prev + 1, 4));
    }
    function handleBack() {
        setStatus("");
        setStep((prev) => Math.max(prev - 1, 1));
    }
    async function handleSubmitBooking() {
        try {
            setLoading(true);
            setStatus("");
            const token = localStorage.getItem("token");
            const startsAt = new Date(`${form.date}T${form.time}`);
            const slotMinutes = restaurant?.bookingRule?.slotMinutes || 90;
            const endsAt = new Date(startsAt.getTime() + slotMinutes * 60000);
            const res = await fetch(`/api/customer/tables/${form.tableId}/book`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    startsAt: startsAt.toISOString(),
                    endsAt: endsAt.toISOString(),
                    partySize: Number(form.partySize),
                    notes: form.notes,
                }),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) {
                setStatus(data?.error || data?.message || "Failed to create booking");
                return;
            }
            setSubmitResult(data);
            setStep(4);
        } catch (error) {
            console.error(error);
            setStatus("Failed to create booking");
        } finally {
            setLoading(false);
        }
    }
    return (
        <AppLayout
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((prev) => !prev)}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            sideNav={
                <CustomerSideNav
                    active={active}
                    onNavigate={handleNavigate}
                    collapsed={collapsed}
                />
            }
        >
            <div>
                <h1>Book restaurant</h1>
                <BookingProgress step={step} />
                {restaurant && (
                    <div>
                        <p><strong>Restaurant:</strong> {restaurant.name}</p>
                        <p><strong>Location:</strong> {restaurant.location}</p>
                    </div>
                )}
                {status && <p>{status}</p>}
                {loading && <p>Loading...</p>}

                {step === 1 && (
                    <BookingStep1Details
                        form={form}
                        updateForm={updateForm}
                    />
                )}
                {step === 2 && (
                    <BookingStep2TableSelect
                        zones={zones}
                        tables={tables}
                        form={form}
                        updateForm={updateForm}
                    />
                )}
                {step === 3 && (
                    <BookingStep3Review
                        restaurant={restaurant}
                        form={form}
                        selectedZone={selectedZone}
                        selectedTable={selectedTable}
                    />
                )}
                {step === 4 && (
                    <BookingStep4Confirmation
                        restaurant={restaurant}
                        submitResult={submitResult}
                    />
                )}
                {step < 4 && (
                    <div>
                        {step > 1 && (
                            <button type="button" onClick={handleBack}>
                                Back
                            </button>
                        )}
                        {step < 3 && (
                            <button type="button" onClick={handleNext}>
                                Next
                            </button>
                        )}
                        {step === 3 && (
                            <button type="button" onClick={handleSubmitBooking}>
                                Confirm booking
                            </button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}