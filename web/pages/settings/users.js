import Layout from "../../components/layouts/main";

import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import { fetcher } from "../../components/common/functions";
import { ErrorDisplayer } from "../../components/common/errors";
import {
    UserCreateModal,
    UserDeleteModal,
} from "../../components/custom/manageUsers";

import {
    Card,
    ListGroup,
    Row,
    Spinner,
    Button,
    Alert,
    Badge,
} from "react-bootstrap";

// card for displyaing info about a track
const User = (props) => (
    <ListGroup.Item>
        {props.info.DisplayName} - {props.info.Email} - {props.info.Access}{" "}
        <UserDeleteModal info={props.info} />
    </ListGroup.Item>
);

// main user list loader
const UserList = () => {
    const { data, error } = useSWR(
        process.env.NEXT_PUBLIC_API_URL + "/settings/users",
        fetcher
    );

    if (data) {
        const UsersFormedList = data.payload.map((item) => (
            <User key={item.UserID} info={item} />
        ));

        return (
            <>
                <ErrorDisplayer error={error} />

                {data.payload.length > 0 ? (
                    <Card>
                        <ListGroup variant="flush">{UsersFormedList}</ListGroup>
                    </Card>
                ) : (
                    <Alert variant="warning">
                        There are currently 0 Users in the system.
                    </Alert>
                )}
            </>
        );
    } else {
        return (
            <>
                <div className="text-center">
                    <Spinner animation="border" />
                </div>
                <ErrorDisplayer error={error} />
            </>
        );
    }
};

// main app function
export default function Main() {
    return (
        <Layout title="Settings - Users">
            <h1>
                User List{" "}
                <Badge className="ml-1" variant="warning">
                    Beta
                </Badge>
            </h1>

            <div>
                <UserCreateModal />{" "}
            </div>

            <br />
            <UserList />
        </Layout>
    );
}
