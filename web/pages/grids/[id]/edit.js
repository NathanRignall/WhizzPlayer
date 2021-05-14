import Layout from "../../../components/layouts/main";

import useSWR, { mutate } from "swr";
import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { WidthProvider, Responsive } from "react-grid-layout";
import _ from "lodash";
import axios from "axios";

import { fetcher } from "../../../components/common/functions";
import { ErrorDisplayer, StickyError } from "../../../components/common/errors";
import {
    GridDeleteModal,
    GridItemCreateModal,
    GridItemDeleteModal,
} from "../../../components/custom/manageGrids";

import { Badge, Button, Spinner } from "react-bootstrap";

// axios request urls
const GRIDS_URI = process.env.NEXT_PUBLIC_API_URL + "/app/grids";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class ViewGrid extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            items: props.Items.map(function (item, key, list) {
                return {
                    i: item.GridItemID.toString(),
                    x: 0,
                    y: 0,
                    w: 2,
                    h: 2,
                    name: item.GridItemName,
                    colour: item.GridItemColour,
                    trackID: item.TrackID,
                };
            }),
            layouts: JSON.parse(props.Grid.Layout),
            serverStateLayout: {
                show: false,
                error: false,
                message: "none",
            },
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.Items !== this.props.Items) {
            this.setState({
                items: this.props.Items.map(function (item, key, list) {
                    return {
                        i: item.GridItemID.toString(),
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2,
                        name: item.GridItemName,
                        colour: item.GridItemColour,
                        trackID: item.TrackID,
                    };
                }),
            });
        }
    }

    createElement(el) {
        const removeStyle = {
            position: "absolute",
            right: "2px",
            top: 0,
            cursor: "pointer",
        };

        const i = el.i;
        const name = el.name;

        return (
            <div key={i} data-grid={el}>
                <div className="my-auto">
                    <h3>{name}</h3>
                    <Button disabled variant="primary">
                        Play
                    </Button>
                </div>

                <span className="remove" style={removeStyle}>
                    <GridItemDeleteModal
                        GridID={this.props.GridID}
                        info={{ GridItemID: i, GridItemName: name }}
                    />
                </span>
            </div>
        );
    }

    onLayoutChange(layout, layouts) {
        //saveToLS("layouts", layouts);
        this.setState({ layouts: layouts });
        // create the json object to post layout
        const json = JSON.stringify({
            layout: layouts,
        });
        // axios put request to save layout
        axios
            .put(`${GRIDS_URI}/${this.props.GridID}/layout`, json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set the server state to handle errors
                this.setState({
                    serverStateLayout: {
                        show: false,
                        error: false,
                        message: response.data.message,
                    },
                });
                // reload
                mutate(`${GRIDS_URI}/${this.props.GridID}/items`);
            })
            .catch((error) => {
                // catch each type of axios error
                if (error.response) {
                    if (error.response.status == 500) {
                        // check if a server error
                        this.setState({
                            serverStateLayout: {
                                show: true,
                                error: true,
                                message: error.response.data.message,
                            },
                        });
                    } else if (error.response.status == 502) {
                        // check if api is offline
                        this.setState({
                            serverStateLayout: {
                                show: true,
                                error: true,
                                message: "Error fetching api",
                            },
                        });
                    } else {
                        // check if a user error
                        this.setState({
                            serverStateLayout: {
                                show: true,
                                error: false,
                                message: error.response.data.message,
                            },
                        });
                    }
                } else if (error.request) {
                    // check if a request error
                    this.setState({
                        serverStateLayout: {
                            show: true,
                            error: true,
                            message: "Error sending request to server",
                        },
                    });
                } else {
                    // check if a browser error
                    this.setState({
                        serverStateLayout: {
                            show: true,
                            error: true,
                            message: "Error in browser request",
                        },
                    });
                    console.log(error);
                }
            });
    }

    render() {
        return (
            <div>
                <div className="d-flex flex-lg-row flex-column">
                    <h1>{this.props.Grid.GridName}</h1>

                    <div className="ml-lg-auto my-auto">
                        <GridItemCreateModal
                            AddItem={this.onAddItem}
                            GridID={this.props.Grid.GridID}
                        />{" "}
                        <GridDeleteModal
                            GridID={this.props.GridID}
                            info={{ GridName: this.props.Grid.GridName }}
                        />{" "}
                        <Link
                            href={{
                                pathname: "/grids/[id]",
                                query: { id: this.props.Grid.GridID },
                            }}
                        >
                            <Button
                                href={"/grids/" + this.props.Grid.GridID}
                                variant="success"
                            >
                                Finish Editing
                            </Button>
                        </Link>{" "}
                        <Link href={"/grids"}>
                            <Button variant="outline-primary" href="/grids">
                                All Grids
                            </Button>
                        </Link>
                    </div>
                </div>

                <ResponsiveReactGridLayout
                    className="layout"
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    compactType={null}
                    isDraggable={true}
                    isResizable={true}
                    rowHeight={100}
                    layouts={this.state.layouts}
                    onLayoutChange={(layout, layouts) =>
                        this.onLayoutChange(layout, layouts)
                    }
                >
                    {_.map(this.state.items, (el) => this.createElement(el))}
                </ResponsiveReactGridLayout>

                {/* display errors to the user */}
                {this.state.serverStateLayout.show && (
                    <StickyError
                        variant={
                            !this.state.serverStateLayout.error
                                ? "warning"
                                : "danger"
                        }
                        text={this.state.serverStateLayout.message}
                    />
                )}
            </div>
        );
    }
}

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
        return (
            <>
                <ErrorDisplayer error={error} />

                <ViewGrid
                    Items={data.payload.items}
                    Grid={data.payload.grid}
                    GridID={props.GridID}
                ></ViewGrid>
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

    if (id) {
        return (
            <Layout title="Grids">
                <Grid GridID={id} />
            </Layout>
        );
    } else {
        return (
            <Layout title="Grids">
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            </Layout>
        );
    }
}
