import Layout from "../components/layouts/base";

import { MainForm } from "../components/custom/loginForm";

import { Jumbotron, Container, Badge } from "react-bootstrap";

// main app function
export default function Main() {
    return (
        <Layout title="Login">
            <Jumbotron fluid>
                <Container>
                    <h1>Whizz Player</h1>
                    <Badge className="mb-2" variant="primary">
                        {process.env.NEXT_PUBLIC_VERSION}
                    </Badge>
                    <Badge className="ml-1 mb-2" variant="success">
                        By Nathan Rignall
                    </Badge>
                    <p>
                        Track scheduler system, create cues, manage grids and
                        upload audio files to schedule audio playback
                    </p>
                </Container>
            </Jumbotron>

            <Container>
                <h2>Login</h2>
                <p>Please fill in your credentials to login.</p>

                {/* Load the form component */}
                <MainForm />
            </Container>
        </Layout>
    );
}
