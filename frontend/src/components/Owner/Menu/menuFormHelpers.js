export function createEmptySectionForm() {
    return {
        id: "",
        name: "",
        description: "",
        isActive: true,
    };
}

export function createEmptyItemForm(sectionId = "") {
    return {
        id: "",
        sectionId,
        name: "",
        description: "",
        price: "",
        dietaryInfo: "",
        isAvailable: true,
        tagIds: [],
    };
}