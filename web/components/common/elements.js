import { Spinner } from "react-bootstrap";

// basic loader
export const Loader = (props) => (
    <div className="d-flex h-100 justify-content-center">
        <div className="my-auto">
            <Spinner animation="border" />.
        </div>
    </div>
);
