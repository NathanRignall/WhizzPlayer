import { useState, useEffect, forwardRef } from "react";
import useSWR, { mutate } from "swr";

import { Formik, useField, useFormikContext } from "formik";
import * as yup from "yup";
import axios from "axios";

import { Form, Button, Spinner, Modal, Alert, Dropdown } from "react-bootstrap";

// axios request urls
const ACCOUNT_URI = process.env.NEXT_PUBLIC_API_URL + "/account/info";
const PASSWORD_URI = process.env.NEXT_PUBLIC_API_URL + "/account/password";

// form schemas
const schemaEdit = yup.object().shape({
    DisplayName: yup.string().required(),
    Email: yup.string().email().required(),
});

const schemaPassword = yup.object().shape({
    Password: yup.string().required(),
    NewPassword: yup.string().required(),
});

// full update account info modal
export const UpdateAccountInfoModal = (props) => {
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

    // handle a from submit to update info
    const handleOnSubmit = (values, actions) => {
        // create the json object to put info
        const json = JSON.stringify({
            Email: values.Email,
            DisplayName: values.DisplayName,
        });

        // axios post create user
        axios
            .put(ACCOUNT_URI, json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set loading to false
                actions.setSubmitting(false);
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the user list
                mutate(ACCOUNT_URI);
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
            <Dropdown.Item onClick={handleShow}>Account Info</Dropdown.Item>

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
                        DisplayName: props.info.DisplayName,
                        Email: props.info.Email,
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
                                <Modal.Title>Update Account Info</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {/* display name group */}
                                <Form.Group controlId="validationFormik01">
                                    <Form.Control
                                        type="text"
                                        name="DisplayName"
                                        placeholder="Enter Display Name"
                                        value={values.DisplayName}
                                        onChange={handleChange}
                                        isInvalid={errors.DisplayName}
                                        autocomplete="nickname"
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.DisplayName}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* email group */}
                                <Form.Group controlId="validationFormik02">
                                    <Form.Control
                                        type="email"
                                        name="Email"
                                        placeholder="Enter Email"
                                        value={values.Email}
                                        onChange={handleChange}
                                        isInvalid={errors.Email}
                                        autocomplete="current-password"
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.Email}
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

// full reset account password modal
export const ResetAccountPasswordModal = (props) => {
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

    // handle a from submit to reset password
    const handleOnSubmit = (values, actions) => {
        // create the json object to post password
        const json = JSON.stringify({
            Password: values.Password,
            NewPassword: values.NewPassword,
        });

        // axios post reset account password
        axios
            .post(PASSWORD_URI, json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set loading to false
                actions.setSubmitting(false);
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the user list
                mutate(PASSWORD_URI);
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
            <Dropdown.Item onClick={handleShow}>Reset Password</Dropdown.Item>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                size="lg"
                centered={true}
                keyboard={false}
            >
                <Formik
                    validationSchema={schemaPassword}
                    initialValues={{
                        Password: "",
                        NewPassword: "",
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
                                <Modal.Title>Reset Password</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {/* password group */}
                                <Form.Group controlId="validationFormik03">
                                    <Form.Control
                                        type="password"
                                        name="Password"
                                        placeholder="Enter Current Password"
                                        value={values.Password}
                                        onChange={handleChange}
                                        isInvalid={errors.Password}
                                        autoComplete="current-password"
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.Password}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                {/* new password group */}
                                <Form.Group controlId="validationFormik02">
                                    <Form.Control
                                        type="password"
                                        name="NewPassword"
                                        placeholder="Enter New Password"
                                        value={values.NewPassword}
                                        onChange={handleChange}
                                        isInvalid={errors.NewPassword}
                                        autoComplete="new-password"
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.NewPassword}
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
                                    <Button variant="danger" type="submit">
                                        Reset
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
