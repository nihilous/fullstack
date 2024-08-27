import React, { useState, useEffect } from 'react';
import axios, {AxiosError} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { useParams, useNavigate } from 'react-router-dom';
import { HistoryTranslations } from '../translation/History';
import {getToken, getDecodedToken} from "../util/jwtDecoder";
import {Button, Container, Form} from "react-bootstrap";
import {setNoticePopUp} from "../redux/slice";
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";

const History = () => {

    interface HistoryProperty {
        id: number
        vaccine_name: string
        vaccine_round: number
        history_date: string
    }

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;
    const { id } = useParams();
    const user_detail_id = Number(id);
    const userDetailIds = getDecodedToken()?.userDetailIds;
    const translations = HistoryTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [vaccinationHistory, setVaccinationHistory] = useState<HistoryProperty[]>([]);
    const [removeChild, setRemoveChild] = useState<boolean>(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string>(``);
    const approveMessage = translations.agree_to_delete;

    userDetailIds?.map((child_id: number) => {
        if(child_id === user_detail_id && !isAuthorized){
            setIsAuthorized(true);
        }

    })

    useEffect(() => {
        const historyDataFetch = async () => {

            try {

                const response = await axios.get<HistoryProperty[]>(`${apiUrl}/history/${userId}/${id}`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });
                setVaccinationHistory(response.data);

            } catch (error) {
                const axiosError = error as AxiosError<{ historyRes: number }>;
                if (axiosError.response) {
                    const HistoryRes = axiosError.response.data.historyRes;
                    let message = ``;
                    switch (HistoryRes) {
                        case 1:
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

        if(userId === undefined){
            navigate("/")
        }

        if(!isAuthorized){
            return
        }

        historyDataFetch();

    }, []);

    const showingHistory = (histories: HistoryProperty[] ) => {
        return histories.map((history) => {

            const formatDate = (dateString: string) => {
                const [year, month, day] = dateString.split('T')[0].split('-');
                return { year, month, day };
            };

            const yyyy_mm_dd = formatDate(history.history_date as string);
            return (

                <Container key={history.id} className="child-info history_info_elem">
                    <div>{`${translations.name}`}</div>
                    <div className={"hie_vaccine_name"}>{`${history.vaccine_name}`}</div>

                    <div>
                        <div className={"hie_info"}>
                            <span>
                                {`${translations.date}`}
                            </span>
                            <span>
                                {`${language === "FIN" ?
                                yyyy_mm_dd.day + " " + yyyy_mm_dd.month + " " + yyyy_mm_dd.year
                                :
                                yyyy_mm_dd.year + " " + yyyy_mm_dd.month + " " + yyyy_mm_dd.day}`}
                            </span>
                        </div>
                        <div className={"hie_info"}>
                            <span>
                                {`${translations.round}`}
                            </span>
                            <span>
                                {`${history.vaccine_round}`}
                            </span>

                        </div>
                    </div>
                </Container>

            );
        });
    };

    const deleteChildRecord = async () => {

        let message = ``;
        if(deleteConfirm !== approveMessage){
            message = "not matched";
            dispatch(setNoticePopUp({
                on: true,
                is_error: true,
                message: message
            }));
            return
        }

        try {

            const response = await axios.delete(`${apiUrl}/user/${userId}/${id}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if(response?.data.affectedHistoryRow === 0){
                message = popupTranslations.delete_success
            }else{
                message = `${popupTranslations.delete_history_success}${response?.data.affectedHistoryRow}`;
            }

            dispatch(setNoticePopUp({
                on: true,
                is_error: false,
                message: message
            }));

            navigate('/main');


        } catch (error) {
            const axiosError = error as AxiosError<{ childDeleteRes: number }>;
            if (axiosError.response) {
                const ChildDeleteRes = axiosError.response.data.childDeleteRes;
                switch (ChildDeleteRes) {
                    case 1:
                        message = popupTranslations.injection;
                        break;
                    case 2:
                        message = popupTranslations.noAuthority;
                        break;
                    case 3:
                        message = popupTranslations.delete_already;
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

    const deleteChildRecordUI = () => {
        return(
            <div className={"popup_form"}>
                <Container>
                        <Form.Group controlId="DeleteApprove" className="mt-3">
                            <Form.Label>{translations.delete_child_record}</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder={`${translations.type}${translations.agree_to_delete}`}
                                value={deleteConfirm}
                                onChange={(e) => setDeleteConfirm(e.target.value)}
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="mt-3" onClick={() => deleteChildRecord()}>
                            {`${translations.delete}`}
                        </Button>
                        <Button variant="secondary" className="mt-3 ms-2" onClick={() => setRemoveChild(!removeChild)}>
                            {`${translations.cancel}`}
                        </Button>

                </Container>
            </div>
        )
    };


    return (

        <Container className="History center_ui">
            <div className={"main_top container"}>
                <p className={"history_title"}>{`${translations.title}`}</p>
            </div>
            {
                vaccinationHistory.length !== 0 ?
                    showingHistory(vaccinationHistory)
                    :
                    <div className={"main_top container"}>
                        <p className={"history_title"}>{translations.no_record}</p>
                    </div>

            }

            <div className={"container"}>
                <Button onClick={() => setRemoveChild(!removeChild)}>{translations.delete_child_record}</Button>
            </div>
            <div className={"clear"}></div>

            {
                removeChild ?
                    deleteChildRecordUI()
                    :
                    null
            }
        </Container>

    );
};

export default History;