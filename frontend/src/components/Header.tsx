import React, {useState} from 'react';
import { setNoticePopUp } from '../redux/slice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {Navbar, Nav, Form, Button, FormControl} from 'react-bootstrap';
import Cookies from 'js-cookie';
import { HeaderTranslations } from '../translation/Header';
import { useNavigate } from 'react-router-dom';
import logout from "../util/logout";
import {getDecodedToken} from "../util/jwtDecoder";
const Header = () => {

    const language = useSelector((state: RootState) => state.app.language);
    const notice_popup = useSelector((state: RootState) => state.app.notice_popup);
    const translations = HeaderTranslations[language];
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isCookieSet, setIsCookieSet] = useState<boolean>(Cookies.get(`token`) !== undefined);
    const isAdmin = getDecodedToken()?.admin;
    const handleLogout = () => {
        logout(navigate, dispatch);
    };

    const noticePopUpOn = () => {

        const clearing = () => {
            dispatch(setNoticePopUp({on:false,is_error:null, message: ""}));
        }

        setTimeout(() => {
            clearing()
        }, 3000)

        return(
            <div className={"header_pop_up_wrap"}>
                <div className={`${notice_popup.is_error ? "header_pop_up hpu_error" : "header_pop_up hpu_inst"}`}>{`${notice_popup.message}`}</div>
            </div>
        )

    };

    return (
        <>
            <Navbar bg="light" expand="lg" className={"header_nav"}>
                <Navbar.Brand className="m-auto" >{`${translations.brand} `}</Navbar.Brand>

                {isCookieSet ?
                    <>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />

                        <Navbar.Collapse id="basic-navbar-nav">

                            {
                                isAdmin?
                                        <>
                                            <Nav className="m-auto">
                                                <Nav.Link href="/admin/main">{`${translations.main}`}</Nav.Link>
                                            </Nav>
                                            <Nav className="m-auto">
                                                <Nav.Link href="/board">{`${translations.board}`}</Nav.Link>
                                            </Nav>
                                            <Nav className="m-auto">
                                                <Button variant="outline-secondary" onClick={handleLogout}>
                                                    {translations.logout}
                                                </Button>
                                            </Nav>
                                        </>

                                    :
                                    <>
                                        <Nav className="m-auto">
                                            <Nav.Link href="/main">{`${translations.main}`}</Nav.Link>
                                        </Nav>
                                        <Nav className="m-auto">
                                            <Nav.Link href="/register_child">{`${translations.register}`}</Nav.Link>
                                        </Nav>
                                        <Nav className="m-auto">
                                            <Nav.Link href="/board">{`${translations.board}`}</Nav.Link>
                                        </Nav>
                                        <Nav className="m-auto">
                                            <Nav.Link href="/account">{`${translations.account}`}</Nav.Link>
                                        </Nav>
                                        <Nav className="m-auto">
                                            <Button variant="outline-secondary" onClick={handleLogout}>
                                                {translations.logout}
                                            </Button>
                                        </Nav>
                                    </>

                            }

                        </Navbar.Collapse>
                    </>
                    :
                    null
                }
            </Navbar>
            {notice_popup.on ?
                noticePopUpOn()
                :
                null
            }
        </>

    );
};

export default Header;