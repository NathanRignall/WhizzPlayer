import Layout from "../../components/layouts/main";

import { Card, Button, Nav } from "react-bootstrap";

import React from "react";
import { WidthProvider, Responsive } from "react-grid-layout";

const ResponsiveReactGridLayout = WidthProvider(Responsive);
const originalLayouts = getFromLS("layouts") || {};

/**
 * This layout demonstrates how to sync multiple responsive layouts to localstorage.
 */
class ResponsiveLocalStorageLayout extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            layouts: JSON.parse(JSON.stringify(originalLayouts)),
        };
    }
    compactType;
    resetLayout() {
        this.setState({ layouts: {} });
    }

    onLayoutChange(layout, layouts) {
        saveToLS("layouts", layouts);
        this.setState({ layouts });
    }

    render() {
        return (
            <div>
                <button onClick={() => this.resetLayout()}>Reset Layout</button>
                <ResponsiveReactGridLayout
                    className="layout"
                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                    compactType={null}
                    rowHeight={100}
                    layouts={this.state.layouts}
                    onLayoutChange={(layout, layouts) =>
                        this.onLayoutChange(layout, layouts)
                    }
                >
                    <div
                        key="1"
                        data-grid={{ w: 2, h: 3, x: 0, y: 0, minW: 2, minH: 3 }}
                    >
                        <div className="wrap">
                            <h3>Track Name Here</h3>
                            <Button variant="primary">Go somewhere</Button>
                        </div>
                    </div>
                    <div
                        key="2"
                        data-grid={{ w: 2, h: 3, x: 2, y: 0, minW: 2, minH: 3 }}
                    >
                        <div className="wrap">
                            <h3>Track Name Here</h3>
                            <Button variant="primary">Go somewhere</Button>
                        </div>
                    </div>
                    <div
                        key="3"
                        data-grid={{ w: 2, h: 3, x: 4, y: 0, minW: 2, minH: 3 }}
                    >
                        <div className="wrap">
                            <h3>Track Name Here</h3>
                            <Button variant="primary">Go somewhere</Button>
                        </div>
                    </div>
                    <div
                        key="4"
                        data-grid={{ w: 2, h: 3, x: 6, y: 0, minW: 2, minH: 3 }}
                    >
                        <div className="wrap">
                            <h3>Track Name Here</h3>
                            <Button variant="primary">Go somewhere</Button>
                        </div>
                    </div>
                    <div
                        key="5"
                        data-grid={{ w: 2, h: 3, x: 8, y: 0, minW: 2, minH: 3 }}
                    >
                        <div className="wrap">
                            <h3>Track Name Here</h3>
                            <Button variant="primary">Go somewhere</Button>
                        </div>
                    </div>
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

// main app function
export default function Main() {
    return (
        <Layout title="Cues">
            <h1>Grids</h1>

            <ResponsiveLocalStorageLayout />
        </Layout>
    );
}
