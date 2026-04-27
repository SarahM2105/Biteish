import { authFetch } from "../../utils/authFetch";

async function readJsonSafe(response, fallback) {
    return response.json().catch(() => fallback);
}

export async function fetchCustomerRestaurant(restaurantId) {
    const response = await authFetch(`/api/customer/restaurants/${restaurantId}`);

    const data = await readJsonSafe(response, {});

    return { response, data };
}

export async function fetchCustomerRestaurantZones(restaurantId) {
    const response = await authFetch(`/api/customer/restaurants/${restaurantId}/zones`);

    const data = await readJsonSafe(response, []);

    return { response, data };
}

export async function fetchCustomerZoneTables(zoneId) {
    const response = await authFetch(`/api/customer/zones/${zoneId}/tables`);

    const data = await readJsonSafe(response, []);

    return { response, data };
}

export async function createCustomerBooking(tableId, payload) {
    const response = await authFetch(`/api/customer/tables/${tableId}/book`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const data = await readJsonSafe(response, {});

    return { response, data };
}