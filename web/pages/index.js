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
    CardDeck,
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
    <Card>
        <Card.Header as="h4" className={"bg-" + props.variant + " text-white"}>
            {props.header}
        </Card.Header>

        <Card.Body className="text-center">{props.children}</Card.Body>
    </Card>
);

// instant play
const InstantPlayCard = () => (
    <StatusCard variant="secondary" header="Instant Play">
        <InstantPlay />
    </StatusCard>
);

// now playing
const NowPlayingCard = () => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/app/status/playing",
        fetcher,
        { refreshInterval: 10000 }
    );

    if (data) {
        if (data.payload.playing == true) {
            return (
                <StatusCard variant="warning" header="Now Playing">
                    <h3>{data.payload.json.TrackName}</h3>
                </StatusCard>
            );
        } else {
            return (
                <StatusCard variant="secondary" header="Now Playing">
                    <h3>Not Playing</h3>
                </StatusCard>
            );
        }
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

// status area (cards)
const StatusArea = () => (
    <>
        <CardDeck>
            <InstantPlayCard />
            <NowPlayingCard />
        </CardDeck>

        <br />

        <CardDeck>
            <StatusCard variant="secondary" header="System Status">
                Status
            </StatusCard>
            <StatusCard variant="secondary" header="System Logs">
                Logs
            </StatusCard>
        </CardDeck>
    </>
);

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
