import axios, {AxiosError} from "axios";
import {getToken} from "../../util/jwtDecoder";
import {setNoticePopUp} from "../../redux/slice";
import jwtChecker from "../../util/jwtChecker";
import {Button, Container, Form} from "react-bootstrap";
import React from "react";
import {Dispatch} from "redux";

interface UpdateHistoryUIProp {
    dispatch: Dispatch<any>;
    translations: any;
    popupTranslations: any;
    apiUrl : string;
    userId : number;
    historyDataFetch : Function;
    id : string;
    targetHistoryRef: React.MutableRefObject<number | null>;
    updateTargetDate : string;
    setUpdateTargetDate : React.Dispatch<React.SetStateAction<string>>;
    updateHistory : boolean;
    setUpdateHistory : React.Dispatch<React.SetStateAction<boolean>>;
}

const UpdateHistoryUI = (props: UpdateHistoryUIProp) => {


    const dispatch = props.dispatch;
    const translations = props.translations;
    const popupTranslations = props.popupTranslations;
    const apiUrl = props.apiUrl;
    const userId = props.userId;
    const id = props.id;
    const historyDataFetch = props.historyDataFetch;
    const targetHistoryRef = props.targetHistoryRef;
    const updateTargetDate = props.updateTargetDate;
    const setUpdateTargetDate = props.setUpdateTargetDate;
    const updateHistory = props.updateHistory;
    const setUpdateHistory = props.setUpdateHistory;


    const updateHistoryRecord = async () => {

        let message = ``;
        const target_history_id = targetHistoryRef.current;

        try {

            const response = await axios.put(`${apiUrl}/history/${userId}/${id}`,
                {"id": target_history_id, "history_date": updateTargetDate},
                {headers: { Authorization: `Bearer ${getToken()}` }
                });

            if(response?.data.affectedHistoryRow === 0){
                message = popupTranslations.update_history_record_zero
            }else{
                message = popupTranslations.update_history_record_success;
            }

            dispatch(setNoticePopUp({
                on: true,
                is_error: false,
                message: message
            }));
            await historyDataFetch();

            setUpdateHistory(!updateHistory)

        } catch (error) {
            const axiosError = error as AxiosError<{ historyUpdateRes: number }>;
            if (axiosError.response) {
                const HistoryUpdateRes = axiosError.response.data.historyUpdateRes;
                switch (HistoryUpdateRes) {
                    case 1:
                        message = popupTranslations.noAuthority;
                        break;
                    case 2:
                        message = popupTranslations.injection;
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
        <div className={"popup_form"}>
            <Container>
                <Form.Group controlId="registerChildBirthdate">
                    <Form.Label>{`${translations.new_date}`}</Form.Label>
                    <Form.Control
                        type="date"
                        placeholder={`${translations.new_date}`}
                        value={updateTargetDate}
                        onChange={(e) => setUpdateTargetDate(e.target.value)}
                    />
                </Form.Group>

                <Button variant="primary" type="submit" className="mt-3" onClick={() => updateHistoryRecord()}>
                    {`${translations.update}`}
                </Button>
                <Button variant="secondary" className="mt-3 ms-2" onClick={() => setUpdateHistory(!updateHistory)}>
                    {`${translations.cancel}`}
                </Button>

            </Container>
        </div>
    )
};

export default UpdateHistoryUI;