import Layout from "../components/layouts/main";

import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import { fetcher } from "../components/common/functions";

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

function CueDeleteModal(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button variant="danger" onClick={handleShow}>
                Delete Cue
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Modal title</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    I will not close if you click outside me. Don't even try to
                    press escape key.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary">Understood</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

function CueEditModal(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Edit Cue
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Modal title</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    I will not close if you click outside me. Don't even try to
                    press escape key.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary">Understood</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

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
                    <>
                        <br />
                        <CueRepeatGrid info={props.info} />
                    </>
                ) : (
                    ""
                )}
                <br />
                <CueEditModal /> <CueDeleteModal />
            </Card.Body>
        </Card>
        <br />
    </>
);

export function CueList() {
    const router = useRouter();

    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/app/cues",
        fetcher
    );

    if (error) {
        console.log(error);
        if (error.status == 401) {
            return <>errror need to login</>;
        } else if (error.status == 403) {
            return <>errror auth</>;
        } else {
            return <>errror</>;
        }
    }

    if (!data) {
        return (
            <div className="text-center">
                <Spinner animation="border" />
            </div>
        );
    }

    if (data.payload.length > 0) {
        return data.payload.map((item) => <Cue key={item.CueID} info={item} />);
    } else {
        return <>No Cues need to make one</>;
    }
}

export default function Main() {
    return (
        <Layout title="Cues">
            <h1>Cue List</h1>
            <div>
                <Button variant="primary">Create A Cue</Button>{" "}
                <Button variant="danger">Delete Selected Cues</Button>
            </div>
            <br />
            <CueList />
        </Layout>
    );
}
