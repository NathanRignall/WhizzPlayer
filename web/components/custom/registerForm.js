import { useRouter } from "next/router";
import React, { useState } from "react";

import axios from "axios";
import { Formik } from "formik";
import * as yup from "yup";

import { Form, Button, Spinner, Alert } from "react-bootstrap";

// axios request urls
const REGISTER_URI = process.env.NEXT_PUBLIC_API_URL + "/account/register";

// form schema
const schema = yup.object().shape({
    email: yup.string().email().required(),
    displayName: yup.string().required(),
    password: yup.string().required(),
});

// main login form function
export const MainForm = () => {
    const router = useRouter();

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

    // handle a from submit to login
    const handleOnSubmit = (values, actions) => {
        // create the json object to post login
        const json = {
            Email: values.email,
            DisplayName: values.displayName,
            Password: values.password,
        };

        // axios post login request
        axios
            .post(REGISTER_URI, json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // redirect back to the login page
                window.location.replace("/");
                // set loading to false
                actions.setSubmitting(false);
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
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
                    console.error(error);
                    handleServerResponse(
                        true,
                        true,
                        "Error sending request to server"
                    );
                    actions.setSubmitting(false);
                    // set loading to false
                } else {
                    // check if a browser error
                    console.error(error);
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
        <Formik
            validationSchema={schema}
            onSubmit={handleOnSubmit}
            initialValues={{ email: "", password: "", displayName: "" }}
        >
            {({ handleSubmit, handleChange, values, errors, isSubmitting }) => (
                <Form noValidate onSubmit={handleSubmit}>
                    {/* display name group */}
                    <Form.Group controlId="validationFormik01">
                        <Form.Control
                            type="text"
                            name="displayName"
                            placeholder="Enter Display Name"
                            value={values.displayName}
                            onChange={handleChange}
                            isInvalid={errors.displayName}
                            autoComplete="nickname"
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
                            autoComplete="current-password"
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
                            autoComplete="new-password"
                        />

                        <Form.Control.Feedback type="invalid">
                            {errors.password}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* display errors to the user */}
                    {serverState.show && (
                        <Alert
                            variant={!serverState.error ? "warning" : "danger"}
                        >
                            {serverState.message}
                        </Alert>
                    )}

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
                        <Button type="submit">Setup</Button>
                    )}
                </Form>
            )}
        </Formik>
    );
};
