import React, {useState, useEffect, useRef} from 'react';
import axios, {AxiosError} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { useParams, useNavigate } from 'react-router-dom';
import { HistoryTranslations } from '../translation/History';
import {getToken, getDecodedToken} from "../util/jwtDecoder";
import {Button, Col, Container, Form, Row} from "react-bootstrap";
import {setNoticePopUp} from "../redux/slice";
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";
import jwtChecker from "../util/jwtChecker";

const History = () => {

    interface HistoryProperty {
        name: string,
        birthdate: string,
        gender: number,
        nationality: string,
        description: string,
        histories :{
            id: number
            vaccine_name: string
            vaccine_round: number
            history_date: string
        } []
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
    const [vaccinationHistory, setVaccinationHistory] = useState<HistoryProperty>();
    const [removeChild, setRemoveChild] = useState<boolean>(false);
    const [updateHistory, setUpdateHistory] = useState<boolean>(false);
    const [updateTargetDate, setUpdateTargetDate] = useState<string>(``);
    const [removeHistory, setRemoveHistory] = useState<boolean>(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string>(``);
    const [name, setName] = useState<string>(``);
    const [birthdate, setBirthdate] = useState<string>(``);
    const [gender, setGender] = useState<number | null>(null);
    const [nationality, setNationality] = useState<string>(``);
    const [description, setDescription] = useState<string>(``);
    const [updateChild, setUpdateChild] = useState<boolean>(false);
    const targetHistoryRef = useRef<number | null>(null);
    const approveMessage = translations.agree_to_delete;

    userDetailIds?.map((child_id: number) => {
        if(child_id === user_detail_id && !isAuthorized){
            setIsAuthorized(true);
        }

    })

    const historyDataFetch = async () => {

        try {

            const response = await axios.get<HistoryProperty[]>(`${apiUrl}/history/${userId}/${id}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            setVaccinationHistory(response.data[0]);
            setName(response.data[0].name);
            setBirthdate(response.data[0].birthdate.split('T')[0]);
            setGender(response.data[0].gender);
            setNationality(response.data[0].nationality);
            setDescription(response.data[0].description);

        } catch (error) {
            const axiosError = error as AxiosError<{ historyRes: number }>;
            if (axiosError.response) {
                const HistoryRes = axiosError.response.data.historyRes;
                let message = ``;
                switch (HistoryRes) {
                    case 1:
                        message = popupTranslations.noAuthority;
                        break;
                    case 2:
                        message = popupTranslations.HistoryNotExist;
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

    useEffect(() => {


        if(userId === undefined){
            navigate("/")
        }

        if(!isAuthorized){
            return
        }

        historyDataFetch();

    }, []);

    const modifyChildRecord = async (id:number, method:string, oriDate:string | null) => {

        if(method === "update"){
            setUpdateHistory(!updateHistory);
            oriDate && setUpdateTargetDate(oriDate);
        }else if(method === "delete"){
            setRemoveHistory(!removeHistory);
        }

        targetHistoryRef.current = id;

    };

    const showingHistory = (histories: HistoryProperty) => {
        return histories.histories.map((history) => {

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

                        <div className={"hie_buttons"}>
                            <span>
                                <Button variant="warning" onClick={() => modifyChildRecord(history.id, "update", history.history_date.split('T')[0])}>{translations.update}</Button>
                            </span>
                            <span>
                                <Button variant="danger" onClick={() => modifyChildRecord(history.id, "delete", null)}>{translations.delete}</Button>
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
            setDeleteConfirm(``);
            return
        }

        try {

            const response = await axios.delete(`${apiUrl}/user/${userId}/${id}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if(response?.data.affectedHistoryRow === 0){
                message = popupTranslations.delete_success
            }else{
                message = `${popupTranslations.delete_child_record_success}${response?.data.affectedHistoryRow}`;
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

    const updateHistoryUI = () => {
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

    const deleteHistoryRecord = async () => {

        let message = ``;
        const target_history_id = targetHistoryRef.current;

        if(deleteConfirm !== approveMessage){
            message = "not matched";
            dispatch(setNoticePopUp({
                on: true,
                is_error: true,
                message: message
            }));
            setDeleteConfirm(``);
            return
        }

        try {

            const response = await axios.delete(`${apiUrl}/history/${userId}/${id}/${target_history_id}`,
                {headers: { Authorization: `Bearer ${getToken()}` }
                });

            if(response?.data.affectedHistoryRow === 0){
                message = popupTranslations.deleted_history_record_zero
            }else{
                message = popupTranslations.delete_history_record_success;
            }

            dispatch(setNoticePopUp({
                on: true,
                is_error: false,
                message: message
            }));
            setDeleteConfirm(``);
            await historyDataFetch();

            setRemoveHistory(!removeHistory)

        } catch (error) {
            const axiosError = error as AxiosError<{ historyDeleteRes: number }>;
            if (axiosError.response) {
                const HistoryDeleteRes = axiosError.response.data.historyDeleteRes;
                switch (HistoryDeleteRes) {
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

    const closeDeleteUI = () => {
        if(removeHistory){
            setRemoveHistory(!removeHistory);
        }else if(removeChild){
            setRemoveChild(!removeChild);
        }else if(updateChild){
            setUpdateChild(!updateChild);
        }
        setDeleteConfirm(``);
    }

    const deleteHistoryUI = () => {
        return(
            <div className={"popup_form"}>
                <Container>
                    <Form.Group controlId="DeleteApprove" className="mt-3">
                        <Form.Label>{removeHistory? translations.delete_history_record : translations.delete_child_record}</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={`${translations.type}${translations.agree_to_delete}`}
                            value={deleteConfirm}
                            onChange={(e) => setDeleteConfirm(e.target.value)}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="mt-3" onClick={() => removeHistory? deleteHistoryRecord() : deleteChildRecord()}>
                        {`${translations.delete}`}
                    </Button>
                    <Button variant="secondary" className="mt-3 ms-2" onClick={() => closeDeleteUI()}>
                        {`${translations.cancel}`}
                    </Button>

                </Container>
            </div>
        )
    };

    const updateChildRecord = async () => {

        try {

            const response = await axios.put(`${apiUrl}/user/${getDecodedToken()?.userId}/${id}`, {
                name: name,
                description: description,
                gender: gender,
                birthdate: birthdate,
                nationality: nationality,
            }, {headers: { Authorization: `Bearer ${getToken()}` }});


            dispatch(setNoticePopUp({
                on: true,
                is_error: false,
                message: popupTranslations.update_child_record_success
            }));

            historyDataFetch();
            closeDeleteUI();

        } catch (error) {

            const axiosError = error as AxiosError<{ childUpdateRes: number }>;
            if (axiosError.response) {

                const childUpdateRes = axiosError.response.data.childUpdateRes;
                let message = ``;
                switch (childUpdateRes) {
                    case 1:
                        message = popupTranslations.noAuthority;
                        break;
                    case 2:
                        message = popupTranslations.injection;
                        break;
                    case 3:
                        message = popupTranslations.AccountNoField;
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

    const updateChildUI = () => {
        return(
            <div className={"popup_form"}>
                <Container className="update_child">
                    <Row className="justify-content-md-center">
                        <Col md={6}>
                                <div className={"update_child_inst"}>{translations.update_child_inst}</div>

                                <Form.Group controlId="registerChildName">
                                    <Form.Label>{translations.child_name}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder={translations.child_name}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group controlId="registerChildBirthdate">
                                    <Form.Label>{translations.birthdate}</Form.Label>
                                    <Form.Control
                                        type="date"
                                        placeholder={translations.birthdate}
                                        value={birthdate}
                                        onChange={(e) => setBirthdate(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group controlId="registerChildGender">
                                    <Form.Label>{translations.gender}</Form.Label>
                                    <Form.Select
                                        value={gender ?? ""}
                                        onChange={(e) => setGender(parseInt(e.target.value, 10))}
                                    >
                                        <option value="">{translations.select_gender}</option>
                                        <option value={0}>{translations.boy}</option>
                                        <option value={1}>{translations.girl}</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group controlId="registerChildNationality">
                                    <Form.Label>{translations.nationality}</Form.Label>
                                    <Form.Select
                                        value={nationality ?? ""}
                                        onChange={(e) => setNationality(e.target.value)}
                                    >
                                        <option value="">{translations.select_nationality}</option>
                                        <option value="FIN">{translations.finland}</option>
                                        <option value="KOR">{translations.korea}</option>
                                        <option value="ENG">{translations.usa}</option>
                                    </Form.Select>
                                </Form.Group>

                            <Form.Group controlId="registerChildDescription">
                                    <Form.Label>{translations.description}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder={translations.description}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </Form.Group>
                                <div className="his_delete">
                                    <div>
                                        <Button variant="primary" className="mt-3" onClick={() => updateChildRecord()}>
                                            {translations.update}
                                        </Button>
                                    </div>
                                    <div>
                                        <Button variant="secondary" className="mt-3 ms-2" onClick={() => closeDeleteUI()}>
                                            {translations.cancel}
                                        </Button>
                                    </div>
                                </div>


                        </Col>
                    </Row>
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
                vaccinationHistory?.histories ?
                    vaccinationHistory?.histories && showingHistory(vaccinationHistory)
                    :
                    <div className={"main_top container"}>
                        <p className={"history_title"}>{translations.no_record}</p>
                    </div>

            }
            <div className={"clear"}></div>
            <div className={"container his_delete"}>
                <div>
                    <Button variant="warning"
                            onClick={() => setUpdateChild(!updateChild)}>{translations.update_child_record}</Button>
                </div>
                <div>
                    <Button variant="danger"
                            onClick={() => setRemoveChild(!removeChild)}>{translations.delete_child_record}</Button>
                </div>
            </div>


            {
                removeChild || removeHistory ?
                    deleteHistoryUI()
                    :
                    null
            }

            {
                updateHistory ?
                    updateHistoryUI()
                    :
                    null
            }

            {
                updateChild ?
                    updateChildUI()
                    :
                    null
            }
        </Container>

    );
};

export default History;