import { useEffect, useState } from "react";
import { authFetch } from "../components/utils/authFetch";
import { getApiErrorMessage } from "../components/utils/getApiErrorMessage";

export default function useCustomerRecommendations() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [personalised, setPersonalised] = useState([]);
    const [popular, setPopular] = useState([]);

    useEffect(() => {
        async function loadRecommendations() {
            setLoading(true);
            setStatus("");

            try {
                const res = await authFetch("/api/customer/recommendations");
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setStatus(
                        getApiErrorMessage(data, "Failed to load recommendations")
                    );
                    setPersonalised([]);
                    setPopular([]);
                    return;
                }

                setPersonalised(
                    Array.isArray(data.personalised) ? data.personalised : []
                );
                setPopular(Array.isArray(data.popular) ? data.popular : []);
            } catch (error) {
                console.error(error);
                setStatus("Network/server error");
                setPersonalised([]);
                setPopular([]);
            } finally {
                setLoading(false);
            }
        }

        loadRecommendations();
    }, []);

    async function toggleFavourite(restaurantId) {
        const combined = [...personalised, ...popular];
        const restaurant = combined.find((item) => item.id === restaurantId);

        if (!restaurant) return;

        const method = restaurant.isFavourite ? "DELETE" : "POST";

        try {
            const res = await authFetch(
                `/api/customer/favourites/${restaurantId}`,
                {
                    method,
                }
            );

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(
                    getApiErrorMessage(data, "Failed to update favourite")
                );
            }

            setPersonalised((prev) =>
                prev.map((item) =>
                    item.id === restaurantId
                        ? { ...item, isFavourite: !restaurant.isFavourite }
                        : item
                )
            );

            setPopular((prev) =>
                prev.map((item) =>
                    item.id === restaurantId
                        ? { ...item, isFavourite: !restaurant.isFavourite }
                        : item
                )
            );
        } catch (error) {
            console.error(error);
        }
    }

    return {
        loading,
        status,
        personalised,
        popular,
        toggleFavourite,
    };
}