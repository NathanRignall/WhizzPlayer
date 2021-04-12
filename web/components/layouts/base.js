import CoreHeader from "../parts/headers";
import CoreFooter from "../parts/footers";

// base layout for pages with no auth
const Layout = (props) => (
    <div>
        <CoreHeader title={props.title} />
        {props.children}
        <CoreFooter />
    </div>
);

export default Layout;
