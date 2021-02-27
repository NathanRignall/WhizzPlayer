import Layout from "../components/layouts/main";

import Link from "next/link";
import useSWR from "swr";

const fetcher = async (url) => {
    const res = await fetch(url);

    // If the status code is not in the range 200-299,
    // we still try to parse and throw it.
    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");
        // Attach extra info to the error object.
        error.info = await res.json();
        error.status = res.status;
        throw error;
    }

    return res.json();
};

export default function Main() {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/app/status",
        fetcher
    );

    if (error) {
        console.log(error);
        return <>errror</>;
    }

    if (!data) {
        return <>loading</>;
    }
    if (data) {
        console.log(data);
        return <>data</>;
    } else {
        return <>WTF</>;
    }
}
