import {Button, Form} from "react-bootstrap";
import React, {useState} from "react";
import axios, {AxiosError} from "axios";
import {getToken} from "../../util/jwtDecoder";
import {setNoticePopUp} from "../../redux/slice";
import jwtChecker from "../../util/jwtChecker";
import {Dispatch} from "redux";


interface ChangeEmailNicknameProps {
    dispatch: Dispatch<any>;
    isAdmin: boolean;
    translations: any;
    popupTranslations: any;
    adminSecret: string;
    setAdminSecret: React.Dispatch<React.SetStateAction<string>>;
    watchAdminSecret: boolean;
    setWatchAdminSecret: React.Dispatch<React.SetStateAction<boolean>>;
    apiUrl: string;
    userId: number;

}

const ChangeEmailNickname = (props:ChangeEmailNicknameProps) => {

    const [changeInfoEmail, setChangeInfoEmail] = useState<string>(``);
    const [changeInfoNickname, setChangeInfoNickname] = useState<string>(``);
    const dispatch = props.dispatch;
    const isAdmin = props.isAdmin;
    const apiUrl = props.apiUrl;
    const userId = props.userId;
    const translations = props.translations;
    const popupTranslations = props.popupTranslations;
    const adminSecret = props.adminSecret;
    const setAdminSecret = props.setAdminSecret;
    const watchAdminSecret = props.watchAdminSecret;
    const setWatchAdminSecret = props.setWatchAdminSecret;


    const clearState = () => {
        setChangeInfoEmail(``);
        setChangeInfoNickname(``);
        setAdminSecret('');
    }

    const handleChangeEmailNickname = async (event: React.FormEvent) => {
        event.preventDefault();
        try {

            const reqData = !isAdmin?
                {
                    email: changeInfoEmail,
                    nickname : changeInfoNickname
                }
                :
                {
                    email: changeInfoEmail,
                    nickname : changeInfoNickname,
                    adminSecret: adminSecret
                };

            const response = await axios.put(`${apiUrl}/${isAdmin? "admin" : "user"}/change/info/${userId}`, reqData, {headers: { Authorization: `Bearer ${getToken()}` }});

            if (response.status === 201) {

                dispatch(setNoticePopUp({
                    on: true,
                    is_error: false,
                    message: popupTranslations.AccountChangeInfoSuccess
                }));

                clearState();

            }

        } catch (error) {

            const axiosError = error as AxiosError<{ changeInfo: number }>;
            if (axiosError.response) {

                const changeInfo = axiosError.response.data.changeInfo;
                let message = ``;
                switch (changeInfo) {
                    case 1:
                        message = popupTranslations.AdminSecretWrong;
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
            <div className={"ac_title"}>{translations.changeEmailNickname}</div>
            <Form onSubmit={handleChangeEmailNickname}>
                <Form.Group controlId="changeEmail">
                    <Form.Label className={"ac_label"}>{translations.email}</Form.Label>
                    <Form.Control
                        className={"ac_control"}
                        type="email"
                        placeholder={translations.email}
                        value={changeInfoEmail}
                        onChange={(e) => setChangeInfoEmail(e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId="changeNickname" className="mt-3">
                    <Form.Label className={"ac_label"}>{translations.nickname}</Form.Label>
                    <Form.Control
                        className={"ac_control"}
                        type="text"
                        placeholder={translations.nickname}
                        value={changeInfoNickname}
                        onChange={(e) => setChangeInfoNickname(e.target.value)}
                    />
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

export default ChangeEmailNickname;