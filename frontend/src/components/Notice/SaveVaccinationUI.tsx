import {Button, Container, Form} from "react-bootstrap";
import React from "react";
import axios, {AxiosError} from "axios";
import {getToken} from "../../util/jwtDecoder";
import {setNoticePopUp} from "../../redux/slice";
import logout from "../../util/logout";
import {Dispatch} from "redux";
import {NavigateFunction, useNavigate} from "react-router-dom";

interface ChangeEmailNicknameProps {
    dispatch: Dispatch<any>;
    navigate: NavigateFunction
    translations: any;
    popupTranslations: any;
    apiUrl: string;
    userId: number;
    id: string;
    noticeDataFetch: Function;
    handleVaccination: Function;
    vaccinationDate: string
    setVaccinationDate: React.Dispatch<React.SetStateAction<string>>;
    vaccineId: number;
}

const SaveVaccinationUI = (props: ChangeEmailNicknameProps) => {

    const dispatch = props.dispatch;
    const navigate = props.navigate;
    const apiUrl = props.apiUrl;
    const userId = props.userId;
    const translations = props.translations;
    const popupTranslations = props.popupTranslations;
    const id = props.id;
    const vaccineId = props.vaccineId;
    const noticeDataFetch = props.noticeDataFetch;
    const handleVaccination = props.handleVaccination;
    const vaccinationDate = props.vaccinationDate;
    const setVaccinationDate = props.setVaccinationDate;

    const saveVaccinationInfo = async (event: React.FormEvent) => {
        event.preventDefault();
        try {

            const response = await axios.post(`${apiUrl}/history/${userId}/${id}`, {
                "vaccine_id" : vaccineId,
                "history_date" : vaccinationDate
            },{
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if(response.status === 201) {
                await noticeDataFetch();

                let message = popupTranslations.HistoryRegiSuccess
                dispatch(setNoticePopUp({
                    on: true,
                    is_error: false,
                    message: message
                }));
            }

            handleVaccination(null)
            return response.data;

        } catch (error) {

            const axiosError = error as AxiosError<{ historyRegiRes: number }>;
            if (axiosError.response) {

                const HistoryRegiRes = axiosError.response.data.historyRegiRes;
                let message = ``;
                switch (HistoryRegiRes) {
                    case 1:
                        message = popupTranslations.noAuthority;
                        break;
                    case 2:
                        message = popupTranslations.injection;
                        break;
                    case 3:
                        message = popupTranslations.HistoryAlready;
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

            if (axiosError.response?.status === 403) {
                logout(navigate, dispatch, false);
            }
        }
    }

    return(
        <div className={"popup_form"}>
            <Container>
                <Form onSubmit={saveVaccinationInfo}>
                    <Form.Group controlId="registerChildBirthdate">
                        <Form.Label>{`${translations.vaccination_date}`}</Form.Label>
                        <Form.Control
                            type="date"
                            placeholder={`${translations.vaccination_date}`}
                            value={vaccinationDate}
                            onChange={(e) => setVaccinationDate(e.target.value)}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="mt-3">
                        {`${translations.save}`}
                    </Button>
                    <Button variant="secondary" className="mt-3 ms-2" onClick={() => handleVaccination(null)}>
                        {`${translations.cancel}`}
                    </Button>
                </Form>
            </Container>
        </div>
    )
};

export default SaveVaccinationUI;