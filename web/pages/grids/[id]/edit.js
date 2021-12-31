import Layout from "../../../components/layouts/unified";

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
    GridItemEditModal,
    GridItemDeleteModal,
    GridInfoCard,
} from "../../../components/custom/manageGrids";

import { Badge, Button, Spinner } from "react-bootstrap";

// axios request urls
const GRIDS_URI = process.env.NEXT_PUBLIC_API_URL + "/grid";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class ViewGrid extends React.PureComponent {
    constructor(props) {
        super(props);

        console.log(props.items);

        this.state = {
            items: this.props.info.items.map(function (item, key, list) {
                return {
                    i: item.id,
                    x: 0,
                    y: 0,
                    w: 2,
                    h: 2,
                    name: item.name,
                    color: item.color,
                    trackId: item.track.id,
                    trackName: item.track.name,
                };
            }),
            layouts: props.info.layout,
            serverStateLayout: {
                show: false,
                error: false,
                message: "none",
            },
            editMode: true,
        };
        this.editModeManual = this.editModeManual.bind(this);
    }

    editModeManual(mode) {
        this.setState({
            editMode: mode,
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.info.items !== this.props.info.items) {
            this.setState({
                items: this.props.info.items.map(function (item, key, list) {
                    return {
                        id: item.id,
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2,
                        name: item.name,
                        color: item.color,
                        track: item.track,
                    };
                }),
            });
        }
    }

    createElement(item) {
        const id = item.id;
        const name = item.name;
        const color = item.color;
        const track = item.track;

        const itemStyle = {
            backgroundColor: color,
        };

        const removeStyle = {
            position: "absolute",
            right: "5px",
            top: "5px",
            cursor: "pointer",
        };

        const editStyle = {
            position: "absolute",
            left: "5px",
            top: "5px",
            cursor: "pointer",
        };

        return (
            <div key={id} data-grid={item} style={itemStyle}>
                <div className="d-flex h-100 align-items-center justify-content-center">
                    <div>
                        <h3>{name}</h3>

                        <Button size="lg" variant="light" disabled>
                            Instant Play
                        </Button>
                    </div>
                </div>

                <span className="remove" style={removeStyle}>
                    <GridItemDeleteModal
                        info={{
                            id: id,
                            name: name,
                            gridId: this.props.info.id,
                        }}
                        editModeManual={this.editModeManual}
                    />
                </span>

                <span className="edit" style={editStyle}>
                    <GridItemEditModal
                        info={{
                            id: id,
                            name: name,
                            color: color,
                            track: track,
                            gridId: this.props.info.id,
                        }}
                        editModeManual={this.editModeManual}
                    />
                </span>
            </div>
        );
    }

    onLayoutChange(layout, layouts) {
        console.log(layouts);
        this.setState({ layouts: layouts });
        // create the json object to post layout
        const json = {
            layout: layouts,
        };
        // axios put request to save layout
        axios
            .put(`${GRIDS_URI}/${this.props.info.id}/layout`, json, {
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
                mutate(`${GRIDS_URI}/${this.props.info.id}`);
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
                    <h1>{this.props.info.name}</h1>

                    <div className="ml-lg-auto my-auto">
                        <GridItemCreateModal id={this.props.info.id} />{" "}
                        <GridDeleteModal
                            id={this.props.info.id}
                            info={{ name: this.props.info.name }}
                        />{" "}
                        <Link
                            href={{
                                pathname: "/grids/[id]",
                                query: { id: this.props.info.id },
                            }}
                        >
                            <Button
                                href={"/grids/" + this.props.info.id}
                                variant="success"
                            >
                                Finish Editing
                            </Button>
                        </Link>{" "}
                        <Link href={"/grids"}>
                            <Button variant="outline-primary" href="/grid">
                                All Grids
                            </Button>
                        </Link>
                    </div>
                </div>

                <br />
                <GridInfoCard />

                <br />
                <ResponsiveReactGridLayout
                    className="layout"
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    compactType={null}
                    isDraggable={this.state.editMode}
                    isResizable={this.state.editMode}
                    containerPadding={[0, 0]}
                    rowHeight={100}
                    layouts={this.state.layouts}
                    onLayoutChange={(layout, layouts) =>
                        this.onLayoutChange(layout, layouts)
                    }
                >
                    {_.map(this.state.items, (item) =>
                        this.createElement(item)
                    )}
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
    const { data, error } = useSWR(`${GRIDS_URI}/${props.id}`, fetcher);

    if (data) {
        return (
            <>
                <ErrorDisplayer error={error} />

                <ViewGrid info={data.payload}></ViewGrid>
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
            <Layout title="Grids" access={5}>
                <Grid id={id} />
            </Layout>
        );
    } else {
        return (
            <Layout title="Grids" access={5}>
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            </Layout>
        );
    }
}
