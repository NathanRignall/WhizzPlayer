import Layout from "../components/layouts/unified";
import { useAppContext } from "../components/context/state";

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
        <CueRepeatItem repeat={props.info.repeatMonday}>Monday</CueRepeatItem>
        <CueRepeatItem repeat={props.info.repeatTuesday}>Tuesday</CueRepeatItem>
        <CueRepeatItem repeat={props.info.repeatWednesday}>
            Wednesday
        </CueRepeatItem>
        <CueRepeatItem repeat={props.info.repeatThursday}>
            Thursday
        </CueRepeatItem>
        <CueRepeatItem repeat={props.info.repeatFriday}>Friday</CueRepeatItem>
        <CueRepeatItem repeat={props.info.repeatSaturday}>
            Saturday
        </CueRepeatItem>
        <CueRepeatItem repeat={props.info.repeatSunday}>Sunday</CueRepeatItem>
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
    // global app context
    const context = useAppContext();

    const date = new Date(props.info.time);
    const dateString = date.toString();
    return (
        <>
            <Card>
                <Card.Header
                    className={
                        props.info.enabled
                            ? "bg-success text-white"
                            : "bg-secondary text-white"
                    }
                >
                    <h4 className="d-inline">{props.info.name}</h4>

                    <Badge
                        className="ml-2"
                        variant={props.info.enabled ? "light" : "dark"}
                    >
                        {props.info.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                </Card.Header>

                <Card.Body>
                    <CardDeck>
                        <CueInfoItem
                            title="Track"
                            text={props.info.track.name}
                        />
                        <CueInfoItem title="Time" text={dateString} />
                        <CueInfoItem
                            title="Repeats"
                            text={props.info.repeat ? "Enabled" : "Disabled"}
                        />
                    </CardDeck>

                    {props.info.repeat ? (
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
                                src={"/api/uploads/save/" + props.info.track.id}
                                type="audio/mpeg"
                            />
                            Your browser does not support the audio element.
                        </audio>
                    </div>

                    <br />

                    {context.access != 0 ? (
                        <div className="text-right">
                            <CueEditModal info={props.info} />{" "}
                            <CueDeleteModal info={props.info} />
                        </div>
                    ) : null}
                </Card.Body>
            </Card>
            <br />
        </>
    );
};

// main cue list loader
const CueList = (props) => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/cue",
        fetcher
    );

    if (data) {
        const CueFormedList = data.payload.map((item) => (
            <Cue key={item.id} info={item} />
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

const CreateCue = () => {
    // global app context
    const context = useAppContext();

    return (
        <>
            {context.access != 0 ? (
                <div className="ml-auto my-auto">
                    <CueCreateModal />
                </div>
            ) : null}
        </>
    );
};

// main app function
export default function Main() {
    return (
        <Layout title="Cues" access={0}>
            <div className="d-flex">
                <h1>Cue List</h1>

                <CreateCue />
            </div>

            <br />
            <CueList />
        </Layout>
    );
}
