import { useState, useEffect, forwardRef } from "react";
import { mutate } from "swr";

import { Formik, useFormikContext } from "formik";
import * as yup from "yup";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import axios from "axios";

import { Form, Button, Spinner, Modal, Alert } from "react-bootstrap";

// axios request urls
const SEARCH_URI = process.env.NEXT_PUBLIC_API_URL + "/app/tracks/lookup";
const GRIDS_URI = process.env.NEXT_PUBLIC_API_URL + "/app/grids";

// form schemas
const schemaGrid = yup.object().shape({
    gridName: yup.string().required(),
});

const schemaGridItem = yup.object().shape({
    GridItemName: yup.string().required(),
    GridItemColour: yup.string().required(),
    TrackID: yup.string().required(),
});

// track selector component
const TrackSelector = (props) => {
    // send details back to formik
    const { setFieldValue } = useFormikContext();

    // hold the current status
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const [singleSelections, setSingleSelections] = useState([]);

    useEffect(() => {
        if (props.type == "edit") {
            setSingleSelections([
                {
                    TrackName: props.DefaultTrackName,
                    TrackID: props.DefaultTrackID,
                },
            ]);
        }
    }, []);

    // if a single item is selected set the formik status
    useEffect(() => {
        if (singleSelections.length > 0) {
            setFieldValue(props.name, singleSelections[0].TrackID);
        }
    }, [singleSelections]);

    // main feild searcher
    const handleSearch = (query) => {
        // make the axios request for track search
        axios
            .get(`${SEARCH_URI}?search=${query}`)
            .then((response) => {
                // put the response into array
                const options = response.data.payload.map((items) => ({
                    TrackName: items.TrackName,
                    TrackID: items.TrackID,
                }));
                // set the options state to this new array
                setOptions(options);
            })
            .catch((error) => {
                // catch each type of axios error
                if (error.response) {
                    if (error.response.status == 400) {
                        console.log("No results in track search");
                    } else {
                        console.log("Error with response in track search");
                    }
                } else if (error.request) {
                    console.log("No response in track search");
                } else {
                    console.log("Axios error in track search");
                }
                // set options to itself
                setOptions(options);
            });
    };

    const filterBy = () => true;

    return (
        <AsyncTypeahead
            id={props.name}
            name={props.name}
            multiple={false}
            filterBy={filterBy}
            isLoading={isLoading}
            labelKey="TrackName"
            minLength={2}
            onSearch={handleSearch}
            options={options}
            onChange={setSingleSelections}
            selected={singleSelections}
            placeholder="Enter Track Name..."
            renderMenuItemChildren={(option, props) => (
                <span>{option.TrackName}</span>
            )}
        />
    );
};

