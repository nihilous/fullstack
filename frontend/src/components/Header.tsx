import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../redux/slice';
import { RootState } from '../store';
import { Navbar, Nav, Form, FormControl } from 'react-bootstrap';

const Header: React.FC = () => {
    const dispatch = useDispatch();
    const language = useSelector((state: RootState) => state.app.language);

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setLanguage(event.target.value as 'FIN' | 'ENG' | 'KOR'));
    };

    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand href="/">Vaccination Log</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    {`Welcome `}
                </Nav>
                <Nav className="mr-auto">
                    <Nav.Link href="/main">Main</Nav.Link>
                </Nav>
                <Form className="form-inline ml-auto">
                    <Form.Select
                        value={language}
                        onChange={handleLanguageChange}
                        className="ml-sm-2"
                    >
                        <option value="FIN">Suomi</option>
                        <option value="ENG">English</option>
                        <option value="KOR">한국어</option>
                    </Form.Select>
                </Form>
            </Navbar.Collapse>
        </Navbar>
    );
};

export default Header;