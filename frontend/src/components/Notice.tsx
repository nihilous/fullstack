import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HistoryTranslations } from '../translation/History';
import { token, decodedToken } from "../util/jwtDecoder";
import {Button, Container} from "react-bootstrap";

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
    const userId = decodedToken?.userId;
    const { id } = useParams();
    const user_detail_id = Number(id);
    const userDetailIds = decodedToken?.userDetailIds;
    const translations = HistoryTranslations[language];
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [vaccinationNotice, setVaccinationNotice] = useState<NoticeProperty[]>([]);




    userDetailIds?.map((child_id: number) => {
        if(child_id === user_detail_id && !isAuthorized){
            setIsAuthorized(true);
        }

    })


    useEffect(() => {
        const noticeDataFetch = async () => {

            try {

                const response = await axios.get<NoticeProperty[]>(`${apiUrl}/notice/${userId}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setVaccinationNotice(response.data);
            } catch (error) {
                console.error('Error logging in:', error);
            }
        };

        if(!isAuthorized){
            return
        }
        noticeDataFetch();

    }, []);


    const givingNotice = (notices: NoticeProperty[] ) => {
        return notices.map((notice) => {

            const formatDate = (dateString: string) => {
                const [year, month, day] = dateString.split('T')[0].split('-');
                return { year, month, day };
            };

            const yyyy_mm_dd = formatDate(notice.birthdate as string);
            return (

                <Container key={notice.id} className="child-info">
                    <h3>{`${translations.child_name} : ${notice.vaccine_name}`}</h3>
                    <Container>
                        <Container>
                            {`${translations.child_birthdate} : ${language === "FIN" ?
                                yyyy_mm_dd.day + " " + yyyy_mm_dd.month + " " + yyyy_mm_dd.year
                                :
                                yyyy_mm_dd.year + " " + yyyy_mm_dd.month + " " + yyyy_mm_dd.day }`}
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

                        {notice.history_date === null ?
                            <Container>
                                {`예상접종시기 ${notice.expected_vaccine_minimum_recommend_date}`}
                            </Container>
                            :
                            <></>
                        }
                        {notice.vaccine_is_periodical as boolean ?
                            <>
                                <Container>
                                    {`${notice.vaccine_maximum_recommend_date} ${notice.vaccine_maximum_period_type === "M" ? "개월" : "년"}`}
                                </Container>

                                {notice.history_date === null ?
                                    <Container>
                                        {`예상접종시기 ${notice.expected_vaccine_maximum_recommend_date}`}
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
                                {`접종일 ${notice.history_date}`}
                            </Container>
                            :
                            <Button>
                                접종일 등록
                            </Button>
                        }

                    </Container>
                </Container>

            );
        });
    };

    if(vaccinationNotice.length === 0){
        return <></>
    }



    return (

            <Container className="Notice">
                <h1>접종권고</h1>
                {
                    vaccinationNotice.length !== 0 ?
                        givingNotice(vaccinationNotice)
                        :
                        <></>
                }
            </Container>

    );
};

export default Notice;