import { useState } from "react";
import { mutate } from "swr";

import { Formik } from "formik";
import * as yup from "yup";
import axios from "axios";

import {
    Form,
    Button,
    Spinner,
    Modal,
    Alert,
    ProgressBar,
} from "react-bootstrap";

// axios request urls
const TRACKS_URI = process.env.NEXT_PUBLIC_API_URL + "/app/tracks";
const TRACKS_FILE_URI = process.env.NEXT_PUBLIC_API_URL + "/app/tracks/file";

// form schema
const schema = yup.object().shape({
    TrackName: yup.string().required(),
});

// axios request to uplaod the file to the server
const fileUpload = (file, onUploadProgress) => {
    let formData = new FormData();

    formData.append("track", file);

    return axios.post(TRACKS_FILE_URI, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
    });
};

// upload file modal component
const UploadFile = ({ handleClose, setTempID }) => {
    // hold the current status
    const [fileName, setFileName] = useState("Upload MP3 or WAV file");
    const [selectedFiles, setSelectedFiles] = useState(undefined);
    const [currentFile, setCurrentFile] = useState(undefined);
    const [progress, setProgress] = useState(0);

    // satus of the form requests
    const [serverState, setServerState] = useState({
        show: false,
        error: false,
        message: "none",
    });

    // set the selected file
    const selectFile = (event) => {
        if (event.target.files[0]) {
            setFileName(event.target.files[0].name);
        } else {
            setFileName("Upload MP3 or WAV file");
        }

        setSelectedFiles(event.target.files);
    };

    // set the server state from a response
    const handleServerResponse = (show, error, message) => {
        setServerState({ show, error, message });
    };

    // handle a from submit to upload file
    const upload = () => {
        // set the current file to upload
        let currentFile = selectedFiles[0];
        setCurrentFile(currentFile);

        // reset the progress bar
        setProgress(0);

        // axios post file
        fileUpload(currentFile, (event) => {
            setProgress(Math.round((100 * event.loaded) / event.total));
        })
            .then((response) => {
                if (response.status == 200) {
                    // set the server state to handle errors
                    handleServerResponse(false, false, response.data.message);
                    // set the fileid
                    setTempID(response.data.payload.id, currentFile.name);
                } else {
                    // set the server state to handle errors
                    handleServerResponse(true, false, response.data.message);
                }
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
                        // reset progress and current file
                        setCurrentFile(undefined);
                        setProgress(0);
                    } else {
                        // check if a user error
                        handleServerResponse(
                            true,
                            false,
                            error.response.data.message
                        );
                        // reset progress and current file
                        setCurrentFile(undefined);
                        setProgress(0);
                    }
                } else if (error.request) {
                    // check if a request error
                    handleServerResponse(
                        true,
                        true,
                        "Error sending request to server"
                    );
                    // reset progress and current file
                    setCurrentFile(undefined);
                    setProgress(0);
                } else {
                    // check if a browser error
                    handleServerResponse(
                        true,
                        true,
                        "Error in browser request"
                    );
                    // reset progress and current file
                    setCurrentFile(undefined);
                    setProgress(0);
                    console.log(error);
                }
            });
        // reset progress and current file anyway
        setSelectedFiles(undefined);
    };

    return (
        <>
            <Modal.Body>
                {/* Progress bar*/}
                {currentFile && (
                    <>
                        <ProgressBar now={progress} />
                        <br />
                    </>
                )}

                {/* File selector*/}
                <Form>
                    <Form.File label={fileName} custom onChange={selectFile} />
                </Form>
                <br />

                {/* display errors to the user */}
                {serverState.show && (
                    <Alert variant={!serverState.error ? "warning" : "danger"}>
                        {serverState.message}
                    </Alert>
                )}
            </Modal.Body>

            <Modal.Footer>
                {/* Close Modal button*/}
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>

                {/* Submit button*/}
                <Button
                    type="submit"
                    disabled={!selectedFiles}
                    onClick={upload}
                >
                    Upload
                </Button>
            </Modal.Footer>
        </>
    );
};

const CreateTrack = ({ trackProgress, handleClose, clearProgress }) => {
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

    // handle a from submit to create track
    const handleOnSubmit = (values, actions) => {
        // create the json object to post track
        const json = JSON.stringify({
            TrackName: values.TrackName,
            TrackType: values.TrackType,
            FileID: trackProgress.tempID,
        });

        // axios post create track
        axios
            .post(TRACKS_URI, json, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set loading to false
                actions.setSubmitting(false);
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the track list
                mutate(TRACKS_URI);
                // close the modal
                handleClose();
                // clear progress
                clearProgress();
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
            <Formik
                validationSchema={schema}
                onSubmit={handleOnSubmit}
                initialValues={{
                    TrackName: trackProgress.tempName,
                    TrackType: "music",
                }}
            >
                {(props) => (
                    <Form noValidate onSubmit={props.handleSubmit}>
                        <Modal.Body>
                            {/* track name group */}
                            <Form.Group controlId="validationFormik01">
                                <Form.Control
                                    type="text"
                                    name="TrackName"
                                    placeholder="Enter TrackName"
                                    value={props.values.TrackName}
                                    onChange={props.handleChange}
                                    autoComplete="off"
                                />

                                {props.errors.TrackName}
                            </Form.Group>

                            {/* track type group */}
                            <Form.Group controlId="validationFormik02">
                                <Form.Control
                                    as="select"
                                    name="TrackType"
                                    value={props.values.TrackType}
                                    onChange={props.handleChange}
                                    custom
                                >
                                    <option value="music" label="Music" />
                                    <option value="voice" label="Voice" />
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
                            <Button variant="warning" onClick={clearProgress}>
                                Restart
                            </Button>

                            <Button variant="secondary" onClick={handleClose}>
                                Cancel
                            </Button>

                            {/* Submit button*/}
                            {props.isSubmitting ? (
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
        </>
    );
};

export const UploadTrackModal = (props) => {
    // contain the state of the modal
    const [show, setShow] = useState(false);

    // set the state of the modal
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // contain the state of the file upload
    const [trackProgress, setTrackProgress] = useState({
        tempID: null,
        tempName: null,
    });

    // set the file id
    const setTempID = (id, name) => {
        setTrackProgress({ tempID: id, tempName: name });
    };

    // clear the current file id
    const clearProgress = () => {
        setTrackProgress({ tempID: null, tempName: null });
    };

    return (
        <>
            <Button onClick={handleShow}>Upload Track</Button>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                size="lg"
                centered={true}
                keyboard={false}
            >
                <Modal.Header className="bg-success text-white">
                    <Modal.Title>Upload Track</Modal.Title>
                </Modal.Header>

                {trackProgress.tempID != null ? (
                    <CreateTrack
                        handleClose={handleClose}
                        trackProgress={trackProgress}
                        clearProgress={clearProgress}
                    />
                ) : (
                    <UploadFile
                        handleClose={handleClose}
                        setTempID={setTempID}
                    />
                )}
            </Modal>
        </>
    );
};

// full delete track modal
export function TrackDeleteModal(props) {
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

    // handle delete track
    const deleteTrack = () => {
        // axios delete track
        axios
            .delete(`${TRACKS_URI}/${props.info.TrackID}`, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // reload the track list
                mutate(TRACKS_URI);
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
                Delete Track
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
                    Are you sure you would like to delete the track "
                    {props.info.TrackName}"
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
                    <Button variant="danger" onClick={deleteTrack}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
