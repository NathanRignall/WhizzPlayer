import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import { Form, Button, Spinner, Alert } from "react-bootstrap";

import axios from "axios";
import { Formik } from "formik";
import * as yup from "yup";

const schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required(),
});

export function FormExample() {
    const router = useRouter();

    const [serverState, setServerState] = useState({
        show: false,
        error: false,
        message: "none",
    });

    const handleServerResponse = (show, error, message) => {
        setServerState({ show, error, message });
    };

    const handleOnSubmit = (values, actions) => {
        var json = JSON.stringify({
            Email: values.email,
            Password: values.password,
        });
        axios
            .post(process.env.NEXT_PUBLIC_API_URL + "/account/login", json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                router.push("/");
                actions.setSubmitting(false);
                handleServerResponse(false, false, response.data.message);
            })
            .catch(function (error) {
                if (error.response) {
                    if (error.response.status == 500) {
                        handleServerResponse(
                            true,
                            true,
                            error.response.data.message
                        );
                    } else {
                        handleServerResponse(
                            true,
                            false,
                            error.response.data.message
                        );
                    }
                    actions.setSubmitting(false);
                } else if (error.request) {
                    handleServerResponse(
                        true,
                        true,
                        "Error sending request to server"
                    );
                    actions.setSubmitting(false);
                } else {
                    handleServerResponse(
                        true,
                        true,
                        "Error in browser request"
                    );
                    actions.setSubmitting(false);
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
                    <Form.Group controlId="validationFormik01">
                        <Form.Control
                            type="email"
                            name="email"
                            placeholder="Enter Email"
                            value={values.email}
                            onChange={handleChange}
                            isInvalid={errors.email}
                        />

                        <Form.Control.Feedback type="invalid">
                            {errors.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group controlId="validationFormik02">
                        <Form.Control
                            type="password"
                            name="password"
                            placeholder="Enter Password"
                            value={values.password}
                            onChange={handleChange}
                            isInvalid={errors.password}
                        />

                        <Form.Control.Feedback type="invalid">
                            {errors.password}
                        </Form.Control.Feedback>
                    </Form.Group>

                    {serverState.show && (
                        <Alert
                            variant={!serverState.error ? "warning" : "danger"}
                        >
                            {serverState.message}
                        </Alert>
                    )}
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
}
