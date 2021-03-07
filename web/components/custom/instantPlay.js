import { useState, useEffect, forwardRef } from "react";

import { Form, Button, Spinner } from "react-bootstrap";

import { Formik, useField, useFormikContext } from "formik";
import * as yup from "yup";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import axios from "axios";

const schema = yup.object().shape({
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

export default function InstantPlay(props) {
    const [serverState, setServerState] = useState({
        show: false,
        error: false,
        message: "none",
    });

    const handleServerResponse = (show, error, message) => {
        setServerState({ show, error, message });
    };

    const handleOnSubmit = (values, actions) => {
        axios
            .get(
                process.env.NEXT_PUBLIC_API_URL + "/app/play/" + values.TrackID,
                {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                }
            )
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
    };

    return (
        <>
            <Formik
                validationSchema={schema}
                initialValues={{
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
                        <Form.Group controlId="validationFormik05">
                            <TrackSelector name="TrackID" />

                            {errors.TrackID}
                        </Form.Group>

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
                            <Button type="submit">Play</Button>
                        )}
                    </Form>
                )}
            </Formik>
        </>
    );
}
