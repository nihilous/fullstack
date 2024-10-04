import {Button, Form} from "react-bootstrap";
import React, {useState} from "react";
import axios, {AxiosError} from "axios";
import {getToken} from "../../util/jwtDecoder";
import {setNoticePopUp} from "../../redux/slice";
import logout from "../../util/logout";
import jwtChecker from "../../util/jwtChecker";
import {Dispatch} from "redux";
import {NavigateFunction} from "react-router-dom";

interface InactivateAccountProps {
    dispatch: Dispatch<any>;
    navigate: NavigateFunction
    translations: any;
    popupTranslations: any;
    apiUrl: string;
    userId: number;

}

const InactivateAccount = (props: InactivateAccountProps) => {

    const [approveDeactivation, setApproveDeactivation] = useState<boolean>(false);

    const dispatch = props.dispatch;
    const navigate = props.navigate;
    const apiUrl = props.apiUrl;
    const userId = props.userId;
    const translations = props.translations;
    const popupTranslations = props.popupTranslations;


    const clearState = () => {
        setApproveDeactivation(false);
    }

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
                    logout(navigate, dispatch, false)
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
            <div className={"ac_title"}>{translations.deactivate_account}</div>
            <div className={"ac_inst"}>{translations.deactivateInstruction}</div>
            <Form className={"ac_agree"} onSubmit={handleInactivateAccount}>
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

export default InactivateAccount;