import React, {useState} from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {Navbar, Nav, Form, Button, FormControl} from 'react-bootstrap';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { HeaderTranslations } from '../translation/Header';

const Header = () => {

    const language = useSelector((state: RootState) => state.app.language);
    const navigate = useNavigate();
    const translations = HeaderTranslations[language];

    const [isCookieSet, setIsCookieSet] = useState<boolean>(Cookies.get(`token`) !== undefined);

    const handleLogout = () => {

        Cookies.remove('token')
        navigate('/');

    };

    console.log(isCookieSet)

    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand href="/">{`${translations.brand} `}</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    {`${translations.welcome} `}
                </Nav>
                {isCookieSet ?
                    <>
                        <Nav className="me-auto">
                            <Nav.Link href="/main">Main</Nav.Link>
                        </Nav>
                        <Nav className="me-auto">
                            <Nav.Link href="/register_child">{`${translations.register}`}</Nav.Link>
                        </Nav>
                    </>

                :
                    <></>
                }

                <Nav className="ms-auto">
                    <Button variant="outline-secondary" onClick={handleLogout}>
                        Logout
                    </Button>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Header;