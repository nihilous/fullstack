import {Button, Form} from "react-bootstrap";
import React, {useState} from "react";
import axios, {AxiosError} from "axios";
import {getToken} from "../../util/jwtDecoder";
import {setNoticePopUp} from "../../redux/slice";
import jwtChecker from "../../util/jwtChecker";
import {Dispatch} from "redux";

interface ChangePasswordProps {
    dispatch: Dispatch<any>;
    isAdmin: boolean;
    translations: any;
    popupTranslations: any;
    adminSecret: string;
    setAdminSecret: React.Dispatch<React.SetStateAction<string>>;
    watchAdminSecret: boolean;
    setWatchAdminSecret: React.Dispatch<React.SetStateAction<boolean>>;
    apiUrl: string;

}

const ChangePassword = (props: ChangePasswordProps) => {

    const [changePassEmail, setChangePassEmail] = useState<string>(``);
    const [changePassOldPass, setChangePassOldPass] = useState<string>(``);
    const [changePassNewPass, setChangePassNewPass] = useState<string>(``);

    const [watchOldPass, setWatchOldPass] = useState<boolean>(false);
    const [watchNewPass, setWatchNewPass] = useState<boolean>(false);

    const dispatch = props.dispatch;
    const isAdmin = props.isAdmin;
    const apiUrl = props.apiUrl;
    const translations = props.translations;
    const popupTranslations = props.popupTranslations;
    const adminSecret = props.adminSecret;
    const setAdminSecret = props.setAdminSecret;
    const watchAdminSecret = props.watchAdminSecret;
    const setWatchAdminSecret = props.setWatchAdminSecret;


    const clearState = () => {
        setChangePassEmail(``);
        setChangePassOldPass(``);
        setChangePassNewPass(``);
        setAdminSecret('');
    }

    const handleChangePassword = async (event: React.FormEvent) => {
        event.preventDefault();
        try {

            const reqData = !isAdmin ?
                {
                    email:changePassEmail,
                    old_password:changePassOldPass,
                    new_password:changePassNewPass
                }
                :
                {
                    email:changePassEmail,
                    old_password:changePassOldPass,
                    new_password:changePassNewPass,
                    adminSecret: adminSecret
                };

            const response = await axios.put(`${apiUrl}/${isAdmin? "admin" : "user"}/new/password`,reqData , {headers: { Authorization: `Bearer ${getToken()}` }});

            if (response.status === 201) {

                dispatch(setNoticePopUp({
                    on: true,
                    is_error: false,
                    message: popupTranslations.AccountChangePassSuccess
                }));

                clearState();

            }

        } catch (error) {

            const axiosError = error as AxiosError<{ changePass: number }>;
            if (axiosError.response) {

                const changePass = axiosError.response.data.changePass;
                let message = ``;
                switch (changePass) {
                    case 1:
                        message = popupTranslations.AdminSecretWrong;
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
                        const checkRes = jwtChecker(error as AxiosError<{tokenExpired: boolean}>, popupTranslations);
                        message = checkRes.message;
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

    return(
        <div>
            <div className={"ac_title"}>{translations.changePassword}</div>

            <Form onSubmit={handleChangePassword}>
                <Form.Group controlId="changePassEmail">
                    <Form.Label className={"ac_label"}>{translations.email}</Form.Label>
                    <Form.Control
                        className={"ac_control"}
                        type="email"
                        placeholder={translations.email}
                        value={changePassEmail}
                        onChange={(e) => setChangePassEmail(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="changePassOld" className="mt-3">
                    <Form.Label className={"ac_label"}>{translations.old_password}</Form.Label>
                    <div className={"account_cp_wrap"}>
                        <Form.Control
                            className={"ac_control"}
                            type={watchOldPass ? "text" : "password"}
                            placeholder={translations.old_password}
                            value={changePassOldPass}
                            onChange={(e) => setChangePassOldPass(e.target.value)}
                        />
                        <label>
                            <input
                                type="checkbox"
                                checked={watchOldPass}
                                onChange={(e) => setWatchOldPass(e.target.checked)}
                            />
                            {translations.watch_old_pass}
                        </label>
                    </div>

                </Form.Group>

                <Form.Group controlId="changePassNew" className="mt-3">
                    <Form.Label className={"ac_label"}>{translations.new_password}</Form.Label>
                    <div className={"account_cp_wrap"}>
                        <Form.Control
                            className={"ac_control"}
                            type={watchNewPass ? "text" : "password"}
                            placeholder={translations.new_password}
                            value={changePassNewPass}
                            onChange={(e) => setChangePassNewPass(e.target.value)}
                        />

                        <label>
                            <input
                                type="checkbox"
                                checked={watchNewPass}
                                onChange={(e) => setWatchNewPass(e.target.checked)}
                            />
                            {translations.watch_new_pass}
                        </label>
                    </div>
                </Form.Group>

                {
                    isAdmin ?
                        <Form.Group controlId="changePassAdminSecret" className="mt-3">
                            <Form.Label className={"ac_label"}>{translations.admin_pass_key}</Form.Label>
                            <div className={"account_cp_wrap"}>
                                <Form.Control
                                    className={"ac_control"}
                                    type={watchAdminSecret ? "text" : "password"}
                                    placeholder={translations.admin_pass_key}
                                    value={adminSecret}
                                    onChange={(e) => setAdminSecret(e.target.value)}
                                />

                                <label>
                                    <input
                                        type="checkbox"
                                        checked={watchAdminSecret}
                                        onChange={(e) => setWatchAdminSecret(e.target.checked)}
                                    />
                                    {translations.watch_new_pass}
                                </label>
                            </div>
                        </Form.Group>
                        :
                        null

                }

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

export default ChangePassword;