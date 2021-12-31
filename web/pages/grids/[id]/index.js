import Layout from "../../../components/layouts/unified";
import { AppContext } from "../../../components/context/state";

import useSWR, { mutate } from "swr";
import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { WidthProvider, Responsive } from "react-grid-layout";
import _ from "lodash";
import axios from "axios";

import { fetcher } from "../../../components/common/functions";
import { ErrorDisplayer, StickyError } from "../../../components/common/errors";
import { GridInfoCard } from "../../../components/custom/manageGrids";

import { Button, Spinner } from "react-bootstrap";

// request urls
const PLAY_URI = process.env.NEXT_PUBLIC_API_URL + "/play";
const STATUS_URI = process.env.NEXT_PUBLIC_API_URL + "/status";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

// view grid
class EditGrid extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            items: props.info.items.map(function (item, key, list) {
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
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.info.items !== this.props.info.items) {
            this.setState({
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
            });
        }
    }

    createElement(el) {
        const i = el.i;
        const name = el.name;
        const color = el.color;
        const trackId = el.trackId;

        const itemStyle = {
            backgroundColor: color,
        };

        return (
            <div key={i} data-grid={el} style={itemStyle}>
                <div className="d-flex h-100 align-items-center justify-content-center">
                    <div>
                        <h3>{name}</h3>
                        <Button
                            size="lg"
                            onClick={this.instantPlay.bind(this, trackId)}
                            variant="light"
                        >
                            Instant Play
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    instantPlay(TrackID) {
        axios
            .post(`${PLAY_URI}/${TrackID}`, {
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
                // mutate now playing
                mutate(`${STATUS_URI}/playing`);
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
                        <AppContext.Consumer>
                            {(context) =>
                                context.access != 0 ? (
                                    <Link
                                        href={{
                                            pathname: "/grids/[id]/edit",
                                            query: { id: this.props.info.id },
                                        }}
                                    >
                                        <Button
                                            href={
                                                "/grids/" +
                                                this.props.info.id +
                                                "/edit"
                                            }
                                            variant="primary"
                                        >
                                            Edit Grid
                                        </Button>
                                    </Link>
                                ) : null
                            }
                        </AppContext.Consumer>{" "}
                        <Link href={"/grids"}>
                            <Button variant="outline-primary" href="/grids">
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
                    isDraggable={false}
                    isResizable={false}
                    containerPadding={[0, 0]}
                    rowHeight={100}
                    layouts={this.state.layouts}
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
        process.env.NEXT_PUBLIC_API_URL + "/grid/" + props.id,
        fetcher
    );

    if (data) {
        return (
            <>
                <ErrorDisplayer error={error} />

                <EditGrid info={data.payload}></EditGrid>
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
            <Layout title="Grids" access={0}>
                <Grid id={id} />
            </Layout>
        );
    } else {
        return (
            <Layout title="Grids" access={0}>
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
            </Layout>
        );
    }
}
