import Layout from "../../components/layouts/unified";

import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import { fetcher } from "../../components/common/functions";
import { ErrorDisplayer } from "../../components/common/errors";

import { Card, Table, Spinner, Button, Alert, Badge } from "react-bootstrap";

// main playback info loader
const PlaybackInfo = () => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/settings/playback",
        fetcher
    );

    if (data) {
        console.log(data.payload);
        return (
            <>
                <ErrorDisplayer error={error} />

                <Badge variant={data.payload.enabled ? "success" : "danger"}>
                    {data.payload.enbled ? "Dissabled" : "Enabled"}
                </Badge>

                <br/>
                
                Music {data.payload.volume.music}
                
                <br/>

                Voice {data.payload.volume.voice}
            </>
        );
    } else {
        return (
            <>
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
                <ErrorDisplayer error={error} />
            </>
        );
    }
};

// main app function
export default function Main() {
    return (
        <Layout title="Settings" access={10}>
            <h1>Playback Settings</h1>

            <div>test</div>

            <br />

            <PlaybackInfo />
        </Layout>
    );
}
