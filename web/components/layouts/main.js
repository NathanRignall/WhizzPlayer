import CoreHeader from "../parts/headers";
import CoreNavbar from "../parts/navbars";
import CoreFooter from "../parts/footers";

import { useRouter } from "next/router";
import useSWR from "swr";

import axios from "axios";

import { fetcher } from "../common/functions";
import { Loader } from "../common/elements";

import { Container } from "react-bootstrap";

const Layout = (props) => {
    const router = useRouter();

    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/account/info",
        fetcher,
        {
            revalidateOnFocus: false,
        }
    );

    if (data) {
        console.log(data);

        if (error) {
            router.push("/login");
            return <Loader />;
        } else {
            return (
                <div>
                    <CoreHeader title={props.title} />
                    <CoreNavbar DisplayName={data.payload.DisplayName} />
                    <br />
                    <Container>{props.children}</Container>
                    <CoreFooter />
                </div>
            );
        }
    } else {
        if (error) {
            router.push("/login");
            return <Loader />;
        } else {
            return <Loader />;
        }
    }
};

const Layouted = (props) => (
    <div>
        <CoreHeader title={props.title} />
        <CoreNavbar />
        <br />
        <Container>{props.children}</Container>
        <CoreFooter />
    </div>
);

export default Layout;
