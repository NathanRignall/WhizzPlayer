import { useRouter } from "next/router";
import React, { useState } from "react";

import axios from "axios";
import { Formik } from "formik";
import * as yup from "yup";

import { Form, Button, Spinner, Alert } from "react-bootstrap";

// axios request urls
const SEARCH_URI = process.env.NEXT_PUBLIC_API_URL + "/session";

// form schema
const schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required(),
});

// main login form function
export const MainForm = () => {
    const router = useRouter();
    var { url } = router.query;

    if (url == undefined) {
        url = "/";
    }

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
            email: values.email,
            password: values.password,
        };

        // axios post login request
        axios
            .post(SEARCH_URI, json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // redirect back to the login page
                window.location.replace(url);
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
        <Formik
            validationSchema={schema}
            onSubmit={handleOnSubmit}
            initialValues={{ email: "", password: "" }}
        >
            {({ handleSubmit, handleChange, values, errors, isSubmitting }) => (
                <Form noValidate onSubmit={handleSubmit}>
                    {/* email group */}
                    <Form.Group controlId="validationFormik01">
                        <Form.Control
                            type="email"
                            name="email"
                            placeholder="Enter Email"
                            value={values.email}
                            onChange={handleChange}
                            isInvalid={errors.email}
                            autoComplete="email"
                        />

                        <Form.Control.Feedback type="invalid">
                            {errors.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {/* password group */}
                    <Form.Group controlId="validationFormik02">
                        <Form.Control
                            type="password"
                            name="password"
                            placeholder="Enter Password"
                            value={values.password}
                            onChange={handleChange}
                            isInvalid={errors.password}
                            autoComplete="current-password"
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
                        <Button type="submit">Login</Button>
                    )}
                </Form>
            )}
        </Formik>
    );
};
