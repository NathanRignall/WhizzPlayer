import { useState } from "react";
import { mutate } from "swr";

import axios from "axios";

import { Button, Modal, Alert } from "react-bootstrap";

// axios request urls
const HALT_URI = process.env.NEXT_PUBLIC_API_URL + "/play/halt";
const PLAY_URI = process.env.NEXT_PUBLIC_API_URL + "/play";

// full halt track modal
export default function HaltPlayModal(props) {
    // contain the state of the modal
    const [show, setShow] = useState(false);

    // set the state of the modal
    const handleClose = () => {
        setShow(false);
        handleServerResponse(false, false, "none");
    };
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

    // handle halt track
    const haltTrack = () => {
        // axios play track
        axios
            .post(HALT_URI, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            })
            .then((response) => {
                // set the server state to handle errors
                handleServerResponse(false, false, response.data.message);
                // close the modal
                handleClose();
                // mutate now playing
                mutate(PLAY_URI);
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
            <Button variant="danger" size={props.size} onClick={handleShow}>
                Halt Playback
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
                    <p>Are you sure you would like to halt current playback?</p>
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

                    {/* Halt button*/}
                    <Button variant="danger" onClick={haltTrack}>
                        Halt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
