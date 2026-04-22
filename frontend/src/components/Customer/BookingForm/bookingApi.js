function getAuthHeaders(extraHeaders = {}) {
    const token = localStorage.getItem("token");

    return {
        ...extraHeaders,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function readJsonSafe(response, fallback) {
    return response.json().catch(() => fallback);
}

export async function fetchCustomerRestaurant(restaurantId) {
    const response = await fetch(`/api/customer/restaurants/${restaurantId}`, {
        headers: getAuthHeaders(),
    });

    const data = await readJsonSafe(response, null);

    return { response, data };
}

export async function fetchCustomerRestaurantZones(restaurantId) {
    const response = await fetch(`/api/customer/restaurants/${restaurantId}/zones`, {
        headers: getAuthHeaders(),
    });

    const data = await readJsonSafe(response, []);

    return { response, data };
}

export async function fetchCustomerZoneTables(zoneId) {
    const response = await fetch(`/api/customer/zones/${zoneId}/tables`, {
        headers: getAuthHeaders(),
    });

    const data = await readJsonSafe(response, []);

    return { response, data };
}

export async function createCustomerBooking(tableId, payload) {
    const response = await fetch(`/api/customer/tables/${tableId}/book`, {
        method: "POST",
        headers: getAuthHeaders({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify(payload),
    });

    const data = await readJsonSafe(response, null);

    return { response, data };
}