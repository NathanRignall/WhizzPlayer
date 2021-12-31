import Layout from "../../components/layouts/unified";
import { useAppContext } from "../../components/context/state";

import useSWR from "swr";
import Link from "next/link";

import { fetcher } from "../../components/common/functions";
import { ErrorDisplayer } from "../../components/common/errors";
import {
    GridCreateModal,
    GridDeleteModal,
} from "../../components/custom/manageGrids";

import { Card, Button, Nav, Spinner, Row, Col, Alert } from "react-bootstrap";

// card for displyaing info about a grid
const Grid = (props) => {
    // global app context
    const context = useAppContext();

    return (
        <>
            <Card>
                <Card.Header as="h4" className="bg-primary text-white">
                    {props.info.name}
                </Card.Header>

                <Card.Body>
                    <Link
                        href={{
                            pathname: "/grids/[id]",
                            query: { id: props.info.id },
                        }}
                    >
                        <Button
                            href={"/grids/" + props.info.id}
                            variant="outline-primary"
                            block
                        >
                            View Grid
                        </Button>
                    </Link>

                    {context.Access != 0 ? (
                        <>
                            <br />

                            <div className="text-right">
                                <Link
                                    href={{
                                        pathname: "/grids/[id]/edit",
                                        query: { id: props.info.id },
                                    }}
                                >
                                    <Button
                                        href={"/grids/" + props.info.id}
                                        variant="primary"
                                    >
                                        Edit Grid
                                    </Button>
                                </Link>{" "}
                                <GridDeleteModal
                                    GridID={props.info.id}
                                    info={{ name: props.info.name }}
                                />
                            </div>
                        </>
                    ) : null}
                </Card.Body>
            </Card>
            <br />
        </>
    );
};

const GridList = (props) => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/grid",
        fetcher
    );

    if (data) {
        const GridsFormedList = data.payload.map((item) => (
            <Col key={item.id} md={6} xl={4}>
                <Grid info={item} />
            </Col>
        ));

        return (
            <>
                <ErrorDisplayer error={error} />
                {data.payload.length > 0 ? (
                    <Row>{GridsFormedList}</Row>
                ) : (
                    <Alert variant="warning">
                        There are currently 0 Grids in the system.
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
                <div className="ml-auto my-auto">
                    <GridCreateModal />
                </div>
            ) : null}
        </>
    );
};

// main app function
export default function Main() {
    return (
        <Layout title="Grids" access={0}>
            <div className="d-flex">
                <h1>Grid List</h1>

                <CreateGrid />
            </div>

            <br />

            <GridList />
        </Layout>
    );
}
