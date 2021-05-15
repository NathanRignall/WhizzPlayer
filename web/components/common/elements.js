import { Spinner } from "react-bootstrap";

// basic loader spiral in the center of screen
export const Loader = (props) => (
    <div className="d-flex h-100 justify-content-center">
        <div className="my-auto">
            <Spinner animation="border" />.
        </div>
    </div>
);
