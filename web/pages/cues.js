import Layout from "../components/layouts/main";

import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import { fetcher } from "../components/common/functions";
import { ErrorDisplayer } from "../components/common/errors";
import {
    CueCreateModal,
    CueEditModal,
    CueDeleteModal,
} from "../components/custom/manageCues";

import {
    Card,
    CardDeck,
    ListGroup,
    Spinner,
    Button,
    Modal,
} from "react-bootstrap";

const CueRepeatItem = (props) => (
    <ListGroup.Item variant={props.repeat ? "primary" : "light"}>
        {props.children}
    </ListGroup.Item>
);

const CueRepeatGrid = (props) => (
    <ListGroup horizontal="lg">
        <CueRepeatItem repeat={props.info.RepeatMonday}>Monday</CueRepeatItem>
        <CueRepeatItem repeat={props.info.RepeatTuesday}>Tuesday</CueRepeatItem>
        <CueRepeatItem repeat={props.info.RepeatWednesday}>
            Wednesday
        </CueRepeatItem>
        <CueRepeatItem repeat={props.info.RepeatThursday}>
            Thursday
        </CueRepeatItem>
        <CueRepeatItem repeat={props.info.RepeatFriday}>Friday</CueRepeatItem>
        <CueRepeatItem repeat={props.info.RepeatSaturday}>
            Saturday
        </CueRepeatItem>
        <CueRepeatItem repeat={props.info.RepeatSunday}>Sunday</CueRepeatItem>
    </ListGroup>
);

const CueInfoItem = (props) => (
    <Card bg="light" className="text-center">
        <Card.Body>
            <b>{props.title}</b>
            <br />
            {props.text}
        </Card.Body>
    </Card>
);

const Cue = (props) => (
    <>
        <Card>
            <Card.Header
                as="h4"
                className={
                    props.info.Enabled
                        ? "bg-success text-white"
                        : "bg-secondary text-white"
                }
            >
                {props.info.CueName}
            </Card.Header>

            <Card.Body>
                <CardDeck>
                    <CueInfoItem title="Track" text={props.info.TrackName} />
                    <CueInfoItem title="Time" text={props.info.PlayTime} />
                    <CueInfoItem
                        title="Repeats"
                        text={props.info.Repeats ? "Enabled" : "Disabled"}
                    />
                </CardDeck>

                {props.info.Repeats ? (
                    <div className="text-center">
                        <br />
                        <CueRepeatGrid info={props.info} />
                    </div>
                ) : (
                    ""
                )}

                <br />

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
                    <CueEditModal /> <CueDeleteModal />
                </div>
            </Card.Body>
        </Card>
        <br />
    </>
);

export function CueList() {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/app/cues",
        fetcher
    );

    if (data) {
        const CueFormedList = data.payload.map((item) => (
            <Cue key={item.CueID} info={item} />
        ));

        return (
            <>
                <ErrorDisplayer error={error} />
                {data.payload.length > 0 ? CueFormedList : "No cues"}
            </>
        );
    } else {
        return (
            <>
                <ErrorDisplayer error={error} />
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            </>
        );
    }
}

export default function Main() {
    return (
        <Layout title="Cues">
            <h1>Cue List</h1>

            <div>
                <CueCreateModal />{" "}
                <Button variant="danger">Delete Selected Cues</Button>
            </div>

            <br />

            <CueList />
        </Layout>
    );
}
