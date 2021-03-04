import CoreHeader from "../parts/headers";
import CoreNavbar from "../parts/navbars";
import CoreFooter from "../parts/footers";

import Container from "react-bootstrap/Container";

const Layout = (props) => (
    <div>
        <CoreHeader title={props.title} />
        <CoreNavbar />
        <br />
        <Container>{props.children}</Container>
        <CoreFooter />
    </div>
);

export default Layout;
