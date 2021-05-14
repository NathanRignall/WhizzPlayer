import Layout from "../../components/layouts/main";
import { useAppContext } from "../../components/context/state";

import useSWR from "swr";
import Link from "next/link";

import { fetcher } from "../../components/common/functions";
import { ErrorDisplayer } from "../../components/common/errors";
import { GridCreateModal } from "../../components/custom/manageGrids";

import { Card, Button, Nav, Spinner, Row, Col } from "react-bootstrap";

const GridNavigation = (props) => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/app/grids",
        fetcher
    );

    if (data) {
        const GridNavItems = data.payload.map((item) => (
            <div className="pb-2">
                <Link
                    href={{
                        pathname: "/grids/[id]",
                        query: { id: item.GridID },
                    }}
                >
                    <Button
                        href={"/grids/" + item.GridID}
                        variant="outline-primary"
                        size="lg"
                        block
                    >
                        {item.GridName}
                    </Button>
                </Link>
            </div>
        ));

        return (
            <>
                <ErrorDisplayer error={error} />
                {data.payload.length > 0 ? (
                    GridNavItems
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

const CreateGrid = () => {
    // global app context
    const context = useAppContext();

    return (
        <>
            {context.Access != 0 ? (
                <div class="ml-auto my-auto">
                    <GridCreateModal />
                </div>
            ) : null}
        </>
    );
};

// main app function
export default function Main() {
    return (
        <Layout title="Grids">
            <div class="d-flex">
                <h1>Grid List</h1>

                <CreateGrid />
            </div>

            <br />

            <Row>
                <Col md={3} xs={12}></Col>
                <Col md={6} xs={12}>
                    <GridNavigation />
                </Col>
                <Col md={3} xs={12}></Col>
            </Row>
        </Layout>
    );
}
