import Layout from "../../components/layouts/unified";

import { useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import { fetcher } from "../../components/common/functions";
import { ErrorDisplayer } from "../../components/common/errors";
import {
    UserCreateModal,
    UserDeleteModal,
    UserEditModal,
    UserPasswordModal,
} from "../../components/custom/manageSettingsUsers";

import { Card, Table, Spinner, Button, Alert, Badge } from "react-bootstrap";

// card for displyaing info about a track
const User = (props) => {
    let access = "View Only";
    if (props.info.Access == 10) {
        access = "Admin";
    } else if (props.info.Access == 5) {
        access = "Standard";
    }

    return (
        <tr>
            <td>{props.info.DisplayName}</td>
            <td>{props.info.Email}</td>
            <td>{access}</td>
            <td>
                <UserEditModal info={props.info} />{" "}
                <UserDeleteModal info={props.info} />{" "}
                <UserPasswordModal info={props.info} />
            </td>
        </tr>
    );
};

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
                    <Table bordered hover>
                        <thead>
                            <tr>
                                <th>Display Name</th>
                                <th>Email</th>
                                <th>Access</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>{UsersFormedList}</tbody>
                    </Table>
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
        <Layout title="Settings" access={10}>
            <h1>User List </h1>

            <div>
                <UserCreateModal />{" "}
            </div>

            <br />
            <UserList />
        </Layout>
    );
}
