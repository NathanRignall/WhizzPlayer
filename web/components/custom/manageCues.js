import { useState, useEffect, forwardRef } from "react";
import { mutate } from "swr";

import { Formik, useField, useFormikContext } from "formik";
import * as yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import axios from "axios";

import { Form, Button, Spinner, Modal, Alert } from "react-bootstrap";

// axios request urls
const SEARCH_URI = process.env.NEXT_PUBLIC_API_URL + "/track/find";
const CUES_URI = process.env.NEXT_PUBLIC_API_URL + "/cue";

// form schema
const schema = yup.object().shape({
    name: yup.string().required(),
    trackId: yup.string().required(),
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
                    name: props.DefaultTrackName,
                    id: props.DefaultTrackID,
                },
            ]);
        }
    }, []);

    // if a single item is selected set the formik status
    useEffect(() => {
        if (singleSelections.length > 0) {
            setFieldValue(props.name, singleSelections[0].id);
        }
    }, [singleSelections]);

    // main feild searcher
    const handleSearch = (query) => {
        // make the axios request for track search
        axios
            .get(`${SEARCH_URI}?find=${query}`)
            .then((response) => {
                // put the response into array
                const options = response.data.payload.map((items) => ({
                    name: items.name,
                    id: items.id,
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
            labelKey="name"
            minLength={2}
            onSearch={handleSearch}
            options={options}
            onChange={setSingleSelections}
            selected={singleSelections}
            placeholder="Enter Track Name..."
            renderMenuItemChildren={(option, props) => (
                <span>{option.name}</span>
            )}
        />
    );
};

// cue create date selector
const DateSelector = ({ ...props }) => {
    // send details back to formik
    const { setFieldValue } = useFormikContext();

    // hold the current status
    const [field] = useField(props);

    // custom button to control date picker
    const ExampleCustomInput = forwardRef(({ value, onClick }, ref) => (
        <Button variant="light" type="button" onClick={onClick} ref={ref}>
            {value ? value : "Set Date and Time"}
        </Button>
    ));

    return (
        <DatePicker
            {...field}
            {...props}
            selected={field.value}
            dateFormat="MM/dd/yyyy HH:mm:ss"
            showTimeInput
            todayButton="Today"
            customInput={<ExampleCustomInput />}
            onChange={(val) => {
                setFieldValue(field.name, val);
            }}
        />
    );
};

// full create cue modal
export const CueCreateModal = (props) => {
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

    // handle a from submit to create cue
    const handleOnSubmit = (values, actions) => {
        // create the time object
        const time = new Date(values.time);
        time.setSeconds(0);

        // create the json object to post lcue
        const json = {
            name: values.name,
            trackId: values.trackId,
            time: time.toISOString().slice(0, 19).replace("T", " "),
            enabled: values.enabled,
        };

        // axios post create cue
        axios
            .post(CUES_URI, json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set loading to false
                actions.setSubmitting(false);
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the cue list
                mutate(CUES_URI);
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
                Create Cue
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
                    validationSchema={schema}
                    initialValues={{
                        name: "",
                        trackId: "",
                        time: new Date(),
                        enabled: true,
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
                                <Modal.Title>Create Cue</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {/* cue name group */}
                                <Form.Group controlId="validationFormik01">
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        placeholder="Enter Name"
                                        value={values.name}
                                        onChange={handleChange}
                                        autoComplete="off"
                                    />

                                    {errors.name}
                                </Form.Group>

                                {/* track selector */}
                                <Form.Group controlId="validationFormik05">
                                    <TrackSelector name="trackId" />

                                    {errors.trackId}
                                </Form.Group>

                                {/* cue time group */}
                                <Form.Group controlId="validationFormik02">
                                    <DateSelector name="time" />

                                    {errors.time}
                                </Form.Group>

                                {/* enabled group */}
                                <Form.Group controlId="validationFormik03">
                                    <Form.Check
                                        type="switch"
                                        name="enabled"
                                        label="Enabled"
                                        checked={values.enabled}
                                        value={values.enabled}
                                        onChange={handleChange}
                                        isInvalid={errors.enabled}
                                    />
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

// full edit cue modal
export function CueEditModal(props) {
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

    // handle a from submit to edit cue
    const handleOnSubmit = (values, actions) => {
        // create the time object
        const time = new Date(values.time);
        time.setSeconds(0);
        // create the json object to post lcue
        const json = {
            name: values.name,
            trackId: values.trackId,
            time: time.toISOString().slice(0, 19).replace("T", " "),
            enabled: values.enabled,
        };

        // axios post edit cue
        axios
            .put(`${CUES_URI}/${props.info.id}`, json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set loading to false
                actions.setSubmitting(false);
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the cue list
                mutate(CUES_URI);
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
                Edit Cue
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
                    validationSchema={schema}
                    initialValues={{
                        name: props.info.name,
                        trackId: "",
                        time: new Date(props.info.time),
                        enabled: props.info.enabled ? true : false,
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
                            <Modal.Header className="bg-primary text-white">
                                <Modal.Title>
                                    Edit Cue: "{props.info.name}"
                                </Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                <Form.Group controlId="validationFormik01">
                                    {/* cue name group */}
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        placeholder="Enter Name"
                                        value={values.name}
                                        onChange={handleChange}
                                        autoComplete="off"
                                    />

                                    {errors.name}
                                </Form.Group>

                                {/* track selector */}
                                <Form.Group controlId="validationFormik05">
                                    <TrackSelector
                                        name="trackId"
                                        type="edit"
                                        DefaultTrackName={props.info.track.name}
                                        DefaultTrackID={props.info.track.id}
                                    />

                                    {errors.trackId}
                                </Form.Group>

                                {/* cue time group */}
                                <Form.Group controlId="validationFormik02">
                                    <DateSelector name="PlayTime" />

                                    {errors.time}
                                </Form.Group>

                                {/* repeats group */}
                                <Form.Group controlId="validationFormik03">
                                    <Form.Check
                                        type="switch"
                                        name="enabled"
                                        label="Enabled"
                                        checked={values.enabled}
                                        value={values.enabled}
                                        onChange={handleChange}
                                        isInvalid={errors.enabled}
                                    />
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
                                    <Button
                                        variant="success"
                                        type="submit"
                                        disabled
                                    >
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
}

// full delete cue modal
export function CueDeleteModal(props) {
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

    // handle delete cue
    const deleteCue = () => {
        // axios delete cue
        axios
            .delete(`${CUES_URI}/${props.info.id}`, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the cue list
                mutate(CUES_URI);
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
                }
            });
    };

    return (
        <>
            <Button variant="danger" onClick={handleShow}>
                Delete Cue
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
                    Are you sure you would like to delete the cue "
                    {props.info.name}"
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
                    <Button variant="danger" onClick={deleteCue}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
