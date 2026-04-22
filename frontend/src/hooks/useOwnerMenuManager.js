import { useEffect, useMemo, useState } from "react";
import {
    createEmptySectionForm,
    createEmptyItemForm,
} from "../components/Owner/Menu/menuFormHelpers";

export default function useOwnerMenuManager() {
    const token = localStorage.getItem("token");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [restaurantName, setRestaurantName] = useState("Your restaurant");
    const [sections, setSections] = useState([]);
    const [status, setStatus] = useState({ type: "", message: "" });

    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);

    const [sectionForm, setSectionForm] = useState(createEmptySectionForm());
    const [itemForm, setItemForm] = useState(createEmptyItemForm());

    async function loadMenu() {
        setLoading(true);

        try {
            const res = await fetch("/api/owner/menu", {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus({
                    type: "error",
                    message: data?.error || data?.message || "Failed to load menu.",
                });
                setSections([]);
                return;
            }

            setRestaurantName(data?.restaurantName || "Your restaurant");
            setSections(Array.isArray(data?.sections) ? data.sections : []);
            setStatus({ type: "", message: "" });
        } catch (error) {
            console.error(error);
            setStatus({
                type: "error",
                message: "Failed to load menu.",
            });
            setSections([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMenu();
    }, []);

    const summary = useMemo(() => {
        const items = sections.flatMap((section) => section.items || []);

        return {
            sections: sections.length,
            items: items.length,
            available: items.filter((item) => item.isAvailable).length,
        };
    }, [sections]);

    function openAddSection() {
        setSectionForm(createEmptySectionForm());
        setShowSectionModal(true);
    }

    function openEditSection(section) {
        setSectionForm({
            id: section.id,
            name: section.name || "",
            description: section.description || "",
            isActive: section.isActive ?? true,
        });
        setShowSectionModal(true);
    }

    function openAddItem(sectionId = "") {
        setItemForm(createEmptyItemForm(sectionId));
        setShowItemModal(true);
    }

    function openEditItem(item) {
        setItemForm({
            id: item.id,
            sectionId: item.sectionId || "",
            name: item.name || "",
            description: item.description || "",
            price: item.price ?? "",
            dietaryInfo: item.dietaryInfo || "",
            isAvailable: item.isAvailable ?? true,
        });
        setShowItemModal(true);
    }

    async function handleSaveSection(event) {
        event.preventDefault();

        if (!sectionForm.name.trim()) {
            setStatus({
                type: "error",
                message: "Section name is required.",
            });
            return;
        }

        setSaving(true);

        try {
            const isEditing = Boolean(sectionForm.id);
            const url = isEditing
                ? `/api/owner/menu/sections/${sectionForm.id}`
                : "/api/owner/menu/sections";

            const res = await fetch(url, {
                method: isEditing ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    name: sectionForm.name.trim(),
                    description: sectionForm.description.trim(),
                    isActive: sectionForm.isActive,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus({
                    type: "error",
                    message: data?.error || data?.message || "Failed to save section.",
                });
                return;
            }

            setShowSectionModal(false);
            setSectionForm(createEmptySectionForm());
            setStatus({
                type: "success",
                message: isEditing
                    ? "Section updated successfully."
                    : "Section created successfully.",
            });

            await loadMenu();
        } catch (error) {
            console.error(error);
            setStatus({
                type: "error",
                message: "Failed to save section.",
            });
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteSection(sectionId) {
        const confirmed = window.confirm(
            "Are you sure you want to remove this section and its items?"
        );

        if (!confirmed) return;

        setSaving(true);

        try {
            const res = await fetch(`/api/owner/menu/sections/${sectionId}`, {
                method: "DELETE",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus({
                    type: "error",
                    message: data?.error || data?.message || "Failed to delete section.",
                });
                return;
            }

            setStatus({
                type: "success",
                message: "Section deleted successfully.",
            });

            await loadMenu();
        } catch (error) {
            console.error(error);
            setStatus({
                type: "error",
                message: "Failed to delete section.",
            });
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveItem(event) {
        event.preventDefault();

        if (!itemForm.sectionId) {
            setStatus({
                type: "error",
                message: "Please choose a section for this item.",
            });
            return;
        }

        if (!itemForm.name.trim()) {
            setStatus({
                type: "error",
                message: "Item name is required.",
            });
            return;
        }

        if (itemForm.price === "" || Number(itemForm.price) < 0) {
            setStatus({
                type: "error",
                message: "Please enter a valid price.",
            });
            return;
        }

        setSaving(true);

        try {
            const isEditing = Boolean(itemForm.id);
            const url = isEditing
                ? `/api/owner/menu/items/${itemForm.id}`
                : "/api/owner/menu/items";

            const res = await fetch(url, {
                method: isEditing ? "PATCH" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    sectionId: itemForm.sectionId,
                    name: itemForm.name.trim(),
                    description: itemForm.description.trim(),
                    price: Number(itemForm.price),
                    dietaryInfo: itemForm.dietaryInfo.trim(),
                    isAvailable: itemForm.isAvailable,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus({
                    type: "error",
                    message: data?.error || data?.message || "Failed to save item.",
                });
                return;
            }

            setShowItemModal(false);
            setItemForm(createEmptyItemForm());
            setStatus({
                type: "success",
                message: isEditing
                    ? "Menu item updated successfully."
                    : "Menu item created successfully.",
            });

            await loadMenu();
        } catch (error) {
            console.error(error);
            setStatus({
                type: "error",
                message: "Failed to save item.",
            });
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteItem(itemId) {
        const confirmed = window.confirm("Remove this menu item?");

        if (!confirmed) return;

        setSaving(true);

        try {
            const res = await fetch(`/api/owner/menu/items/${itemId}`, {
                method: "DELETE",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus({
                    type: "error",
                    message: data?.error || data?.message || "Failed to delete item.",
                });
                return;
            }

            setStatus({
                type: "success",
                message: "Menu item deleted successfully.",
            });

            await loadMenu();
        } catch (error) {
            console.error(error);
            setStatus({
                type: "error",
                message: "Failed to delete item.",
            });
        } finally {
            setSaving(false);
        }
    }

    async function handleToggleAvailability(item) {
        setSaving(true);

        try {
            const res = await fetch(`/api/owner/menu/items/${item.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    isAvailable: !item.isAvailable,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setStatus({
                    type: "error",
                    message:
                        data?.error || data?.message || "Failed to update item visibility.",
                });
                return;
            }

            setStatus({
                type: "success",
                message: !item.isAvailable
                    ? "Menu item is now visible."
                    : "Menu item is now hidden.",
            });

            await loadMenu();
        } catch (error) {
            console.error(error);
            setStatus({
                type: "error",
                message: "Failed to update item visibility.",
            });
        } finally {
            setSaving(false);
        }
    }

    return {
        loading,
        saving,
        restaurantName,
        sections,
        status,
        summary,
        showSectionModal,
        showItemModal,
        sectionForm,
        itemForm,
        setShowSectionModal,
        setShowItemModal,
        setSectionForm,
        setItemForm,
        openAddSection,
        openEditSection,
        openAddItem,
        openEditItem,
        handleSaveSection,
        handleDeleteSection,
        handleSaveItem,
        handleDeleteItem,
        handleToggleAvailability,
    };
}