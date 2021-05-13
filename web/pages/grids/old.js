import Layout from "../../components/layouts/main";

import useSWR from "swr";
import React from "react";
import { useState, useEffect, forwardRef } from "react";

import { WidthProvider, Responsive } from "react-grid-layout";

import { fetcher } from "../../components/common/functions";
import { ErrorDisplayer } from "../../components/common/errors";

import { Card, Button, Nav, Spinner } from "react-bootstrap";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("layouts") || {};
class ResponsiveLocalStorageLayout extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            layouts: JSON.parse(JSON.stringify(originalLayouts)),
            locked: true,
        };
    }

    resetLayout() {
        this.setState({ layouts: {} });
    }

    onLayoutChange(layout, layouts) {
        saveToLS("layouts", layouts);
        this.setState({ layouts: layouts });
    }

    lockUnlockEdit() {
        console.log("change");
        if (this.state.locked == true) {
            this.setState({ locked: false });
        } else {
            this.setState({ locked: true });
        }
    }

    render() {
        return (
            <div>
                <button onClick={() => this.resetLayout()}>Reset Layout</button>
                <button onClick={() => this.lockUnlockEdit()}>
                    Edit Layout
                </button>
                <ResponsiveReactGridLayout
                    className="layout"
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    compactType={null}
                    isDraggable={!this.state.locked}
                    isResizable={!this.state.locked}
                    rowHeight={100}
                    layouts={this.state.layouts}
                    onLayoutChange={(layout, layouts) =>
                        this.onLayoutChange(layout, layouts)
                    }
                >
                    {this.props.children}
                </ResponsiveReactGridLayout>
            </div>
        );
    }
}

const ReactGrid = (props) => {
    const [editMode, setEditMode] = useState(false);
    const [layouts, setLayouts] = useState(getFromLS("layouts"));

    const updateLayout = (layouts) => {
        saveToLS("layouts", layouts);
        setLayouts(layouts);
    };

    const resetLayout = () => {
        setLayouts({});
    };

    const changeMode = () => {
        if (editMode == true) {
            setEditMode(false);
            console.log("off");
        } else {
            setEditMode(true);
            console.log("on");
        }
    };

    return (
        <div>
            <button onClick={() => resetLayout()}>Reset Layout</button>
            <button onClick={() => changeMode()}>Edit Layout</button>
            <ResponsiveReactGridLayout
                className="layout"
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                compactType={null}
                rowHeight={100}
                isDraggable={editMode}
                isResizable={editMode}
                layouts={layouts}
                onLayoutChange={(layout, layouts) => updateLayout(layouts)}
            >
                {props.children}
            </ResponsiveReactGridLayout>
        </div>
    );
};

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

// main grid loader
const Grid = (props) => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL +
            "/app/grids/6798676713732571136/items",
        fetcher
    );

    if (data) {
        const GridFormedList = data.payload.items.map((item) => (
            <div
                key={item.GridItemID}
                data-grid={{ w: 2, h: 2, x: 0, y: 0, minW: 2, minH: 2 }}
            >
                <div className="wrap">
                    <h3>{item.GridItemName}</h3>
                    <Button variant="primary">Go somewhere 5</Button>
                </div>
            </div>
        ));

        return (
            <>
                <ErrorDisplayer error={error} />

                <ResponsiveLocalStorageLayout>
                    {GridFormedList}
                </ResponsiveLocalStorageLayout>
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
    return (
        <Layout title="Cues">
            <h1>Grids</h1>
            <Grid />
        </Layout>
    );
}
