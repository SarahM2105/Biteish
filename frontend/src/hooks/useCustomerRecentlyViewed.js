import { useEffect, useState } from "react";
import { authFetch } from "../components/utils/authFetch";
import { getApiErrorMessage } from "../components/utils/getApiErrorMessage";

export default function useCustomerRecentlyViewed() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("");
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    useEffect(() => {
        async function loadRecentlyViewed() {
            try {
                setLoading(true);
                setStatus("");

                const res = await authFetch("/api/customer/recently-viewed");
                const data = await res.json().catch(() => ({}));

                if (!res.ok) {
                    setStatus(
                        getApiErrorMessage(data, "Failed to load recently viewed.")
                    );
                    setRecentlyViewed([]);
                    return;
                }

                setRecentlyViewed(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error(error);
                setStatus("Failed to load recently viewed.");
                setRecentlyViewed([]);
            } finally {
                setLoading(false);
            }
        }

        loadRecentlyViewed();
    }, []);

    return {
        loading,
        status,
        recentlyViewed,
    };
}