// full create grid modal
export const GridCreateModal = (props) => {
    // contain the state of the modal
    const [show, setShow] = useState(false);

    // set the state of the modal
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // satus of the form requests
    const [serverState, setServerState] = useState({
        show: false,
        error: false,
        message: "none",
    });

    // set the server state from a response
    const handleServerResponse = (show, error, message) => {
        setServerState({ show, error, message });
    };

    // handle a from submit to create grid
    const handleOnSubmit = (values, actions) => {
        // create the json object to post grid
        const json = JSON.stringify({
            GridName: values.gridName,
        });

        // axios post create grid
        axios
            .post(GRIDS_URI, json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set loading to false
                actions.setSubmitting(false);
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the grids list
                mutate(GRIDS_URI);
                // close the modal
                handleClose();
            })
            .catch(function (error) {
                // catch each type of axios error
                if (error.response) {
                    if (error.response.status == 500) {
                        // check if a server error
                        handleServerResponse(
                            true,
                            true,
                            error.response.data.message
                        );
                    } else if (error.response.status == 502) {
                        // check if api is offline
                        handleServerResponse(true, true, "Error fetching api");
                    } else {
                        // check if a user error
                        handleServerResponse(
                            true,
                            false,
                            error.response.data.message
                        );
                    }
                    actions.setSubmitting(false);
                    // set loading to false
                } else if (error.request) {
                    // check if a request error
                    handleServerResponse(
                        true,
                        true,
                        "Error sending request to server"
                    );
                    actions.setSubmitting(false);
                    // set loading to false
                } else {
                    // check if a browser error
                    handleServerResponse(
                        true,
                        true,
                        "Error in browser request"
                    );
                    actions.setSubmitting(false);
                    // set loading to false
                    console.log(error);
                }
            });
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Create Grid
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                size="lg"
                centered={true}
                keyboard={false}
            >
                <Formik
                    validationSchema={schemaGrid}
                    initialValues={{
                        gridName: "",
                    }}
                    onSubmit={handleOnSubmit}
                >
                    {({
                        handleSubmit,
                        handleChange,
                        values,
                        errors,
                        isSubmitting,
                    }) => (
                        <Form noValidate onSubmit={handleSubmit}>
                            <Modal.Header className="bg-success text-white">
                                <Modal.Title>Create Grid</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {/* grid name group */}
                                <Form.Group controlId="validationFormik01">
                                    <Form.Control
                                        type="text"
                                        name="gridName"
                                        placeholder="Enter Grid Name"
                                        value={values.gridName}
                                        onChange={handleChange}
                                        isInvalid={errors.gridName}
                                        autoComplete="nickname"
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.displayName}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* display errors to the user */}
                                {serverState.show && (
                                    <Alert
                                        variant={
                                            !serverState.error
                                                ? "warning"
                                                : "danger"
                                        }
                                    >
                                        {serverState.message}
                                    </Alert>
                                )}
                            </Modal.Body>

                            <Modal.Footer>
                                {/* Close Modal button*/}
                                <Button
                                    variant="secondary"
                                    onClick={handleClose}
                                >
                                    Close
                                </Button>

                                {/* Submit button*/}
                                {isSubmitting ? (
                                    <Button type="submit" disabled>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="mr-2"
                                        />
                                        Loading...
                                    </Button>
                                ) : (
                                    <Button type="submit">Create</Button>
                                )}
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </>
    );
};

