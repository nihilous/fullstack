import React, { useState } from 'react';
import axios, {AxiosError} from 'axios';
import Cookies from 'js-cookie';
import { setNoticePopUp } from '../redux/slice';
import { useDispatch,useSelector } from 'react-redux';
import { RootState } from '../store';
import { startJwtTimers } from "../util/timer";
import { useNavigate } from 'react-router-dom';
import { loginJoinTranslations } from '../translation/LoginJoin';
import { PopupMessageTranslations } from '../translation/PopupMessageTranslations';
import { Form, Button, Container, Col, Row } from 'react-bootstrap';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import ForumIcon from '@mui/icons-material/Forum';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import logout from "../util/logout";

const LoginJoin = () => {
    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [isLoginView, setIsLoginView] = useState(true);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [joinEmail, setJoinEmail] = useState('');
    const [joinNickname, setJoinNickname] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [joinPasswordRepeat, setJoinPasswordRepeat] = useState('');
    const [isCookieSet, setIsCookieSet] = useState<boolean>(Cookies.get(`token`) !== undefined);
    const translations = loginJoinTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];

    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        ...theme.applyStyles('dark', {
            backgroundColor: '#1A2027',
        }),
    }));

    const Marginer = {marginBottom: `20px`};
    const IconStyle = {width: `120px`, height: `120px`, color: `#1976d2`};
    const FontArea = {fontSize: `26px`, fontWeight: `bold`};

    const handleLoginSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${apiUrl}/login/`, {
                email: loginEmail,
                password: loginPassword,
            });
            Cookies.set('token', response.data.token);

            const expirationTime = Date.now() + 60 * 60 * 1000;
            const preWarningTime = expirationTime - 10 * 60 * 1000;
            localStorage.setItem('jwtExpiration', expirationTime.toString());
            startJwtTimers(dispatch, expirationTime, preWarningTime);
            window.location.reload();

        } catch (error) {
            const axiosError = error as AxiosError<{ loginRes: number }>;
            if (axiosError.response) {

                const joinRes = axiosError.response.data.loginRes;
                let message = ``;
                switch (joinRes) {
                    case 1:
                        message = popupTranslations.LoginRequired;
                        break;
                    case 2:
                        message = popupTranslations.LoginInvalid;
                        break;
                    case 3:
                        message = popupTranslations.TokenSaveFailure;
                        break;
                    default:
                        message = popupTranslations.defaultError;
                        break;
                }

                dispatch(setNoticePopUp({
                    on: true,
                    is_error: true,
                    message: message
                }));
            }

        }
    };

    const handleJoinSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (joinPassword !== joinPasswordRepeat) {
                console.error('Passwords do not match');
                return;
            }
            const response = await axios.post(`${apiUrl}/user/`, {
                email: joinEmail,
                nickname: joinNickname,
                password: joinPassword,
            });

            setJoinEmail('');
            setJoinNickname('');
            setJoinPassword('');
            setJoinPasswordRepeat('');

            const message = popupTranslations.JoinSuccess

            dispatch(setNoticePopUp({
                on: true,
                is_error: false,
                message: message
            }));

            setIsLoginView(true);

        } catch (error) {
            const axiosError = error as AxiosError<{ joinRes: number }>;
            if (axiosError.response) {

                const joinRes = axiosError.response.data.joinRes;
                let message = ``;
                switch (joinRes) {

                    case 1:
                        message = popupTranslations.JoinRequired;
                        break;
                    case 2:
                        message = popupTranslations.JoinInvalid;
                        break;
                    case 3:
                        message = popupTranslations.JoinExist;
                        break;
                    default:
                        message = popupTranslations.defaultError;
                        break;
                }

                dispatch(setNoticePopUp({
                    on: true,
                    is_error: true,
                    message: message
                }));
            }
        }
    };

    return (

            <Container className="LoginJoin center_ui">
                {isCookieSet ?
                    <Container className="center_ui">
                        <Box sx={{ width: '100%' }}>
                            <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                                <Grid size={6} onClick={() => navigate("/main")} style={Marginer}>
                                    <Item>
                                        <div>
                                            <MedicalInformationIcon style={IconStyle}/>
                                        </div>
                                        <div style={FontArea}>
                                            {translations.main}
                                        </div>
                                    </Item>
                                </Grid>
                                <Grid size={6} onClick={() => navigate("/board")} style={Marginer}>
                                    <Item>
                                        <div>
                                            <ForumIcon style={IconStyle}/>
                                        </div>
                                        <div style={FontArea}>
                                            {translations.board}
                                        </div>
                                    </Item>
                                </Grid>
                                <Grid size={6} onClick={() => navigate("/about")} style={Marginer}>
                                    <Item>
                                        <div>
                                            <ContactSupportIcon style={IconStyle}/>
                                        </div>
                                        <div style={FontArea}>
                                            {translations.about}
                                        </div>
                                    </Item>
                                </Grid>
                                <Grid size={6} onClick={() => navigate("/account")} style={Marginer}>
                                    <Item>
                                        <div>
                                            <AccountCircleIcon style={IconStyle}/>
                                        </div>
                                        <div style={FontArea}>
                                            {translations.account}
                                        </div>
                                    </Item>
                                </Grid>
                                <Grid size={12} onClick={() => logout(navigate, dispatch, false)}>
                                    <Item>
                                        <div>
                                            <LogoutOutlinedIcon style={IconStyle}/>
                                        </div>
                                        <div style={FontArea}>
                                            {translations.logout}
                                        </div>
                                    </Item>
                                </Grid>
                            </Grid>
                        </Box>

                    </Container>
                    :
                    <Row className="justify-content-md-center">
                        <Col md={6}>
                            {isLoginView ? (
                                <Form onSubmit={handleLoginSubmit}>
                                    <Form.Group controlId="loginEmail">
                                        <Form.Label>{translations.email}</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder={translations.email}
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="loginPassword" className="mt-3">
                                        <Form.Label>{translations.password}</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder={translations.password}
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Button variant="primary" type="submit" className="mt-3">
                                        {translations.login}
                                    </Button>
                                    <Button variant="secondary" className="mt-3 ms-2" onClick={() => setIsLoginView(false)}>
                                        {translations.join}
                                    </Button>
                                </Form>
                            ) : (
                                <Form onSubmit={handleJoinSubmit}>
                                    <Form.Group controlId="joinEmail">
                                        <Form.Label>{translations.email}</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder={translations.email}
                                            value={joinEmail}
                                            onChange={(e) => setJoinEmail(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="joinNickname" className="mt-3">
                                        <Form.Label>{translations.nickname}</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder={translations.nickname}
                                            value={joinNickname}
                                            onChange={(e) => setJoinNickname(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="joinPassword" className="mt-3">
                                        <Form.Label>{translations.password}</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder={translations.password}
                                            value={joinPassword}
                                            onChange={(e) => setJoinPassword(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Form.Group controlId="joinPasswordRepeat" className="mt-3">
                                        <Form.Label>{translations.password_repeat}</Form.Label>
                                        <Form.Control
                                            type="password"
                                            placeholder={translations.password_repeat}
                                            value={joinPasswordRepeat}
                                            onChange={(e) => setJoinPasswordRepeat(e.target.value)}
                                        />
                                    </Form.Group>

                                    <Button variant="primary" type="submit" className="mt-3">
                                        {translations.register}
                                    </Button>
                                    <Button variant="secondary" className="mt-3 ms-2" onClick={() => setIsLoginView(true)}>
                                        {translations.cancel}
                                    </Button>
                                </Form>
                            )}
                        </Col>
                    </Row>
                }

            </Container>

    );
};

export default LoginJoin;