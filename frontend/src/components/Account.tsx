import React, { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AccountTranslations } from '../translation/Account';
import {getToken, getDecodedToken, decodeToken} from "../util/jwtDecoder";
import {Button, Container, Form} from "react-bootstrap";
import logout from "../util/logout";
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";
import Cookies from "js-cookie";
import {setNoticePopUp} from "../redux/slice";

const Account = () => {


    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;
    const translations = AccountTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];

    const [accountService, setAccountService] = useState<string>("1");

    const [changeInfoEmail, setChangeInfoEmail] = useState<string>(``);
    const [changeInfoNickname, setChangeInfoNickname] = useState<string>(``);
    const [changePassEmail, setChangePassEmail] = useState<string>(``);
    const [changePassOldPass, setChangePassOldPass] = useState<string>(``);
    const [changePassNewPass, setChangePassNewPass] = useState<string>(``);
    const [approveDeactivation, setApproveDeactivation] = useState<boolean>(false);

    const clearState = () => {
        setChangeInfoEmail(``);
        setChangeInfoNickname(``);
        setChangePassEmail(``);
        setChangePassOldPass(``);
        setChangePassNewPass(``);
        setApproveDeactivation(false);
    }

    const handleChangeEmailNickname = async (event: React.FormEvent) => {
        event.preventDefault();
        try {

            const reqData = {};

            const response = await axios.put(`${apiUrl}/user/change/info/${userId}`, reqData, {headers: { Authorization: `Bearer ${getToken()}` }});

            if (response.status === 201) {

                dispatch(setNoticePopUp({
                    on: true,
                    is_error: false,
                    message: popupTranslations.AccountChangeInfoSuccess
                }));

                clearState();

            }

        } catch (error) {

            const axiosError = error as AxiosError<{ userChangeInfo: number }>;
            if (axiosError.response) {

                const userChangeInfo = axiosError.response.data.userChangeInfo;
                let message = ``;
                switch (userChangeInfo) {
                    case 1:
                        message = popupTranslations.injection;
                        break;
                    case 2:
                        message = popupTranslations.noAuthority;
                        break;
                    case 3:
                        message = popupTranslations.AccountNoField;
                        break;
                    case 4:
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

    const changeEmailNickname = () => {

        return(
            <div>
                <div>{translations.changeEmailNickname}</div>
                <Form onSubmit={handleChangeEmailNickname}>
                    <Form.Group controlId="changeEmail">
                        <Form.Label>{translations.email}</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder={translations.email}
                            value={changeInfoEmail}
                            onChange={(e) => setChangeInfoEmail(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="changeNickname" className="mt-3">
                        <Form.Label>{translations.nickname}</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={translations.nickname}
                            value={changeInfoNickname}
                            onChange={(e) => setChangeInfoNickname(e.target.value)}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="mt-3">
                        {translations.change}
                    </Button>

                    <Button variant="secondary" className="mt-3 ms-2" onClick={() => clearState()}>
                        {translations.cancel}
                    </Button>
                </Form>
            </div>

        )
    };

    const handleChangePassword = async (event: React.FormEvent) => {
        event.preventDefault();
        try {

            const response = await axios.put(`${apiUrl}/user/new/password`, {
                email:changePassEmail,
                old_password:changePassOldPass,
                new_password:changePassNewPass

            }, {headers: { Authorization: `Bearer ${getToken()}` }});

            if (response.status === 201) {

                dispatch(setNoticePopUp({
                    on: true,
                    is_error: false,
                    message: popupTranslations.AccountChangePassSuccess
                }));

                clearState();

            }

        } catch (error) {

            const axiosError = error as AxiosError<{ userNewPass: number }>;
            if (axiosError.response) {

                const userNewPass = axiosError.response.data.userNewPass;
                let message = ``;
                switch (userNewPass) {
                    case 1:
                        message = popupTranslations.injection;
                        break;
                    case 2:
                        message = popupTranslations.AccountRequired;
                        break;
                    case 3:
                        message = popupTranslations.AccountWrongEmail;
                        break;
                    case 4:
                        message = popupTranslations.AccountWrongPass;
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

    const changePassword = () => {

        return(
            <div>
                <div>{translations.changePassword}</div>

                <Form onSubmit={handleChangePassword}>
                    <Form.Group controlId="changePassEmail">
                        <Form.Label>{translations.email}</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder={translations.email}
                            value={changePassEmail}
                            onChange={(e) => setChangePassEmail(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="changePassOld" className="mt-3">
                        <Form.Label>{translations.old_password}</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder={translations.old_password}
                            value={changePassOldPass}
                            onChange={(e) => setChangePassOldPass(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="changePassNew" className="mt-3">
                        <Form.Label>{translations.new_password}</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder={translations.new_password}
                            value={changePassNewPass}
                            onChange={(e) => setChangePassNewPass(e.target.value)}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="mt-3">
                        {translations.change}
                    </Button>
                    <Button variant="secondary" className="mt-3 ms-2" onClick={() => clearState()}>
                        {translations.cancel}
                    </Button>
                </Form>
            </div>


        )
    };

    const handleInactivateAccount = async (event: React.FormEvent) => {
        event.preventDefault();
        try {

            const response = await axios.delete(`${apiUrl}/user/${userId}}`, {headers: { Authorization: `Bearer ${getToken()}` }});

            if (response.status === 200) {

                dispatch(setNoticePopUp({
                    on: true,
                    is_error: false,
                    message: popupTranslations.UserDelete
                }));

                clearState();

                setTimeout(() => {
                    logout(navigate, dispatch)
                }, 3000)


            }

        } catch (error) {

            const axiosError = error as AxiosError<{ userDeleteRes: number }>;
            if (axiosError.response) {

                const userDeleteRes = axiosError.response.data.userDeleteRes;
                let message = ``;
                switch (userDeleteRes) {
                    case 1:
                        message = popupTranslations.injection;
                        break;
                    case 2:
                        message = popupTranslations.noAuthority;
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

    const inactivateAccount = () => {

        return(
            <div>
                <div>{translations.deactivate_account}</div>
                <div>{translations.deactivateInstruction}</div>
                <Form onSubmit={handleInactivateAccount}>
                    <Form.Group controlId="approveDeactivation" className="mt-3">
                        <Form.Check
                            type="checkbox"
                            label={translations.approve}
                            checked={approveDeactivation}
                            onChange={(e) => setApproveDeactivation(e.target.checked)}
                        />
                    </Form.Group>
                    {approveDeactivation ?
                        <Button variant="primary" type="submit" className="mt-3">
                            {translations.deactivate}
                        </Button>
                        :
                        null
                    }
                </Form>
            </div>

        )
    };

    const serviceTypes = (asTypes:string) => {

        switch(asTypes) {
            case "1":
                return changeEmailNickname()

            case "2":
                return changePassword();

            case "3":
                return inactivateAccount();
            default:
                return null;

        }
    };

    const handleAccountServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setAccountService(event.target.value);
    };

    return (

        <Container className="Account center_ui">
            <div className={"main_top"}>
                <p className={`account_title`}>{translations.account_title}</p>
            </div>
            <div>
                <Form className="d-flex align-items-center">
                    <Form.Label className="mb-0 text-nowrap">{translations.account_info_setup}</Form.Label>
                    <Form.Select
                        value={accountService}
                        onChange={handleAccountServiceChange}
                        size="sm"
                        className="footer_language"
                    >
                        <option value="1">{translations.changeEmailNickname}</option>
                        <option value="2">{translations.changePassword}</option>
                        <option value="3">{translations.deactivate_account}</option>
                    </Form.Select>
                </Form>
            </div>
            <div>
                {serviceTypes(accountService)}
            </div>


        </Container>

    );
};

export default Account;