// full delete grid modal
export function GridDeleteModal(props) {
    // contain the state of the modal
    const [show, setShow] = useState(false);

    // set the state of the modal
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // satus of the form requests
    const [serverState, setServerState] = useState({
        show: false,
        error: false,
        message: "none",
    });

    // set the server state from a response
    const handleServerResponse = (show, error, message) => {
        setServerState({ show, error, message });
    };

    // handle delete grid
    const deleteGrid = () => {
        // axios delete grid
        axios
            .delete(`${GRIDS_URI}/${props.GridID}`, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the grid list
                mutate(GRIDS_URI);
                // close the modal
                handleClose();
            })
            .catch(function (error) {
                // catch each type of axios error
                if (error.response) {
                    if (error.response.status == 500) {
                        // check if a server error
                        handleServerResponse(
                            true,
                            true,
                            error.response.data.message
                        );
                    } else if (error.response.status == 502) {
                        // check if api is offline
                        handleServerResponse(true, true, "Error fetching api");
                    } else {
                        // check if a user error
                        handleServerResponse(
                            true,
                            false,
                            error.response.data.message
                        );
                    }
                } else if (error.request) {
                    // check if a request error
                    handleServerResponse(
                        true,
                        true,
                        "Error sending request to server"
                    );
                } else {
                    // check if a browser error
                    handleServerResponse(
                        true,
                        true,
                        "Error in browser request"
                    );
                    console.log(error);
                }
            });
    };

    return (
        <>
            <Button variant="danger" onClick={handleShow}>
                Delete Grid
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                size="md"
                centered={true}
                keyboard={false}
            >
                <Modal.Header className="bg-danger text-white">
                    <Modal.Title>Are you sure?</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    Are you sure you would like to delete the grid "
                    {props.info.GridName}"
                    <div className="pt-2">
                        {/* display errors to the user */}
                        {serverState.show && (
                            <Alert
                                variant={
                                    !serverState.error ? "warning" : "danger"
                                }
                            >
                                {serverState.message}
                            </Alert>
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    {/* Close Modal button*/}
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>

                    {/* Delete button*/}
                    <Button variant="danger" onClick={deleteGrid}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

// full create grid item modal
export const GridItemCreateModal = (props) => {
    // contain the state of the modal
    const [show, setShow] = useState(false);

    // set the state of the modal
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // satus of the form requests
    const [serverState, setServerState] = useState({
        show: false,
        error: false,
        message: "none",
    });

    // set the server state from a response
    const handleServerResponse = (show, error, message) => {
        setServerState({ show, error, message });
    };

    // handle a from submit to create grid item
    const handleOnSubmit = (values, actions) => {
        // create the json object to post grid item
        const json = JSON.stringify({
            GridItemName: values.GridItemName,
            GridItemColour: values.GridItemColour,
            TrackID: values.TrackID,
        });

        // axios post create grid item
        axios
            .post(`${GRIDS_URI}/${props.GridID}/items`, json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set loading to false
                actions.setSubmitting(false);
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the grid item list
                mutate(`${GRIDS_URI}/${props.GridID}/items`);
                // close the modal
                handleClose();
            })
            .catch(function (error) {
                // catch each type of axios error
                if (error.response) {
                    if (error.response.status == 500) {
                        // check if a server error
                        handleServerResponse(
                            true,
                            true,
                            error.response.data.message
                        );
                    } else if (error.response.status == 502) {
                        // check if api is offline
                        handleServerResponse(true, true, "Error fetching api");
                    } else {
                        // check if a user error
                        handleServerResponse(
                            true,
                            false,
                            error.response.data.message
                        );
                    }
                    actions.setSubmitting(false);
                    // set loading to false
                } else if (error.request) {
                    // check if a request error
                    handleServerResponse(
                        true,
                        true,
                        "Error sending request to server"
                    );
                    actions.setSubmitting(false);
                    // set loading to false
                } else {
                    // check if a browser error
                    handleServerResponse(
                        true,
                        true,
                        "Error in browser request"
                    );
                    actions.setSubmitting(false);
                    // set loading to false
                    console.log(error);
                }
            });
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Add Grid Item
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                size="lg"
                centered={true}
                keyboard={false}
            >
                <Formik
                    validationSchema={schemaGridItem}
                    initialValues={{
                        GridItemName: "",
                        GridItemColour: "#fefefe",
                        TrackID: "",
                    }}
                    onSubmit={handleOnSubmit}
                >
                    {({
                        handleSubmit,
                        handleChange,
                        values,
                        errors,
                        isSubmitting,
                    }) => (
                        <Form noValidate onSubmit={handleSubmit}>
                            <Modal.Header className="bg-success text-white">
                                <Modal.Title>Create Grid Item</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {/* grid name group */}
                                <Form.Group controlId="validationFormik01">
                                    <Form.Control
                                        type="text"
                                        name="GridItemName"
                                        placeholder="Enter Grid Item Name"
                                        value={values.GridItemName}
                                        onChange={handleChange}
                                        autoComplete="off"
                                    />

                                    {errors.GridItemName}
                                </Form.Group>

                                {/* track selector */}
                                <Form.Group controlId="validationFormik02">
                                    <TrackSelector name="TrackID" />

                                    {errors.TrackID}
                                </Form.Group>

                                {/* colour group */}
                                <Form.Group controlId="validationFormik03">
                                    <Form.Control
                                        as="select"
                                        name="GridItemColour"
                                        value={values.GridItemColour}
                                        onChange={handleChange}
                                        custom
                                    >
                                        <option value="#fefefe" label="Light" />
                                        <option value="#d6d8d9" label="Dark" />
                                        <option value="#f8d7da" label="Red" />
                                        <option
                                            value="#fff3cd"
                                            label="Yellow"
                                        />
                                        <option value="#d4edda" label="Green" />
                                        <option value="#d1ecf1" label="Cyan" />
                                        <option value="#cce5ff" label="Blue" />
                                        <option
                                            value="#d8d8f8"
                                            label="Purple"
                                        />
                                    </Form.Control>
                                </Form.Group>

                                <div className="pt-2">
                                    {/* display errors to the user */}
                                    {serverState.show && (
                                        <Alert
                                            variant={
                                                !serverState.error
                                                    ? "warning"
                                                    : "danger"
                                            }
                                        >
                                            {serverState.message}
                                        </Alert>
                                    )}
                                </div>
                            </Modal.Body>

                            <Modal.Footer>
                                {/* Close Modal button*/}
                                <Button
                                    variant="secondary"
                                    onClick={handleClose}
                                >
                                    Close
                                </Button>

                                {/* Submit button*/}
                                {isSubmitting ? (
                                    <Button type="submit" disabled>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="mr-2"
                                        />
                                        Loading...
                                    </Button>
                                ) : (
                                    <Button type="submit">Create</Button>
                                )}
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </>
    );
};

// full edit grid item modal
export const GridItemEditModal = (props) => {
    // contain the state of the modal
    const [show, setShow] = useState(false);

    // set the state of the modal
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // satus of the form requests
    const [serverState, setServerState] = useState({
        show: false,
        error: false,
        message: "none",
    });

    // set the server state from a response
    const handleServerResponse = (show, error, message) => {
        setServerState({ show, error, message });
    };

    // handle a from submit to edit grid item
    const handleOnSubmit = (values, actions) => {
        // create the json object to post grid item
        const json = JSON.stringify({
            GridItemName: values.GridItemName,
            GridItemColour: values.GridItemColour,
            TrackID: values.TrackID,
        });

        // axios post edit grid item
        axios
            .put(
                `${GRIDS_URI}/${props.GridID}/items/${props.info.GridItemID}`,
                json,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                }
            )
            .then((response) => {
                // set loading to false
                actions.setSubmitting(false);
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the grid item list
                mutate(`${GRIDS_URI}/${props.GridID}/items`);
                // close the modal
                handleClose();
            })
            .catch(function (error) {
                // catch each type of axios error
                if (error.response) {
                    if (error.response.status == 500) {
                        // check if a server error
                        handleServerResponse(
                            true,
                            true,
                            error.response.data.message
                        );
                    } else if (error.response.status == 502) {
                        // check if api is offline
                        handleServerResponse(true, true, "Error fetching api");
                    } else {
                        // check if a user error
                        handleServerResponse(
                            true,
                            false,
                            error.response.data.message
                        );
                    }
                    actions.setSubmitting(false);
                    // set loading to false
                } else if (error.request) {
                    // check if a request error
                    handleServerResponse(
                        true,
                        true,
                        "Error sending request to server"
                    );
                    actions.setSubmitting(false);
                    // set loading to false
                } else {
                    // check if a browser error
                    handleServerResponse(
                        true,
                        true,
                        "Error in browser request"
                    );
                    actions.setSubmitting(false);
                    // set loading to false
                    console.log(error);
                }
            });
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Edit Grid Item
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                size="lg"
                centered={true}
                keyboard={false}
            >
                <Formik
                    validationSchema={schemaGridItem}
                    initialValues={{
                        GridItemName: props.info.GridItemName,
                        GridItemColour: props.info.GridItemColour,
                        TrackID: "",
                    }}
                    onSubmit={handleOnSubmit}
                >
                    {({
                        handleSubmit,
                        handleChange,
                        values,
                        errors,
                        isSubmitting,
                    }) => (
                        <Form noValidate onSubmit={handleSubmit}>
                            <Modal.Header className="bg-success text-white">
                                <Modal.Title>
                                    Edit Grid Item: "{props.info.GridItemName}"
                                </Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {/* grid name group */}
                                <Form.Group controlId="validationFormik01">
                                    <Form.Control
                                        type="text"
                                        name="GridItemName"
                                        placeholder="Enter Grid Item Name"
                                        value={values.GridItemName}
                                        onChange={handleChange}
                                        autoComplete="off"
                                    />

                                    {errors.GridItemName}
                                </Form.Group>

                                {/* track selector */}
                                <Form.Group controlId="validationFormik02">
                                    <TrackSelector
                                        name="TrackID"
                                        type="edit"
                                        DefaultTrackName={props.info.TrackName}
                                        DefaultTrackID={props.info.TrackID}
                                    />

                                    {errors.TrackID}
                                </Form.Group>

                                {/* colour group */}
                                <Form.Group controlId="validationFormik03">
                                    <Form.Control
                                        as="select"
                                        name="GridItemColour"
                                        value={values.GridItemColour}
                                        onChange={handleChange}
                                        custom
                                    >
                                        <option value="#fefefe" label="Light" />
                                        <option value="#d6d8d9" label="Dark" />
                                        <option value="#f8d7da" label="Red" />
                                        <option
                                            value="#fff3cd"
                                            label="Yellow"
                                        />
                                        <option value="#d4edda" label="Green" />
                                        <option value="#d1ecf1" label="Cyan" />
                                        <option value="#cce5ff" label="Blue" />
                                        <option
                                            value="#d8d8f8"
                                            label="Purple"
                                        />
                                    </Form.Control>
                                </Form.Group>

                                <div className="pt-2">
                                    {/* display errors to the user */}
                                    {serverState.show && (
                                        <Alert
                                            variant={
                                                !serverState.error
                                                    ? "warning"
                                                    : "danger"
                                            }
                                        >
                                            {serverState.message}
                                        </Alert>
                                    )}
                                </div>
                            </Modal.Body>

                            <Modal.Footer>
                                {/* Close Modal button*/}
                                <Button
                                    variant="secondary"
                                    onClick={handleClose}
                                >
                                    Close
                                </Button>

                                {/* Submit button*/}
                                {isSubmitting ? (
                                    <Button type="submit" disabled>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="mr-2"
                                        />
                                        Loading...
                                    </Button>
                                ) : (
                                    <Button variant="success" type="submit">
                                        Apply Changes
                                    </Button>
                                )}
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </>
    );
};

// full delete grid item modal
export function GridItemDeleteModal(props) {
    // contain the state of the modal
    const [show, setShow] = useState(false);

    // set the state of the modal
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // satus of the form requests
    const [serverState, setServerState] = useState({
        show: false,
        error: false,
        message: "none",
    });

    // set the server state from a response
    const handleServerResponse = (show, error, message) => {
        setServerState({ show, error, message });
    };

    // handle delete grid item
    const deleteGridItem = () => {
        // axios delete grid item
        axios
            .delete(
                `${GRIDS_URI}/${props.GridID}/items/${props.info.GridItemID}`,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                }
            )
            .then((response) => {
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the grid item list
                mutate(`${GRIDS_URI}/${props.GridID}/items`);
                // close the modal
                handleClose();
            })
            .catch(function (error) {
                // catch each type of axios error
                if (error.response) {
                    if (error.response.status == 500) {
                        // check if a server error
                        handleServerResponse(
                            true,
                            true,
                            error.response.data.message
                        );
                    } else if (error.response.status == 502) {
                        // check if api is offline
                        handleServerResponse(true, true, "Error fetching api");
                    } else {
                        // check if a user error
                        handleServerResponse(
                            true,
                            false,
                            error.response.data.message
                        );
                    }
                } else if (error.request) {
                    // check if a request error
                    handleServerResponse(
                        true,
                        true,
                        "Error sending request to server"
                    );
                } else {
                    // check if a browser error
                    handleServerResponse(
                        true,
                        true,
                        "Error in browser request"
                    );
                    console.log(error);
                }
            });
    };

    return (
        <>
            <Button variant="danger" onClick={handleShow}>
                Delete Grid Item
            </Button>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                size="md"
                centered={true}
                keyboard={false}
            >
                <Modal.Header className="bg-danger text-white">
                    <Modal.Title>Are you sure?</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    Are you sure you would like to delete the grid item "
                    {props.info.GridItemName}"
                    <div className="pt-2">
                        {/* display errors to the user */}
                        {serverState.show && (
                            <Alert
                                variant={
                                    !serverState.error ? "warning" : "danger"
                                }
                            >
                                {serverState.message}
                            </Alert>
                        )}
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    {/* Close Modal button*/}
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>

                    {/* Delete button*/}
                    <Button variant="danger" onClick={deleteGridItem}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
