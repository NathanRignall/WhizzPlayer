import { useAppContext } from "../context/state";

import Link from "next/link";

import {
    UpdateAccountInfoModal,
    ResetAccountPasswordModal,
} from "../custom/manageAccount";

import { Navbar, Nav, NavDropdown, Dropdown, Badge } from "react-bootstrap";

export default function CoreNavbar(props) {
    // global app context
    const context = useAppContext();

    return (
        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
            <Link href="/">
                <Navbar.Brand>Whizz Player</Navbar.Brand>
            </Link>

            <Navbar.Toggle aria-controls="responsive-navbar-nav" />

            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="mr-auto">
                    <Link href="/">
                        <Nav.Link href="/">Home</Nav.Link>
                    </Link>

                    <Link href="/grids">
                        <Nav.Link href="/grids">Grids</Nav.Link>
                    </Link>

                    <Link href="/cues">
                        <Nav.Link href="/cues">Cues</Nav.Link>
                    </Link>

                    <Link href="/tracks">
                        <Nav.Link href="/tracks">Tracks</Nav.Link>
                    </Link>

                    {context.Access == 10 ? (
                        <NavDropdown
                            title="Settings"
                            id="collasible-nav-dropdown"
                        >
                            <Link href="/settings/users">
                                <NavDropdown.Item href="/settings/users">
                                    Users
                                </NavDropdown.Item>
                            </Link>
                        </NavDropdown>
                    ) : null}
                </Nav>

                <Nav>
                    <Dropdown>
                        <Dropdown.Toggle
                            variant="outline-light"
                            id="dropdown-basic"
                            block
                        >
                            User Account
                        </Dropdown.Toggle>

                        <Dropdown.Menu align="right" className="text-center">
                            <Dropdown.Header className="pb-0 pt-1">
                                <div>
                                    <b>{context.DisplayName}</b>
                                </div>
                                <div>{context.Email}</div>
                                <div>
                                    {context.Access == 0 ? (
                                        <Badge variant="success">
                                            View Only
                                        </Badge>
                                    ) : null}
                                    {context.Access == 5 ? (
                                        <Badge variant="warning">Edit</Badge>
                                    ) : null}
                                    {context.Access == 10 ? (
                                        <Badge variant="danger">Admin</Badge>
                                    ) : null}
                                </div>
                            </Dropdown.Header>

                            <Dropdown.Divider />

                            <UpdateAccountInfoModal info={context} />
                            <ResetAccountPasswordModal info={context} />

                            <Dropdown.Divider />

                            <Link href="/logout">
                                <Dropdown.Item href="/logout">
                                    Logout
                                </Dropdown.Item>
                            </Link>
                        </Dropdown.Menu>
                    </Dropdown>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}
