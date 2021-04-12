import axios from "axios";

// swr fetcher (handles errors)
export const fetcher = async (url) => {
    const res = await fetch(url);

    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");

        error.info = await res;
        error.status = res.status;

        console.error(error.info);
        throw error;
    }

    return res.json();
};
