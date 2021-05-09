import Link from "next/link";

import { Navbar, Nav, NavDropdown, Button } from "react-bootstrap";

export default function CoreNavbar(props) {
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

                    <Link href="/cues">
                        <Nav.Link href="/cues">Cues</Nav.Link>
                    </Link>

                    <Link href="/tracks">
                        <Nav.Link href="/tracks">Tracks</Nav.Link>
                    </Link>

                    {props.info.Access == 10 ? (
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
                    <Nav.Link href="/">{props.info.DisplayName}</Nav.Link>{" "}
                    <Link href="/logout">
                        <Button variant="outline-light">Logout</Button>
                    </Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}
