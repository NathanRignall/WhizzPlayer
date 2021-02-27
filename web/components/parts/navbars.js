import Link from "next/link";

import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";

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
                    <Nav.Link href="#deets">Username</Nav.Link>

                    <Nav.Link eventKey={2} href="#memes">
                        Logout
                    </Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}
