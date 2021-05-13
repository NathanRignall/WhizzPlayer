import Layout from "../../../components/layouts/main";

import useSWR from "swr";
import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { WidthProvider, Responsive } from "react-grid-layout";

import { fetcher } from "../../../components/common/functions";
import { ErrorDisplayer } from "../../../components/common/errors";

import { Card, Button, Nav, Spinner, Alert } from "react-bootstrap";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class ResponsiveLocalStorageLayout extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            layouts: JSON.parse(JSON.stringify(getFromLS("layouts") || {})),
        };
    }

    render() {
        return (
            <div>
                <ResponsiveReactGridLayout
                    className="layout"
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    compactType={null}
                    isDraggable={false}
                    isResizable={false}
                    rowHeight={100}
                    layouts={this.state.layouts}
                >
                    {this.props.children}
                </ResponsiveReactGridLayout>
            </div>
        );
    }
}
function getFromLS(key) {
    let ls = {};
    if (global.localStorage) {
        try {
            ls = JSON.parse(global.localStorage.getItem("rgl-8")) || {};
        } catch (e) {
            /*Ignore*/
        }
    }
    return ls[key];
}

const GridItem = (props) => (
    <div className="wrap">
        <h3>{props.info.GridItemName}</h3>
        <Button variant="primary">Go somewhere 5</Button>
    </div>
);

// main grid loader
const Grid = (props) => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL +
            "/app/grids/" +
            props.GridID +
            "/items",
        fetcher
    );

    if (data) {
        const GridFormedList = data.payload.items.map((item) => (
            <div
                key={item.GridItemID}
                data-grid={{ w: 2, h: 2, x: 0, y: 0, minW: 2, minH: 2 }}
            >
                <GridItem info={item} />
            </div>
        ));

        return (
            <>
                <ErrorDisplayer error={error} />

                <div class="d-flex">
                    <h1>{data.payload.grid.GridName}</h1>

                    <div class="ml-auto my-auto">
                        <Link
                            href={{
                                pathname: "/grids/[id]/edit",
                                query: { id: props.GridID },
                            }}
                        >
                            <Button
                                href={"/grids/" + props.GridID + "/edit"}
                                variant="warning"
                            >
                                Edit Grid
                            </Button>
                        </Link>{" "}
                        <Link href={"/grids"}>
                            <Button href="/grids">All Grids</Button>
                        </Link>
                    </div>
                </div>

                <br />

                {data.payload.items.length > 0 ? (
                    <ResponsiveLocalStorageLayout>
                        {GridFormedList}
                    </ResponsiveLocalStorageLayout>
                ) : (
                    <Alert variant="warning">
                        There are currently 0 items in this grid
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

// main app function
export default function Main() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <Layout title="Grids">
            <Grid GridID={id} />
        </Layout>
    );
}
