import Layout from "../components/layouts/base";

import { useRouter } from "next/router";
import useSWR from "swr";

import { fetcher } from "../components/common/functions";
import { Loader } from "../components/common/elements";
import { ErrorDisplayer } from "../components/common/errors";

// main app function
export default function Main() {
    const router = useRouter();

    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/session/logout",
        fetcher,
        {
            revalidateOnFocus: false,
        }
    );

    if (data) {
        // okay push back to login page
        router.push("/login");
        return <Loader />;
    } else {
        if (error) {
            // check if a not logged in error
            if (error.status == 401) {
                // not logged in
                router.push("/login");
                return <Loader />;
            } else {
                // error that can't be ignored
                return (
                    <>
                        <Loader />
                        <ErrorDisplayer error={error} />
                    </>
                );
            }
        } else {
            // no data loading
            return <Loader />;
        }
    }
}
