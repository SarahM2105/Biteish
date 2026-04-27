import React, { useState } from "react";
import AppLayout from "../../layouts/AppLayout";
import OwnerSideNav from "../../components/OwnerSideNav";
import { useTheme } from "../../ThemeContext";
import "../../components/Owner/Menu/css/Modal.css";
import "../../components/Owner/Menu/css/Header.css";
import "../../components/Owner/Menu/css/Cards.css";
import "../../components/Owner/Menu/css/MenuPage.css";
import MenuContent from "../../components/Owner/Menu/MenuContent";
import SectionModal from "../../components/Owner/Menu/SectionModal";
import ItemModal from "../../components/Owner/Menu/ItemModal";
import useOwnerMenuManager from "../../hooks/useOwnerMenuManager";

export default function OwnerMenu() {
    const { isDarkMode, setIsDarkMode } = useTheme();
    const [collapsed, setCollapsed] = useState(false);
    const [active, setActive] = useState("Menu");

    const {
        loading,
        saving,
        restaurantName,
        sections,
        availableTags,
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
    } = useOwnerMenuManager();

    function handleNavigate(label) {
        setActive(label);
    }

    return (
        <AppLayout
            collapsed={collapsed}
            onToggleSidebar={() => setCollapsed((prev) => !prev)}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode((prev) => !prev)}
            sideNav={
                <OwnerSideNav
                    active={active}
                    onNavigate={handleNavigate}
                    collapsed={collapsed}
                />
            }
        >
            <div className="owner-menu-page">
                <MenuContent
                    restaurantName={restaurantName}
                    summary={summary}
                    status={status}
                    loading={loading}
                    sections={sections}
                    saving={saving}
                    onOpenAddSection={openAddSection}
                    onOpenEditSection={openEditSection}
                    onDeleteSection={handleDeleteSection}
                    onOpenAddItem={openAddItem}
                    onOpenEditItem={openEditItem}
                    onDeleteItem={handleDeleteItem}
                    onToggleAvailability={handleToggleAvailability}
                />

                <SectionModal
                    open={showSectionModal}
                    saving={saving}
                    sectionForm={sectionForm}
                    setSectionForm={setSectionForm}
                    onClose={() => setShowSectionModal(false)}
                    onSubmit={handleSaveSection}
                />

                <ItemModal
                    open={showItemModal}
                    saving={saving}
                    itemForm={itemForm}
                    setItemForm={setItemForm}
                    sections={sections}
                    availableTags={availableTags}
                    onClose={() => setShowItemModal(false)}
                    onSubmit={handleSaveItem}
                />
            </div>
        </AppLayout>
    );
}