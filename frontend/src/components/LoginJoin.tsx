import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { loginJoinTranslations } from '../translation/LoginJoin';
import { Form, Button, Container, Col, Row } from 'react-bootstrap';

const LoginJoin: React.FC = () => {
    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const navigate = useNavigate();

    const [isLoginView, setIsLoginView] = useState(true);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [joinEmail, setJoinEmail] = useState('');
    const [joinNickname, setJoinNickname] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [joinPasswordRepeat, setJoinPasswordRepeat] = useState('');

    const translations = loginJoinTranslations[language];

    const handleLoginSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${apiUrl}/login/`, {
                email: loginEmail,
                password: loginPassword,
            });
            Cookies.set('token', response.data.token);
            navigate('/main');

        } catch (error) {
            console.error('Error logging in:', error);
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
            console.log('Join Data:', response.data);

            setJoinEmail('');
            setJoinNickname('');
            setJoinPassword('');
            setJoinPasswordRepeat('');

            setIsLoginView(true);
        } catch (error) {
            console.error('Error joining:', error);
        }
    };

    return (
        <Container className="LoginJoin">
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
        </Container>
    );
};

export default LoginJoin;