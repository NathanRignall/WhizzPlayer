import { useState, useEffect, forwardRef } from "react";

import { Form, Button, Spinner, Modal } from "react-bootstrap";

import { Formik, useField, useFormikContext } from "formik";
import * as yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import axios from "axios";

const schema = yup.object().shape({
    CueName: yup.string().required(),
    TrackID: yup.string().required(),
});

const SEARCH_URI = process.env.NEXT_PUBLIC_API_URL + "/app/tracks/lookup";

const TrackSelector = (props) => {
    const { setFieldValue } = useFormikContext();

    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const [singleSelections, setSingleSelections] = useState([]);

    useEffect(() => {
        if (singleSelections.length > 0) {
            console.log(singleSelections[0]);
            setFieldValue(props.name, singleSelections[0].TrackID);
        }
    }, [singleSelections]);

    const handleSearch = (query) => {
        setIsLoading(true);

        axios
            .get(`${SEARCH_URI}?search=${query}`)
            .then((response) => {
                const options = response.data.payload.map((items) => ({
                    TrackName: items.TrackName,
                    TrackID: items.TrackID,
                }));

                setOptions(options);
                setIsLoading(false);
            })
            .catch((error) => {
                if (error.response) {
                    console.log("error with response");
                } else if (error.request) {
                    console.log("no response");
                } else {
                    console.log("axios error");
                }
                setOptions(options);
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

const DateSelector = ({ ...props }) => {
    const { setFieldValue } = useFormikContext();
    const [field] = useField(props);

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

export default function CueCreateModal(props) {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

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
            CueName: values.CueName,
            TrackID: values.TrackID,
            PlayTime: new Date(values.PlayTime)
                .toISOString()
                .slice(0, 19)
                .replace("T", " "),
            Repeats: values.Repeats,
        });

        axios
            .post(process.env.NEXT_PUBLIC_API_URL + "/app/cues", json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
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

        console.log(json);
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
                            <Modal.Header
                                className="bg-success text-white"
                                closeButton
                            >
                                <Modal.Title>Create Cue</Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                <Form.Group controlId="validationFormik01">
                                    <Form.Control
                                        type="text"
                                        name="CueName"
                                        placeholder="Enter CueName"
                                        value={values.CueName}
                                        onChange={handleChange}
                                        isInvalid={errors.CueName}
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errors.CueName}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group controlId="validationFormik05">
                                    <TrackSelector name="TrackID" />

                                    {errors.TrackID}
                                </Form.Group>

                                <Form.Group controlId="validationFormik02">
                                    <DateSelector name="PlayTime" />

                                    {errors.PlayTime}
                                </Form.Group>

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
                            </Modal.Body>
                            <Modal.Footer>
                                <Button
                                    variant="secondary"
                                    onClick={handleClose}
                                >
                                    Close
                                </Button>

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
}
