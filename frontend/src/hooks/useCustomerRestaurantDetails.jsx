import { useEffect, useState } from "react";

export default function useCustomerRestaurantDetails(restaurantId) {
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    useEffect(() => {
        if (!restaurantId) return;
        let ignore = false;
        async function loadRestaurant() {
            setLoading(true);
            setStatus("");
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(`/api/customer/restaurants/${restaurantId}`, {
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });

                const text = await res.text();
                const data = text ? JSON.parse(text) : null;

                if (!res.ok) {
                    if (!ignore) {
                        setStatus(data?.message || "Failed to load restaurant");
                        setRestaurant(null);
                    }
                    return;
                }

                if (!ignore) {
                    setRestaurant(data);
                }
            } catch (error) {
                console.error(error);
                if (!ignore) {
                    setStatus("Network/server error");
                    setRestaurant(null);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }
        loadRestaurant();
        return () => {
            ignore = true;
        };
    }, [restaurantId]);
    return {
        restaurant,
        loading,
        status,
    };
}