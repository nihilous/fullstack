import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HistoryTranslations } from '../translation/Notice';
import { getToken, getDecodedToken } from "../util/jwtDecoder";
import {Button, Container, Form} from "react-bootstrap";
import logout from "../util/logout";
const Notice = () => {

    interface NoticeProperty {
        id : number
        birthdate : string
        vaccine_name : string
        vaccine_is_periodical : boolean
        vaccine_minimum_period_type : string
        vaccine_minimum_recommend_date : string
        vaccine_maximum_period_type : string
        vaccine_maximum_recommend_date : string
        vaccine_round : number
        expected_vaccine_minimum_recommend_date: string
        expected_vaccine_maximum_recommend_date: string
        history_date : string | null
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
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [vaccinationNotice, setVaccinationNotice] = useState<NoticeProperty[]>([]);
    const [vaccination, setVaccination] = useState<boolean>(false);
    const [vaccineId, setVaccineId] = useState<number | null>(null);
    const [vaccinationDate, setVaccinationDate] = useState<string>(``);

    userDetailIds?.map((child_id: number) => {
        if(child_id === user_detail_id && !isAuthorized){
            setIsAuthorized(true);
        }

    })

    const noticeDataFetch = async () => {

        try {

            const response = await axios.get<NoticeProperty[]>(`${apiUrl}/notice/${userId}/${id}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setVaccinationNotice(response.data);
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    useEffect(() => {

        if(userId === undefined){
            navigate("/")
        }

        if(!isAuthorized){
            return
        }
        noticeDataFetch();

    }, []);

    const formatDate = (dateString: string, withT:boolean) => {
        if(withT){
            const [year, month, day] = dateString.split('T')[0].split('-');
            return { year, month, day };
        }else{
            const [year, month, day] = dateString.split('-');
            return { year, month, day };
        }

    };

    const givingNotice = (notices: NoticeProperty[] ) => {
        return notices.map((notice) => {




            const history = formatDate(notice.history_date !== null ? notice.history_date as string : "", true);

            const min_exp = notice.expected_vaccine_minimum_recommend_date !== undefined ? formatDate(notice.expected_vaccine_minimum_recommend_date,false) : null;
            const max_exp = notice.expected_vaccine_maximum_recommend_date !== undefined ? formatDate(notice.expected_vaccine_maximum_recommend_date,false) : null;


            return (

                <Container key={notice.id} className="child-info notice_info_elem">
                    <div className={"nie_infos"}>
                        <div className={"nie_info nie_title"}>
                            {`${translations.name}`}
                        </div>
                        <div className={"nie_info nie_vaccine_name"}>
                            {`${notice.vaccine_name}`}
                        </div>

                        <div className={"nie_info"}>
                            <div className={"nie_title"}>{`${translations.after_birth}`}</div>
                            <div className={"nie_info after_birth"}>
                                <span>{`${notice.vaccine_minimum_recommend_date} ${notice.vaccine_minimum_period_type === "M" ? translations.month : translations.year}`}</span>
                                {notice.vaccine_is_periodical as boolean ?
                                    <>
                                        <span>-</span>
                                        <span>{`${notice.vaccine_maximum_recommend_date} ${notice.vaccine_maximum_period_type === "M" ? translations.month : translations.year}`}</span>
                                    </>
                                    :
                                    <></>
                                }
                            </div>
                        </div>

                        <div className={"nie_info round"}>
                            <div className={"nie_title"}>
                                {`${translations.round}`}
                            </div>
                            <div>
                                {`${notice.vaccine_round}`}
                            </div>
                        </div>

                        {notice.history_date === null && min_exp ?
                            <div className={"nie_info"}>
                                <div className={"nie_title"}>{`${translations.scheduled_to}`}</div>
                                <div className={"schedule"}>
                                <span>{`${language === "FIN" ?
                                    min_exp.day + " " + min_exp.month + " " + min_exp.year
                                    :
                                    min_exp.year + " " + min_exp.month + " " + min_exp.day}`}
                                </span>

                                    {notice.vaccine_is_periodical as boolean ?
                                        <>
                                            <span>-</span>

                                            {notice.history_date === null && max_exp ?

                                                <span>{`${language === "FIN" ?
                                                    max_exp.day + " " + max_exp.month + " " + max_exp.year
                                                    :
                                                    max_exp.year + " " + max_exp.month + " " + max_exp.day}`}
                                            </span>
                                                :
                                                <></>
                                            }
                                        </>
                                        :
                                        <></>
                                    }
                                </div>

                            </div>
                            :
                            <></>
                        }

                        {notice.history_date !== null ?
                            <div className={"nie_info vaccinated_date"}>
                                <div className={"nie_title"}>{`${translations.vaccination_date}`}</div>
                                <div>{`${language === "FIN" ?
                                    history.day + " " + history.month + " " + history.year
                                    :
                                    history.year + " " + history.month + " " + history.day}`}</div>

                            </div>
                            :
                            <></>
                        }
                    </div>


                        {notice.history_date !== null ?
                            <>
                            </>
                            :
                            <div className={`notice_reg_btn`}>
                                <Button onClick={() => handleVaccination(notice.id)}>
                                    {`${translations.register}`}
                                </Button>

                            </div>
                        }
                            </Container>

            );
        });
    };


    const handleVaccination = (vaccine_id: number | null) => {
        if (vaccination) {
            setVaccineId(null);
            setVaccinationDate(``);
        }else{
            setVaccineId(vaccine_id);
        }

        setVaccination(!vaccination);
    };

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
            }

            handleVaccination(null)
            return response.data;

        } catch (error) {
            console.error('Error saving vaccination history:', error);
            const axiosError = error as AxiosError;

            if (axiosError.response?.status === 403) {
                logout(navigate, dispatch);
            }
        }
    }

    const saveVaccinationUI = () => {
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

    if(vaccinationNotice.length === 0){
        return <></>
    }

    const birth = formatDate(vaccinationNotice[0]?.birthdate as string, true);

    return (

        <Container className="Notice center_ui">
            <div className={"main_top"}>
                <p className={`notice_title`}>접종권고</p>
            </div>
            <div className={"main_top"}>
                <p className={`notice_title`}>{`${translations.child_birthdate} : ${language === "FIN" ?
                    birth.day + " " + birth.month + " " + birth.year
                    :
                    birth.year + " " + birth.month + " " + birth.day}`}</p>
            </div>

            {
                givingNotice(vaccinationNotice)
            }
            <div className={"clear"}></div>
            {
                vaccination ?
                    saveVaccinationUI()
                    :
                    <></>
            }

        </Container>

    );
};

export default Notice;