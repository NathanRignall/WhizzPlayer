import Layout from "../components/layouts/main";

import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import { fetcher } from "../components/common/functions";
import { ErrorDisplayer } from "../components/common/errors";
import {
    UploadTrackModal,
    TrackDeleteModal,
} from "../components/custom/manageTracks";

import { Card, Col, Row, Spinner, Button, Alert, Badge } from "react-bootstrap";

// card for displyaing info about a track
const Track = (props) => (
    <>
        <Card>
            <Card.Header as="h4" className="bg-secondary text-white">
                {props.info.TrackName}{" "}
                <Badge variant="info">{props.info.TrackType}</Badge>
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

                <br />

                <div className="text-right">
                    <TrackDeleteModal info={props.info} />
                </div>
            </Card.Body>
        </Card>
        <br />
    </>
);

// main track list loader
const TrackList = () => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/app/tracks",
        fetcher
    );

    if (data) {
        const CueFormedList = data.payload.map((item) => (
            <Col key={item.TrackID} xs={12} md={6}>
                <Track info={item} />
            </Col>
        ));

        return (
            <>
                <ErrorDisplayer error={error} />

                {data.payload.length > 0 ? (
                    <Row>{CueFormedList}</Row>
                ) : (
                    <Alert variant="warning">
                        There are currently 0 Tracks in the system.
                    </Alert>
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
};

// main app function
export default function Main() {
    return (
        <Layout title="Tracks">
            <div class="d-flex">
                <h1>Track List</h1>

                <div class="ml-auto my-auto">
                    <UploadTrackModal />
                </div>
            </div>

            <br />
            <TrackList />
        </Layout>
    );
}
