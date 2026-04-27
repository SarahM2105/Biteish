import { useEffect, useState } from "react";
import { authFetch } from "../components/utils/authFetch";
import { getApiErrorMessage } from "../components/utils/getApiErrorMessage";

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
                const res = await authFetch(`/api/customer/restaurants/${restaurantId}`);
                const text = await res.text();
                const data = text ? JSON.parse(text) : {};

                if (!res.ok) {
                    if (!ignore) {
                        setStatus(getApiErrorMessage(data, "Failed to load restaurant"));
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