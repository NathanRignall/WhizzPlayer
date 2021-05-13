import Layout from "../components/layouts/main";

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
    Badge,
    Alert,
} from "react-bootstrap";

// used for the cue repeat days area (each item)
const CueRepeatItem = (props) => (
    <ListGroup.Item variant={props.repeat ? "primary" : "light"}>
        {props.children}
    </ListGroup.Item>
);

// used for the cue repeat days area (the grid)
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

// card for displaying info about a cue (card)
const CueInfoItem = (props) => (
    <Card bg="light" className="text-center">
        <Card.Body>
            <b>{props.title}</b>
            <br />
            {props.text}
        </Card.Body>
    </Card>
);

// whole large card for displaying all the information about a cue
const Cue = (props) => {
    const date = new Date(props.info.PlayTime);
    const dateString = date.toString();
    return (
        <>
            <Card>
                <Card.Header
                    className={
                        props.info.Enabled
                            ? "bg-success text-white"
                            : "bg-secondary text-white"
                    }
                >
                    <h4>{props.info.CueName}</h4>

                    <div>
                        <Badge
                            className="mb-2"
                            variant={props.info.Enabled ? "light" : "dark"}
                        >
                            {props.info.Enabled ? "Enabled" : "Disabled"}
                        </Badge>
                    </div>
                </Card.Header>

                <Card.Body>
                    <CardDeck>
                        <CueInfoItem
                            title="Track"
                            text={props.info.TrackName}
                        />
                        <CueInfoItem title="Time" text={dateString} />
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
                        <CueEditModal info={props.info} />{" "}
                        <CueDeleteModal info={props.info} />
                    </div>
                </Card.Body>
            </Card>
            <br />
        </>
    );
};

// main cue list loader
const CueList = (props) => {
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
                {data.payload.length > 0 ? (
                    CueFormedList
                ) : (
                    <Alert variant="warning">
                        There are currently 0 Cues in the system.
                    </Alert>
                )}
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
};

// main app function
export default function Main() {
    return (
        <Layout title="Cues">
            <div class="d-flex">
                <h1>Cue List</h1>

                <div class="ml-auto my-auto">
                    <CueCreateModal />
                </div>
            </div>

            <br />
            <CueList />
        </Layout>
    );
}
