import Layout from "../components/layouts/main";

import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";

import { TrackSearch } from "../components/common/functions";

import { Jumbotron, Container, Badge, Card } from "react-bootstrap";

const fetcher = async (url) => {
    const res = await fetch(url);

    if (!res.ok) {
        const error = new Error("An error occurred while fetching the data.");
        error.info = await res.json();
        error.status = res.status;
        throw error;
    }

    return res.json();
};

function StatusHeader() {
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
            </Container>
        </Jumbotron>
    );
}

export function StatusArea() {
    const router = useRouter();

    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/app/status",
        fetcher
    );

    if (error) {
        console.log(error);
        if (error.status == 401) {
            router.push("/login");
        } else if (error.status == 403) {
            return <>errror auth</>;
        } else {
            return <>errror</>;
        }
    }

    if (!data) {
        return <>loading</>;
    }
    if (data) {
        console.log(data);
        return <>data</>;
    } else {
        return <>WTF</>;
    }
}

export default function Main() {
    return (
        <Layout title="Tracks">
            <StatusHeader />
            <StatusArea />
            <Card>
                <Card.Header>Instant Play</Card.Header>
                <Card.Body>
                    <TrackSearch />
                </Card.Body>
            </Card>
        </Layout>
    );
}
