import { useState, useEffect, forwardRef } from "react";
import useSWR, { mutate } from "swr";

import { Form, Button, Spinner, Modal, Alert } from "react-bootstrap";

import { Formik, useField, useFormikContext } from "formik";
import * as yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import axios from "axios";

// axios request urls
const SEARCH_URI = process.env.NEXT_PUBLIC_API_URL + "/app/tracks/lookup";
const CUES_URI = process.env.NEXT_PUBLIC_API_URL + "/app/cues";

// form schema
const schema = yup.object().shape({
    CueName: yup.string().required(),
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
            console.log(singleSelections[0]);
            setFieldValue(props.name, singleSelections[0].TrackID);
        }
    }, [singleSelections]);

    // main feild searcher
    const handleSearch = (query) => {
        // set loading state to true
        setIsLoading(true);

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
                // set loading false
                setIsLoading(false);
            })
            .catch((error) => {
                // catch each type of axios error
                if (error.response) {
                    if (error.response.status == 404) {
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
                // set loading to false
                setIsLoading(false);
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
            selected={(field.value && new Date(field.value)) || null}
            dateFormat="MM/dd/yyyy h:mm aa"
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
        // create the json object to post lcue
        const json = JSON.stringify({
            CueName: values.CueName,
            TrackID: values.TrackID,
            PlayTime: new Date(values.PlayTime)
                .toISOString()
                .slice(0, 19)
                .replace("T", " "),
            Repeats: values.Repeats,
        });

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
                }
            });
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Create A Cue
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
                        CueName: "",
                        TrackID: "",
                        PlayTime: new Date(),
                        Repeats: false,
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
                                        name="CueName"
                                        placeholder="Enter CueName"
                                        value={values.CueName}
                                        onChange={handleChange}
                                    />

                                    {errors.CueName}
                                </Form.Group>

                                {/* track selector */}
                                <Form.Group controlId="validationFormik05">
                                    <TrackSelector name="TrackID" />

                                    {errors.TrackID}
                                </Form.Group>

                                {/* cue time group */}
                                <Form.Group controlId="validationFormik02">
                                    <DateSelector name="PlayTime" />

                                    {errors.PlayTime}
                                </Form.Group>

                                {/* repeats group */}
                                <Form.Group controlId="validationFormik03">
                                    <Form.Check
                                        name="Repeats"
                                        type="switch"
                                        label="Repeats"
                                        value={values.Repeats}
                                        onChange={handleChange}
                                        isInvalid={errors.Repeats}
                                    />
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

    // handle a from submit to create cue
    const handleOnSubmit = (values, actions) => {
        // create the json object to post lcue
        const json = JSON.stringify({
            CueName: values.CueName,
            TrackID: values.TrackID,
            PlayTime: new Date(values.PlayTime)
                .toISOString()
                .slice(0, 19)
                .replace("T", " "),
            Repeats: values.Repeats,
        });

        // axios post edit cue
        axios
            .put(`${CUES_URI}/${props.info.CueID}`, json, {
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
                        CueName: props.info.CueName,
                        TrackID: "",
                        PlayTime: props.info.PlayTime,
                        Repeats: props.info.Repeats ? true : false,
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
                                    Edit Cue: "{props.info.CueName}"
                                </Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                <Form.Group controlId="validationFormik01">
                                    {/* cue name group */}
                                    <Form.Control
                                        type="text"
                                        name="CueName"
                                        placeholder="Enter CueName"
                                        value={values.CueName}
                                        onChange={handleChange}
                                    />

                                    {errors.CueName}
                                </Form.Group>

                                {/* track selector */}
                                <Form.Group controlId="validationFormik05">
                                    <TrackSelector
                                        name="TrackID"
                                        type="edit"
                                        DefaultTrackName={props.info.TrackName}
                                        DefaultTrackID={props.info.TrackID}
                                    />

                                    {errors.TrackID}
                                </Form.Group>

                                {/* cue time group */}
                                <Form.Group controlId="validationFormik02">
                                    <DateSelector name="PlayTime" />

                                    {errors.PlayTime}
                                </Form.Group>

                                {/* repeats group */}
                                <Form.Group controlId="validationFormik03">
                                    <Form.Check
                                        name="Repeats"
                                        type="switch"
                                        label="Repeats"
                                        checked={values.Repeats}
                                        value={values.Repeats}
                                        onChange={handleChange}
                                        isInvalid={errors.Repeats}
                                    />
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
                                    <Button
                                        type="submit"
                                        variant="success"
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
            .delete(`${CUES_URI}/${props.info.CueID}`, {
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
                    {props.info.CueName}"
                    <>
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
                    </>
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
