import CoreHeader from "../parts/headers";
import CoreNavbar from "../parts/navbars";
import CoreFooter from "../parts/footers";
import { loadGetInitialProps } from "next/dist/next-server/lib/utils";

const Layout = (props) => (
    <div>
        <CoreHeader title={props.title} />
        <CoreNavbar />
        <div className="flex flex-col min-h-screen">
            <div className="container mx-auto px-4 md:px-10 pt-24 flex-grow">
                {props.children}
            </div>

            <CoreFooter />
        </div>
    </div>
);

export default Layout;
