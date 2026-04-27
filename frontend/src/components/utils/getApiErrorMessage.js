export function getApiErrorMessage(data, fallback = "Something went wrong.") {
    return data?.error || data?.message || fallback;
}