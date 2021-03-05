import { useState, useEffect } from "react";

import { Alert, Button } from "react-bootstrap";

export const StickyError = (props) => {
    const [show, setShow] = useState(true);

    return (
        <div className="alert-fixed">
            <Alert
                show={show}
                variant={props.variant}
                onClose={() => setShow(false)}
                dismissible
            >
                {props.text}
            </Alert>
        </div>
    );
};

export const ErrorDisplayer = (props) => {
    if (props.error) {
        console.log(props.error);

        if (props.error.status == 401) {
            return <StickyError variant="danger" text="need to login" />;
        } else if (props.error.status == 403) {
            return <StickyError variant="warning" text="invalid permissions" />;
        } else if (props.error.status == 502) {
            return <StickyError variant="danger" text="Error fetching api" />;
        } else {
            return <StickyError variant="danger" text={props.error.message} />;
        }
    } else {
        return "";
    }
};
