import Layout from "../../../components/layouts/main";

import useSWR from "swr";
import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";

import { WidthProvider, Responsive } from "react-grid-layout";
import _ from "lodash";

import { fetcher } from "../../../components/common/functions";
import { ErrorDisplayer } from "../../../components/common/errors";
import { GridItemCreateModal } from "../../../components/custom/manageGrids";

import { Card, Button, Nav, Spinner } from "react-bootstrap";

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

function saveToLS(key, value) {
    if (global.localStorage) {
        global.localStorage.setItem(
            "rgl-8",
            JSON.stringify({
                [key]: value,
            })
        );
    }
}

const ResponsiveReactGridLayout = WidthProvider(Responsive);

class AddRemoveLayout extends React.PureComponent {
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
                };
            }),
            newCounter: 0,
            layouts: JSON.parse(JSON.stringify(getFromLS("layouts") || {})),
        };

        this.onAddItem = this.onAddItem.bind(this);
        this.onBreakpointChange = this.onBreakpointChange.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.Items !== this.props.Items) {
            console.log("updated items map");
            this.setState({
                items: this.props.Items.map(function (item, key, list) {
                    return {
                        i: item.GridItemID.toString(),
                        x: 0,
                        y: 0,
                        w: 2,
                        h: 2,
                        name: item.GridItemName,
                    };
                }),
            });
        }
    }

    resetLayout() {
        this.setState({ layouts: {} });
    }

    onLayoutChange(layout, layouts) {
        saveToLS("layouts", layouts);
        this.setState({ layouts: layouts });
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
                <span className="text">{i}</span>

                <div className="wrap">
                    <h3>{name}</h3>
                    <Button disabled variant="primary">
                        Play
                    </Button>
                </div>

                <span
                    className="remove"
                    style={removeStyle}
                    onClick={this.onRemoveItem.bind(this, i)}
                >
                    x
                </span>
            </div>
        );
    }

    onAddItem(id, name) {
        /*eslint no-console: 0*/
        console.log("adding" + id);
        this.setState({
            // Add a new item. It must have a unique key!
            items: this.state.items.concat({
                i: id,
                x: (this.state.items.length * 2) % (this.state.cols || 12),
                y: 0,
                w: 2,
                h: 2,
                name: name,
            }),
            // Increment the counter to ensure key is always unique.
            newCounter: this.state.newCounter + 1,
        });
    }

    // We're using the cols coming back from this to calculate where to add new items.
    onBreakpointChange(breakpoint, cols) {
        this.setState({
            breakpoint: breakpoint,
            cols: cols,
        });
    }

    onRemoveItem(i) {
        console.log("removing", i);
        this.setState({ items: _.reject(this.state.items, { i: i }) });
    }

    render() {
        return (
            <div>
                <div class="d-flex">
                    <h1>{this.props.Grid.GridName}</h1>

                    <div class="ml-auto my-auto">
                        <GridItemCreateModal
                            AddItem={this.onAddItem}
                            GridID={this.props.Grid.GridID}
                        />{" "}
                        <Link
                            href={{
                                pathname: "/grids/[id]/edit",
                                query: { id: this.props.Grid.GridID },
                            }}
                        >
                            <Button
                                href={
                                    "/grids/" + this.props.Grid.GridID + "/edit"
                                }
                                variant="success"
                            >
                                Save Grid
                            </Button>
                        </Link>{" "}
                        <Link href={"/grids"}>
                            <Button href="/grids">All Grids</Button>
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
                    onBreakpointChange={this.onBreakpointChange}
                >
                    {_.map(this.state.items, (el) => this.createElement(el))}
                </ResponsiveReactGridLayout>
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
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
        }
    );

    if (data) {
        return (
            <>
                <ErrorDisplayer error={error} />

                <AddRemoveLayout
                    Items={data.payload.items}
                    Grid={data.payload.grid}
                ></AddRemoveLayout>
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
