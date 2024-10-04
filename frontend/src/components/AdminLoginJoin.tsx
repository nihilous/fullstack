import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { setNoticePopUp } from '../redux/slice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { startJwtTimers } from '../util/timer';
import { useNavigate } from 'react-router-dom';
import { loginJoinTranslations } from '../translation/LoginJoin';
import { PopupMessageTranslations } from '../translation/PopupMessageTranslations';
import { Form, Button, Container, Col, Row } from 'react-bootstrap';

const AdminLoginJoin = () => {
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
  const [adminSecret, setAdminSecret] = useState('');
  const [isCookieSet] = useState<boolean>(Cookies.get(`token`) !== undefined);
  const translations = loginJoinTranslations[language];
  const popupTranslations = PopupMessageTranslations[language];

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/login/admin`, {
        email: loginEmail,
        password: loginPassword,
      });
      Cookies.set('token', response.data.token);

      const expirationTime = Date.now() + 60 * 60 * 1000;
      const preWarningTime = expirationTime - 10 * 60 * 1000;
      localStorage.setItem('jwtExpiration', expirationTime.toString());
      startJwtTimers(dispatch, expirationTime, preWarningTime);
      navigate('/admin/main');
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

        dispatch(
          setNoticePopUp({
            on: true,
            is_error: true,
            message: message,
          }),
        );
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
      await axios.post(`${apiUrl}/admin/`, {
        email: joinEmail,
        nickname: joinNickname,
        password: joinPassword,
        adminSecret: adminSecret,
      });

      setJoinEmail('');
      setJoinNickname('');
      setJoinPassword('');
      setJoinPasswordRepeat('');
      setAdminSecret('');

      const message = popupTranslations.AdminJoinSuccess;

      dispatch(
        setNoticePopUp({
          on: true,
          is_error: false,
          message: message,
        }),
      );

      setIsLoginView(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ adminJoinRes: number }>;
      if (axiosError.response) {
        const adminJoinRes = axiosError.response.data.adminJoinRes;
        let message = ``;
        switch (adminJoinRes) {
          case 1:
            message = popupTranslations.AdminJoinRequired;
            break;
          case 2:
            message = popupTranslations.AdminJoinWrong;
            break;
          case 3:
            message = popupTranslations.JoinInvalid;
            break;
          case 4:
            message = popupTranslations.AdminJoinAlready;
            break;
          default:
            message = popupTranslations.defaultError;
            break;
        }

        dispatch(
          setNoticePopUp({
            on: true,
            is_error: true,
            message: message,
          }),
        );
      }
    }
  };

  return (
    <Container className="LoginJoin center_ui">
      {isCookieSet ? (
        <></>
      ) : (
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
                    onChange={e => setLoginEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="loginPassword" className="mt-3">
                  <Form.Label>{translations.password}</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder={translations.password}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="mt-3">
                  {translations.login}
                </Button>
                <Button
                  variant="secondary"
                  className="mt-3 ms-2"
                  onClick={() => setIsLoginView(false)}
                >
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
                    onChange={e => setJoinEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="joinNickname" className="mt-3">
                  <Form.Label>{translations.nickname}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={translations.nickname}
                    value={joinNickname}
                    onChange={e => setJoinNickname(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="joinPassword" className="mt-3">
                  <Form.Label>{translations.password}</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder={translations.password}
                    value={joinPassword}
                    onChange={e => setJoinPassword(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="joinPasswordRepeat" className="mt-3">
                  <Form.Label>{translations.password_repeat}</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder={translations.password_repeat}
                    value={joinPasswordRepeat}
                    onChange={e => setJoinPasswordRepeat(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="joinAdminSecret" className="mt-3">
                  <Form.Label>{translations.admin_pass_key}</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder={translations.admin_pass_key}
                    value={adminSecret}
                    onChange={e => setAdminSecret(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="mt-3">
                  {translations.register}
                </Button>
                <Button
                  variant="secondary"
                  className="mt-3 ms-2"
                  onClick={() => setIsLoginView(true)}
                >
                  {translations.cancel}
                </Button>
              </Form>
            )}
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AdminLoginJoin;
