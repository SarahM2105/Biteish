import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EditRestaurantProfileForm from "./EditRestaurantProfileForm";
import { authFetch } from "../../utils/authFetch";
import { getApiErrorMessage } from "../../utils/getApiErrorMessage";

const DAYS = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];

function readJsonSafe(response, fallback = {}) {
    return response.json().catch(() => fallback);
}

export default function EditRestaurantProfileContent() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        location: "",
        description: "",
        estimatedSpendMin: "",
        estimatedSpendMax: "",
        automaticSpendCalculation: true,
        bookingRule: {
            daysAhead: "",
            slotMinutes: "",
            cancellationCutoffMinutes: "",
        },
        openingHours: DAYS.map((day) => ({
            day,
            opensAt: "",
            closesAt: "",
        })),
    });

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [galleryStatus, setGalleryStatus] = useState("");
    const [uploadingImages, setUploadingImages] = useState(false);
    const [imageActionId, setImageActionId] = useState("");

    async function loadRestaurantImages() {
        const response = await authFetch("/api/owner/restaurant/images");
        const data = await readJsonSafe(response, {});

        if (!response.ok) {
            throw new Error(
                getApiErrorMessage(data, "Failed to load restaurant images")
            );
        }

        setImages(Array.isArray(data?.images) ? data.images : []);
    }

    useEffect(() => {
        async function loadProfile() {
            try {
                setLoading(true);
                setStatus("");

                const response = await authFetch("/api/owner/restaurant/profile");
                const data = await readJsonSafe(response, {});

                if (!response.ok) {
                    setStatus(getApiErrorMessage(data, "Failed to load profile"));
                    return;
                }

                const hoursMap = new Map(
                    (data.openingHours || []).map((hour) => [hour.day, hour])
                );

                setForm({
                    name: data.name || "",
                    location: data.location || "",
                    description: data.description || "",
                    estimatedSpendMin: data.estimatedSpendMin ?? "",
                    estimatedSpendMax: data.estimatedSpendMax ?? "",
                    automaticSpendCalculation: data.automaticSpendCalculation ?? true,
                    bookingRule: {
                        daysAhead: data.bookingRule?.daysAhead ?? "",
                        slotMinutes: data.bookingRule?.slotMinutes ?? "",
                        cancellationCutoffMinutes:
                            data.bookingRule?.cancellationCutoffMinutes ?? "",
                    },
                    openingHours: DAYS.map((day) => ({
                        day,
                        opensAt: hoursMap.get(day)?.opensAt || "",
                        closesAt: hoursMap.get(day)?.closesAt || "",
                    })),
                });

                setImages(Array.isArray(data.images) ? data.images : []);
            } catch (error) {
                console.error(error);
                setStatus("Server error");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleRuleChange(e) {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            bookingRule: {
                ...prev.bookingRule,
                [name]: value,
            },
        }));
    }

    function handleHourChange(index, field, value) {
        setForm((prev) => {
            const updatedHours = [...prev.openingHours];

            updatedHours[index] = {
                ...updatedHours[index],
                [field]: value,
            };

            return {
                ...prev,
                openingHours: updatedHours,
            };
        });
    }

    function handleAutomaticSpendToggle(e) {
        const checked = e.target.checked;

        setForm((prev) => ({
            ...prev,
            automaticSpendCalculation: checked,
            estimatedSpendMin: checked ? "" : prev.estimatedSpendMin,
            estimatedSpendMax: checked ? "" : prev.estimatedSpendMax,
        }));
    }

    async function handleImageUpload(e) {
        const files = Array.from(e.target.files || []);

        if (!files.length) return;

        if (files.length > 8) {
            setGalleryStatus("You can upload up to 8 images at a time.");
            e.target.value = "";
            return;
        }

        setUploadingImages(true);
        setGalleryStatus("");

        try {
            const formData = new FormData();

            files.forEach((file) => {
                formData.append("images", file);
            });

            const response = await authFetch("/api/owner/restaurant/images", {
                method: "POST",
                body: formData,
            });

            const data = await readJsonSafe(response, {});

            if (!response.ok) {
                setGalleryStatus(getApiErrorMessage(data, "Failed to upload images"));
                return;
            }

            await loadRestaurantImages();
            setGalleryStatus(data?.message || "Images uploaded successfully");
        } catch (error) {
            console.error(error);
            setGalleryStatus("Failed to upload images");
        } finally {
            setUploadingImages(false);
            e.target.value = "";
        }
    }

    async function handleSetPrimaryImage(imageId) {
        setImageActionId(imageId);
        setGalleryStatus("");

        try {
            const response = await authFetch(
                `/api/owner/restaurant/images/${imageId}/primary`,
                {
                    method: "PATCH",
                }
            );

            const data = await readJsonSafe(response, {});

            if (!response.ok) {
                setGalleryStatus(
                    getApiErrorMessage(data, "Failed to update primary image")
                );
                return;
            }

            setImages(Array.isArray(data?.images) ? data.images : []);
            setGalleryStatus(data?.message || "Primary image updated successfully");
        } catch (error) {
            console.error(error);
            setGalleryStatus("Failed to update primary image");
        } finally {
            setImageActionId("");
        }
    }

    async function handleDeleteImage(imageId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this restaurant image?"
        );

        if (!confirmed) return;

        setImageActionId(imageId);
        setGalleryStatus("");

        try {
            const response = await authFetch(`/api/owner/restaurant/images/${imageId}`, {
                method: "DELETE",
            });

            const data = await readJsonSafe(response, {});

            if (!response.ok) {
                setGalleryStatus(getApiErrorMessage(data, "Failed to delete image"));
                return;
            }

            setImages(Array.isArray(data?.images) ? data.images : []);
            setGalleryStatus(data?.message || "Image deleted successfully");
        } catch (error) {
            console.error(error);
            setGalleryStatus("Failed to delete image");
        } finally {
            setImageActionId("");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setStatus("Saving...");

        try {
            const payload = {
                name: form.name,
                location: form.location,
                description: form.description,
                estimatedSpendMin: form.automaticSpendCalculation
                    ? ""
                    : form.estimatedSpendMin,
                estimatedSpendMax: form.automaticSpendCalculation
                    ? ""
                    : form.estimatedSpendMax,
                bookingRule: {
                    daysAhead: form.bookingRule.daysAhead,
                    slotMinutes: form.bookingRule.slotMinutes,
                    cancellationCutoffMinutes:
                    form.bookingRule.cancellationCutoffMinutes,
                },
                openingHours: form.openingHours.filter(
                    (hour) => hour.opensAt && hour.closesAt
                ),
            };

            const response = await authFetch("/api/owner/restaurant/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await readJsonSafe(response, {});

            if (!response.ok) {
                setStatus(getApiErrorMessage(data, "Failed to save changes"));
                return;
            }

            navigate("/owner/restaurant/profile");
        } catch (error) {
            console.error(error);
            setStatus("Server error");
        }
    }

    return (
        <EditRestaurantProfileForm
            form={form}
            images={images}
            loading={loading}
            status={status}
            galleryStatus={galleryStatus}
            uploadingImages={uploadingImages}
            imageActionId={imageActionId}
            onChange={handleChange}
            onRuleChange={handleRuleChange}
            onHourChange={handleHourChange}
            onAutomaticSpendToggle={handleAutomaticSpendToggle}
            onImageUpload={handleImageUpload}
            onSetPrimaryImage={handleSetPrimaryImage}
            onDeleteImage={handleDeleteImage}
            onSubmit={handleSubmit}
        />
    );
}