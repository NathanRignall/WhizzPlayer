import Layout from "../components/layouts/base";

import Link from "next/link";
import useSWR from "swr";

import { fetcher } from "../components/common/functions";
import { ErrorDisplayer } from "../components/common/errors";
import { MainForm } from "../components/custom/registerForm";

import { Jumbotron, Container, Badge, Spinner, Button } from "react-bootstrap";

// component to show not in setup
const NotInSetup = (props) => (
    <>
        <div className="text-center">
            <h4>
                WhizzPlayer is not in setup mode, refer to the docs to manually
                put into setup mode
            </h4>
            <br />
            <Link href="/">
                <Button size="lg" variant="primary">
                    Return to home
                </Button>
            </Link>
        </div>
    </>
);

// register area loader
const RegisterArea = (props) => {
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
                <>
                    <h2>Register Admin User</h2>
                    <p>
                        Please fill in your details to register an admin user.
                    </p>
                    <MainForm />
                    <ErrorDisplayer error={error} />
                </>
            );
        } else {
            return (
                <>
                    <NotInSetup />
                    <ErrorDisplayer error={error} />
                </>
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

// main app function
export default function Main() {
    return (
        <Layout title="Home">
            <Jumbotron fluid className="bg-dark text-white">
                <Container>
                    <h1>Whizz Player SETUP</h1>
                    <Badge className="mb-2" variant="primary">
                        {process.env.NEXT_PUBLIC_VERSION}
                    </Badge>
                    <Badge className="ml-1 mb-2" variant="success">
                        By Nathan Rignall
                    </Badge>
                    <p>
                        Track scheduler system, create cues and upload audio
                        files to schedule audio playback
                    </p>
                </Container>
            </Jumbotron>

            <Container>
                <RegisterArea />
            </Container>
        </Layout>
    );
}
