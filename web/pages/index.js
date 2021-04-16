import Layout from "../components/layouts/main";

import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";

import { fetcher } from "../components/common/functions";
import { ErrorDisplayer, StickyError } from "../components/common/errors";
import InstantPlay from "../components/custom/instantPlay";
import HaltPlayModal from "../components/custom/haltPlay";

import {
    Jumbotron,
    Col,
    Row,
    Container,
    Badge,
    Card,
    Spinner,
} from "react-bootstrap";

// setup warning
const SetupModeWarning = () => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/account/setup",
        fetcher,
        {
            revalidateOnFocus: false,
        }
    );

    if (data) {
        if (data.message == "true") {
            return (
                <StickyError
                    variant="danger"
                    text="System in setup mode, must dissable for security reasons"
                />
            );
        } else {
            return "";
        }
    } else {
        if (error) {
            console.error(error);
        }
        return "";
    }
};

// top status header
const StatusHeader = () => {
    return (
        <Jumbotron>
            <Container>
                <h1>Whizz Player</h1>
                <Badge className="mb-2" variant="primary">
                    {process.env.NEXT_PUBLIC_VERSION}
                </Badge>
                <Badge className="ml-1 mb-2" variant="success">
                    By Nathan Rignall
                </Badge>
                <p>
                    Track scheduler system, create cues and upload audio files
                    to schedule audio playback
                </p>
                <HaltPlayModal />
            </Container>
        </Jumbotron>
    );
};

// status card
const StatusCard = (props) => (
    <Col xs={12} md={6}>
        <Card>
            <Card.Header as="h4" className="bg-secondary text-white">
                {props.header}
            </Card.Header>

            <Card.Body>{props.children}</Card.Body>
        </Card>
        <br />
    </Col>
);

// status area (cards)
const StatusArea = () => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/app/status",
        fetcher
    );

    //TODO: display information
    if (data) {
        return (
            <>
                <Row>
                    <StatusCard header="Instant Play">
                        <InstantPlay />
                    </StatusCard>
                    <StatusCard header="Now Playing">No song</StatusCard>
                    <StatusCard header="System Status">
                        System Status
                    </StatusCard>
                    <StatusCard header="System Log">System Log</StatusCard>
                </Row>
                <ErrorDisplayer error={error} />
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
            <StatusHeader />
            <StatusArea />

            <SetupModeWarning />
        </Layout>
    );
}
