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

                    <NavDropdown title="Settings" id="collasible-nav-dropdown">
                        <NavDropdown.Item href="#action/3.1">
                            Action
                        </NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.2">
                            Another action
                        </NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.3">
                            Something
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item href="#action/3.4">
                            Separated link
                        </NavDropdown.Item>
                    </NavDropdown>
                </Nav>

                <Nav>
                    <Nav.Link href="/acount">{props.DisplayName}</Nav.Link>{" "}
                    <Link href="/logout">
                        <Button variant="outline-light">Logout</Button>
                    </Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}
