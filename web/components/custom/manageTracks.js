import { useState, useEffect, forwardRef } from "react";
import useSWR, { mutate } from "swr";

import { Formik } from "formik";
import * as yup from "yup";

import {
    Form,
    Button,
    Spinner,
    Modal,
    Alert,
    ProgressBar,
} from "react-bootstrap";

import axios from "axios";

const fileUpload = (file, onUploadProgress) => {
    let formData = new FormData();

    formData.append("track", file);

    return axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/app/tracks/file",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress,
        }
    );
};

const UploadFile = ({ handleClose, setTempID }) => {
    const [selectedFiles, setSelectedFiles] = useState(undefined);
    const [currentFile, setCurrentFile] = useState(undefined);
    const [progress, setProgress] = useState(0);

    const [serverState, setServerState] = useState({
        show: false,
        error: false,
        message: "none",
    });

    const selectFile = (event) => {
        setSelectedFiles(event.target.files);
    };

    const handleServerResponse = (show, error, message) => {
        setServerState({ show, error, message });
    };

    const upload = () => {
        let currentFile = selectedFiles[0];

        setProgress(0);
        setCurrentFile(currentFile);

        fileUpload(currentFile, (event) => {
            setProgress(Math.round((100 * event.loaded) / event.total));
        })
            .then((response) => {
                if (response.status == 200) {
                    handleServerResponse(false, false, response.data.message);
                    setTempID(response.data.payload.id);
                } else {
                    handleServerResponse(true, false, response.data.message);
                }
            })
            .catch(function (error) {
                if (error.response) {
                    if (error.response.status == 500) {
                        handleServerResponse(
                            true,
                            true,
                            error.response.data.message
                        );
                        setCurrentFile(undefined);
                        setProgress(0);
                    } else if (error.response.status == 502) {
                        handleServerResponse(true, true, "API Down");
                        setCurrentFile(undefined);
                        setProgress(0);
                    } else {
                        handleServerResponse(
                            true,
                            false,
                            error.response.data.message
                        );
                        setCurrentFile(undefined);
                        setProgress(0);
                    }
                } else if (error.request) {
                    handleServerResponse(
                        true,
                        true,
                        "Error sending request to server"
                    );
                    setCurrentFile(undefined);
                    setProgress(0);
                } else {
                    handleServerResponse(
                        true,
                        true,
                        "Error in browser request"
                    );
                    setCurrentFile(undefined);
                    setProgress(0);
                }
            });

        setSelectedFiles(undefined);
    };

    return (
        <>
            <Modal.Body>
                {currentFile && <ProgressBar now={progress} />}

                <Form.File onChange={selectFile} />

                <br />
                {serverState.show && (
                    <Alert variant={!serverState.error ? "warning" : "danger"}>
                        {serverState.message}
                    </Alert>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>

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
    return (
        <>
            <Modal.Body> {trackProgress.tempID}</Modal.Body>

            <Modal.Footer>
                <Button variant="warning" onClick={clearProgress}>
                    Restart
                </Button>

                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>

                <Button type="submit">Create</Button>
            </Modal.Footer>
        </>
    );
};

export const UploadTrackModal = (props) => {
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [trackProgress, setTrackProgress] = useState({
        tempID: null,
    });

    const setTempID = (id) => {
        setTrackProgress({ tempID: id });
    };

    const clearProgress = () => {
        setTrackProgress({ tempID: null });
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
