import { useState, useEffect, forwardRef } from "react";
import useSWR, { mutate } from "swr";

import { Form, Button, Spinner, Modal, Alert } from "react-bootstrap";

import { Formik, useField, useFormikContext } from "formik";
import * as yup from "yup";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

// axios request urls
const USERS_URI = process.env.NEXT_PUBLIC_API_URL + "/settings/users";

// form schemas
const schemaCreate = yup.object().shape({
    email: yup.string().email().required(),
    displayName: yup.string().required(),
    password: yup.string().required(),
});

const schemaEdit = yup.object().shape({
    email: yup.string().email().required(),
    displayName: yup.string().required(),
});

// full create user modal
export const UserCreateModal = (props) => {
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

    // handle a from submit to create user
    const handleOnSubmit = (values, actions) => {
        // create the json object to post lcue
        const json = JSON.stringify({
            Email: values.email,
            DisplayName: values.displayName,
            Password: values.password,
            Access: values.access,
            Enabled: values.enabled,
        });

        // axios post create user
        axios
            .post(USERS_URI, json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set loading to false
                actions.setSubmitting(false);
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the user list
                mutate(USERS_URI);
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
                }
            });
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>
                Create User
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
                    validationSchema={schemaCreate}
                    initialValues={{
                        email: "",
                        password: "",
                        displayName: "",
                        access: 0,
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
                                <Modal.Title>Create User</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {/* display name group */}
                                <Form.Group controlId="validationFormik01">
                                    <Form.Control
                                        type="text"
                                        name="displayName"
                                        placeholder="Enter Display Name"
                                        value={values.displayName}
                                        onChange={handleChange}
                                        isInvalid={errors.displayName}
                                        autocomplete="nickname"
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.displayName}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* email group */}
                                <Form.Group controlId="validationFormik02">
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="Enter Email"
                                        value={values.email}
                                        onChange={handleChange}
                                        isInvalid={errors.email}
                                        autocomplete="current-password"
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* password group */}
                                <Form.Group controlId="validationFormik03">
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        placeholder="Enter Password"
                                        value={values.password}
                                        onChange={handleChange}
                                        isInvalid={errors.password}
                                        autocomplete="new-password"
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.password}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* access group */}
                                <Form.Group controlId="exampleForm.SelectCustom">
                                    <Form.Control
                                        as="select"
                                        name="access"
                                        value={values.access}
                                        onChange={handleChange}
                                        custom
                                    >
                                        <option value="0" label="View Only" />
                                        <option value="5" label="Standard" />
                                        <option value="10" label="Admin" />
                                    </Form.Control>
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

// full edit user modal
export const UserEditModal = (props) => {
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

    // handle a from submit to edit user
    const handleOnSubmit = (values, actions) => {
        // create the json object to post lcue
        const json = JSON.stringify({
            Email: values.email,
            DisplayName: values.displayName,
            Access: values.access,
            Enabled: values.enabled,
        });

        // axios post create user
        axios
            .put(`${USERS_URI}/${props.info.UserID}`, json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set loading to false
                actions.setSubmitting(false);
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the user list
                mutate(USERS_URI);
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
                }
            });
    };

    return (
        <>
            <Button variant="primary" size="sm" onClick={handleShow}>
                Edit
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
                    validationSchema={schemaEdit}
                    initialValues={{
                        email: props.info.Email,
                        displayName: props.info.DisplayName,
                        access: props.info.Access,
                        enabled: props.info.Enabled,
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
                                <Modal.Title>Create User</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {/* display name group */}
                                <Form.Group controlId="validationFormik01">
                                    <Form.Control
                                        type="text"
                                        name="displayName"
                                        placeholder="Enter Display Name"
                                        value={values.displayName}
                                        onChange={handleChange}
                                        isInvalid={errors.displayName}
                                        autocomplete="nickname"
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.displayName}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* email group */}
                                <Form.Group controlId="validationFormik02">
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        placeholder="Enter Email"
                                        value={values.email}
                                        onChange={handleChange}
                                        isInvalid={errors.email}
                                        autocomplete="current-password"
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* access group */}
                                <Form.Group controlId="exampleForm.SelectCustom">
                                    <Form.Control
                                        as="select"
                                        name="access"
                                        value={values.access}
                                        onChange={handleChange}
                                        custom
                                    >
                                        <option value="0" label="View Only" />
                                        <option value="5" label="Standard" />
                                        <option value="10" label="Admin" />
                                    </Form.Control>
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
                                    <Button type="submit">Edit</Button>
                                )}
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </>
    );
};

// full delete user modal
export function UserDeleteModal(props) {
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

    // handle delete user
    const deleteCue = () => {
        // axios delete user
        axios
            .delete(`${USERS_URI}/${props.info.UserID}`, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the user list
                mutate(USERS_URI);
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
                }
            });
    };

    return (
        <>
            <Button variant="danger" size="sm" onClick={handleShow}>
                Delete
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
                    Are you sure you would like to delete the user "
                    {props.info.DisplayName}"
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
