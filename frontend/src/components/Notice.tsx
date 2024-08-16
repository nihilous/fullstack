import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HistoryTranslations } from '../translation/History';
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

    const givingNotice = (notices: NoticeProperty[] ) => {
        return notices.map((notice) => {

            const formatDate = (dateString: string, withT:boolean) => {
                if(withT){
                    const [year, month, day] = dateString.split('T')[0].split('-');
                    return { year, month, day };
                }else{
                    const [year, month, day] = dateString.split('-');
                    return { year, month, day };
                }

            };

            const birth = formatDate(notice.birthdate as string, true);
            const history = formatDate(notice.history_date !== null ? notice.history_date as string : "", true);

            const min_exp = notice.expected_vaccine_minimum_recommend_date !== undefined ? formatDate(notice.expected_vaccine_minimum_recommend_date,false) : null;
            const max_exp = notice.expected_vaccine_maximum_recommend_date !== undefined ? formatDate(notice.expected_vaccine_maximum_recommend_date,false) : null;


            return (

                <Container key={notice.id} className="child-info">
                    <h3>{`${translations.child_name} : ${notice.vaccine_name}`}</h3>
                    <Container>
                        <Container>
                            {`${translations.child_birthdate} : ${language === "FIN" ?
                                birth.day + " " + birth.month + " " + birth.year
                                :
                                birth.year + " " + birth.month + " " + birth.day }`}
                        </Container>
                        <Container>
                            {`접종회차 ${notice.vaccine_round }`}
                        </Container>
                        <Container>
                            {`${notice.vaccine_is_periodical as boolean ? "접종기간x" : "접종기간" }`}
                        </Container>
                        <Container>
                            {`${notice.vaccine_minimum_recommend_date} ${notice.vaccine_minimum_period_type === "M" ? "개월" : "년"}`}
                        </Container>

                        {notice.history_date === null && min_exp ?
                            <Container>
                                {`예상접종시기 : ${language === "FIN" ?
                                    min_exp.day + " " + min_exp.month + " " + min_exp.year
                                    :
                                    min_exp.year + " " + min_exp.month + " " + min_exp.day }`}
                            </Container>
                            :
                            <></>
                        }
                        {notice.vaccine_is_periodical as boolean ?
                            <>
                                <Container>
                                    {`${notice.vaccine_maximum_recommend_date} ${notice.vaccine_maximum_period_type === "M" ? "개월" : "년"}`}
                                </Container>

                                {notice.history_date === null && max_exp ?
                                    <Container>
                                        {`예상접종시기 : ${language === "FIN" ?
                                            max_exp.day + " " + max_exp.month + " " + max_exp.year
                                            :
                                            max_exp.year + " " + max_exp.month + " " + max_exp.day }`}
                                    </Container>
                                    :
                                    <></>
                                }
                            </>
                            :
                            <></>
                        }
                        {notice.history_date !== null ?
                            <Container>
                                {`접종일 : ${language === "FIN" ?
                                    history.day + " " + history.month + " " + history.year
                                    :
                                    history.year + " " + history.month + " " + history.day }`}
                            </Container>
                            :
                            <Button onClick={() => handleVaccination(notice.id)}>
                                접종일 등록
                            </Button>
                        }
                    </Container>
                </Container>

            );
        });
    };


    const handleVaccination = (vaccine_id:number | null) => {
        if(vaccination){
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
                logout(navigate);
            }
        }
    }

    const saveVaccinationUI = () => {
        return(
            <Container className={"popup_form"}>
                <Container>
                    <Form onSubmit={saveVaccinationInfo}>
                        <Form.Group controlId="registerChildBirthdate">
                            <Form.Label>{`백신접종일`}</Form.Label>
                            <Form.Control
                                type="date"
                                placeholder={`백신 접종일자`}
                                value={vaccinationDate}
                                onChange={(e) => setVaccinationDate(e.target.value)}
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit" className="mt-3">
                            {`저장`}
                        </Button>
                        <Button variant="secondary" className="mt-3 ms-2" onClick={() => handleVaccination(null)}>
                            {`취소`}
                        </Button>
                    </Form>
                </Container>
            </Container>
        )
    };

    if(vaccinationNotice.length === 0){
        return <></>
    }


    return (

            <Container className="Notice center_ui">
                <h1>접종권고</h1>
                {
                    givingNotice(vaccinationNotice)
                }
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