import Layout from "../../components/layouts/unified";

import { Badge } from "react-bootstrap";

// main app function
export default function Main() {
    return (
        <Layout title="Settings" access={10}>
            <h1>
                Settings Index{" "}
                <Badge className="ml-1" variant="warning">
                    Beta
                </Badge>
            </h1>
        </Layout>
    );
}
