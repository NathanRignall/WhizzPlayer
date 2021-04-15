import Layout from "../components/layouts/main";

import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import { fetcher } from "../components/common/functions";
import { ErrorDisplayer } from "../components/common/errors";
import { UploadTrackModal } from "../components/custom/manageTracks";

import { Card, Col, Row, Spinner, Button } from "react-bootstrap";

// card for displyaing info about a track
const Track = (props) => (
    <>
        <Card>
            <Card.Header as="h4" className="bg-secondary text-white">
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

                <br />

                <div className="text-right">
                    <Button variant="primary">Edit Track</Button>{" "}
                    <Button variant="danger">Delete Track</Button>
                </div>
            </Card.Body>
        </Card>
        <br />
    </>
);

// main track list loader
const TrackList = (props) => {
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
};

// main app function
export default function Main() {
    return (
        <Layout title="Tracks">
            <h1>Track List</h1>

            <div>
                <UploadTrackModal />{" "}
            </div>

            <br />
            <TrackList />
        </Layout>
    );
}
