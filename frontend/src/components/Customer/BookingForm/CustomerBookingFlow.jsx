import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import BookingProgress from "./BookingProgress";
import BookingStep1Details from "./BookingStep1Details";
import BookingStep2TableSelect from "./BookingStep2TableSelect";
import BookingStep3Review from "./BookingStep3Review";
import BookingStep4Confirmation from "./BookingStep4Confirmation";
import "./css/BookingStep1Details.css";
import "./css/CustomerBookingPage.css";
import "./css/BookingStep2TableSelect.css";
import "./css/BookingStep3Review.css";
import "./css/BookingStep4Confirmation.css";
import {
    getSelectedBookingDateTime,
    validateBookingStep1Input,
} from "./bookingValidation";
import {
    fetchCustomerRestaurant,
    fetchCustomerRestaurantZones,
    fetchCustomerZoneTables,
    createCustomerBooking,
} from "./bookingApi";

export default function CustomerBookingFlow() {
    const { restaurantId } = useParams();

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

    useEffect(() => {
        async function loadRestaurant() {
            try {
                setLoading(true);
                setStatus("");

                const { response, data } = await fetchCustomerRestaurant(restaurantId);

                if (!response.ok) {
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
                const { response, data } = await fetchCustomerRestaurantZones(restaurantId);

                if (!response.ok) {
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
                const { response, data } = await fetchCustomerZoneTables(form.zoneId);

                if (!response.ok) {
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
        const validationMessage = validateBookingStep1Input({
            form,
            restaurant,
        });

        if (validationMessage) {
            setStatus(validationMessage);
            return false;
        }

        return true;
    }

    function validateStep2() {
        if (!form.zoneId || !form.tableId) {
            setStatus("Please choose a zone and a table");
            return false;
        }

        if (!selectedTable) {
            setStatus("Please choose a valid table");
            return false;
        }

        const partySize = Number(form.partySize);

        if (
            Number.isFinite(partySize) &&
            Number.isFinite(Number(selectedTable.capacity)) &&
            partySize > Number(selectedTable.capacity)
        ) {
            setStatus("Selected table is too small for this party size");
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

            const step1ValidationMessage = validateBookingStep1Input({
                form,
                restaurant,
            });

            if (step1ValidationMessage) {
                setStatus(step1ValidationMessage);
                setLoading(false);
                return;
            }

            if (!selectedTable) {
                setStatus("Please choose a valid table");
                setLoading(false);
                return;
            }

            if (Number(form.partySize) > Number(selectedTable.capacity)) {
                setStatus("Selected table is too small for this party size");
                setLoading(false);
                return;
            }

            const selectedDateTime = getSelectedBookingDateTime(form.date, form.time);
            const startsAt = selectedDateTime;
            const slotMinutes = restaurant?.bookingRule?.slotMinutes || 90;
            const endsAt = new Date(startsAt.getTime() + slotMinutes * 60000);

            const { response, data } = await createCustomerBooking(form.tableId, {
                startsAt: startsAt.toISOString(),
                endsAt: endsAt.toISOString(),
                partySize: Number(form.partySize),
                notes: form.notes,
            });

            if (!response.ok) {
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
        <div className="booking-page">
            <section className="booking-page__header">
                <div className="booking-page__header-copy">
                    <p className="booking-page__eyebrow">Reservation</p>
                    <h1>Book restaurant</h1>
                    <p className="booking-page__intro">
                        Complete the steps below to choose your time, table,
                        and confirm your booking.
                    </p>
                    {restaurant ? (
                        <p className="booking-page__restaurant-name">
                            For <strong>{restaurant.name}</strong>
                        </p>
                    ) : null}
                </div>
            </section>

            <section className="booking-page__progress">
                <BookingProgress step={step} />
            </section>

            {status ? (
                <div className="booking-page__status booking-page__status--error">
                    {status}
                </div>
            ) : null}

            {loading && !restaurant ? (
                <div className="booking-page__status booking-page__status--neutral">
                    Loading booking details...
                </div>
            ) : null}

            <section className="booking-page__content">
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
            </section>

            {step < 4 && (
                <div className="booking-page__actions">
                    {step > 1 ? (
                        <button
                            type="button"
                            className="booking-page__button booking-page__button--secondary"
                            onClick={handleBack}
                        >
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 3 && (
                        <button
                            type="button"
                            className="booking-page__button booking-page__button--primary"
                            onClick={handleNext}
                        >
                            Next
                        </button>
                    )}

                    {step === 3 && (
                        <button
                            type="button"
                            className="booking-page__button booking-page__button--primary"
                            onClick={handleSubmitBooking}
                            disabled={loading}
                        >
                            {loading ? "Confirming..." : "Confirm booking"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}