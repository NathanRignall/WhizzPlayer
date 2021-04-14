import Layout from "../components/layouts/base";

import Link from "next/link";
import useSWR from "swr";

import { fetcher } from "../components/common/functions";
import { ErrorDisplayer } from "../components/common/errors";
import { MainForm } from "../components/custom/registerForm";

import { Jumbotron, Container, Badge, Spinner, Button } from "react-bootstrap";

const NotInSetup = (props) => (
    <>
        NOT IN SETUP MODE
        <Link href="/">
            <Button variant="success">Return to home</Button>
        </Link>
    </>
);

const RegisterArea = (props) => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/account/setup",
        fetcher,
        {
            revalidateOnFocus: false,
        }
    );

    if (data) {
        if (error) {
            if (error.status == 400) {
                return <NotInSetup />;
            }
            return <ErrorDisplayer error={error} />;
        } else {
            return (
                <>
                    <h2>Register Admin User</h2>
                    <p>Please fill in your details to register.</p>
                    <MainForm />
                </>
            );
        }
    } else {
        if (error) {
            if (error.status == 400) {
                return <NotInSetup />;
            }
            return <ErrorDisplayer error={error} />;
        } else {
            return (
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            );
        }
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
