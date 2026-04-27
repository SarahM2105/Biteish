import { authFetch } from "../../components/utils/authFetch";

export async function readJsonSafe(response, fallback) {
    return response.json().catch(() => fallback);
}

export async function fetchOwnerRestaurant() {
    const response = await authFetch("/api/owner/restaurants");

    const data = await readJsonSafe(response, []);

    return {
        response,
        data,
        restaurant: Array.isArray(data) ? data[0] : null,
    };
}

export async function fetchOwnerZones(restaurantId) {
    const response = await authFetch(`/api/owner/restaurants/${restaurantId}/zones`);

    const data = await readJsonSafe(response, []);

    return { response, data };
}

export async function fetchTableTags() {
    const response = await authFetch("/api/owner/table-tags");

    const data = await readJsonSafe(response, {});

    return { response, data };
}

export async function fetchTablesForZones(zones) {
    const tableResults = await Promise.all(
        zones.map(async (zone) => {
            const response = await authFetch(`/api/owner/zones/${zone.id}/tables`);

            const data = await readJsonSafe(response, []);

            if (!response.ok || !Array.isArray(data)) {
                return [];
            }

            return data.map((table) => ({
                ...table,
                zoneName: zone.name,
            }));
        })
    );

    return tableResults.flat();
}

export async function saveZoneRequest({ restaurantId, zoneModal, values }) {
    const isEdit = zoneModal.mode === "edit" && zoneModal.zone;

    const response = await authFetch(
        isEdit
            ? `/api/owner/zones/${zoneModal.zone.id}`
            : `/api/owner/restaurants/${restaurantId}/zones`,
        {
            method: isEdit ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: values.name.trim(),
                description: values.description.trim() || null,
            }),
        }
    );

    const data = await readJsonSafe(response, {});

    return { response, data, isEdit };
}

export async function saveTableRequest({ tableModal, values }) {
    const isEdit = tableModal.mode === "edit" && tableModal.table;

    const response = await authFetch(
        isEdit
            ? `/api/owner/tables/${tableModal.table.id}`
            : `/api/owner/zones/${values.zoneId}/tables`,
        {
            method: isEdit ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: values.name.trim(),
                capacity: Number(values.capacity),
                reservable: values.reservable,
                active: values.active,
                tagIds: Array.isArray(values.tagIds) ? values.tagIds : [],
            }),
        }
    );

    const data = await readJsonSafe(response, {});

    return { response, data, isEdit };
}

export async function deleteRequest(deleteState) {
    const targetUrl =
        deleteState.type === "zone"
            ? `/api/owner/zones/${deleteState.item.id}`
            : `/api/owner/tables/${deleteState.item.id}`;

    const response = await authFetch(targetUrl, {
        method: "DELETE",
    });

    const data = await readJsonSafe(response, {});

    return { response, data };
}