import Layout from "../components/layouts/main";

import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import { fetcher } from "../components/common/functions";
import { ErrorDisplayer } from "../components/common/errors";

import { Card, Col, Row, Spinner, Button } from "react-bootstrap";

const Track = (props) => (
    <>
        <Card>
            <Card.Header as="h4" className="bg-dark text-white">
                {props.info.TrackName}
            </Card.Header>

            <Card.Body>
                <div className="text-center">
                    <audio controls>
                        <source
                            src={"/api/uploads/save/" + props.info.TrackID}
                            type="audio/mpeg"
                        />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            </Card.Body>
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
            <Col key={item.TrackID} xs={6}>
                <Track info={item} />
            </Col>
        ));

        return (
            <>
                <h1>Track List</h1>

                <div>
                    <Button variant="danger">Delete Selected Tracks</Button>
                </div>

                <br />

                <ErrorDisplayer error={error} />

                {data.payload.length > 0 ? (
                    <Row>{CueFormedList}</Row>
                ) : (
                    "No tracks"
                )}
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
