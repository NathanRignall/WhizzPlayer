import Layout from "../components/layouts/base";

import { useRouter } from "next/router";
import useSWR from "swr";

import { fetcher } from "../components/common/functions";
import { Loader } from "../components/common/elements";
import { ErrorDisplayer } from "../components/common/errors";

export default function Main() {
    const router = useRouter();

    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/account/logout",
        fetcher,
        {
            revalidateOnFocus: false,
        }
    );

    if (data) {
        // okay
        router.push("/login");
        return <Loader />;
    } else {
        if (error) {
            if (error.status == 401) {
                // not logged in
                router.push("/login");
                return <Loader />;
            } else {
                return (
                    <>
                        Error <Loader />
                    </>
                );
            }
        } else {
            // no data loading
            return <Loader />;
        }
    }
}
