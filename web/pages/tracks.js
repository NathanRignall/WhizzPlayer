import Layout from "../components/layouts/main";

import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import { fetcher } from "../components/common/functions";
import { ErrorDisplayer } from "../components/common/errors";

import { Card, ListGroup, Spinner, Button, Modal } from "react-bootstrap";

const Track = (props) => (
    <>
        <Card>
            <Card.Header as="h4" className="bg-dark text-white">
                {props.info.TrackName}
            </Card.Header>

            <Card.Body>File</Card.Body>
        </Card>
        <br />
    </>
);

export function TrackList() {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/app/tracks",
        fetcher
    );

    if (data) {
        const CueFormedList = data.payload.map((item) => (
            <Track key={item.TrackID} info={item} />
        ));

        return (
            <>
                <h1>Track List</h1>

                <div>
                    <Button variant="danger">Delete Selected Tracks</Button>
                </div>

                <br />

                <ErrorDisplayer error={error} />
                {data.payload.length > 0 ? CueFormedList : "No tracks"}
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
}

export default function Main() {
    return (
        <Layout title="Tracks">
            <TrackList />
        </Layout>
    );
}
