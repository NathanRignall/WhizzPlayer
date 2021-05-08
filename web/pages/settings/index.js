import Layout from "../../components/layouts/settings";

import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import { fetcher } from "../../components/common/functions";
import { ErrorDisplayer } from "../../components/common/errors";

import {} from "react-bootstrap";

// main app function
export default function Main() {
    return (
        <Layout title="Tracks">
            <h1>Settings Index</h1>
        </Layout>
    );
}
