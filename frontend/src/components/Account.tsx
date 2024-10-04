import React, { useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { AccountTranslations } from '../translation/Account';
import {getDecodedToken} from "../util/jwtDecoder";
import {Container, Form} from "react-bootstrap";
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";
import ChangeEmailNickname from "./Account/ChangeEmailNickname"
import ChangePassword from "./Account/ChangePassword"
import InactivateAccount from "./Account/InactivateAccount"

const Account = () => {


    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;
    const isAdmin = getDecodedToken()?.admin;
    const translations = AccountTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];

    const [accountService, setAccountService] = useState<string>("1");

    const [adminSecret, setAdminSecret] = useState<string>(``);
    const [watchAdminSecret, setWatchAdminSecret] = useState<boolean>(false);


    const handleAccountServiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setAccountService(event.target.value);
    };

    return (

        <Container className="Account center_ui">
            <div className={"main_top"}>
                <p className={`account_title`}>{translations.account_title}</p>
            </div>
            <div className={"account_category"}>
                <Form className="d-flex align-items-center">
                    <Form.Label className="mb-0 text-nowrap ac_label">{translations.account_info_setup}</Form.Label>
                    <Form.Select
                        value={accountService}
                        onChange={handleAccountServiceChange}
                        size="sm"
                        className="footer_language"
                    >
                        <option value="1">{translations.changeEmailNickname}</option>
                        <option value="2">{translations.changePassword}</option>
                        {
                            !isAdmin ?
                                <option value="3">{translations.deactivate_account}</option>
                                :
                                null
                        }


                    </Form.Select>
                </Form>
            </div>
            <div>
                {accountService === "1" && <ChangeEmailNickname
                    dispatch={dispatch}
                    isAdmin={isAdmin as boolean}
                    translations={translations}
                    popupTranslations={popupTranslations}
                    adminSecret={adminSecret}
                    setAdminSecret={setAdminSecret}
                    watchAdminSecret={watchAdminSecret}
                    setWatchAdminSecret={setWatchAdminSecret}
                    apiUrl={apiUrl}
                    userId={userId as number}
                />}
                {accountService === "2" && <ChangePassword
                    dispatch={dispatch}
                    isAdmin={isAdmin as boolean}
                    translations={translations}
                    popupTranslations={popupTranslations}
                    adminSecret={adminSecret}
                    setAdminSecret={setAdminSecret}
                    watchAdminSecret={watchAdminSecret}
                    setWatchAdminSecret={setWatchAdminSecret}
                    apiUrl={apiUrl}
                />}
                {accountService === "3" && <InactivateAccount
                    dispatch={dispatch}
                    navigate={navigate}
                    translations={translations}
                    popupTranslations={popupTranslations}
                    apiUrl={apiUrl}
                    userId={userId as number}
                />}
            </div>


        </Container>

    );
};

export default Account;