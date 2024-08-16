import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useParams, useNavigate } from 'react-router-dom';
import { HistoryTranslations } from '../translation/History';
import {getToken, getDecodedToken} from "../util/jwtDecoder";
import {Button, Container} from "react-bootstrap";

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
    const userId = getDecodedToken()?.userId;
    const { id } = useParams();
    const user_detail_id = Number(id);
    const userDetailIds = getDecodedToken()?.userDetailIds;
    const translations = HistoryTranslations[language];
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [vaccinationHistory, setVaccinationHistory] = useState<HistoryProperty[]>([]);

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
                console.error('Error logging in:', error);
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

                <Container key={history.id} className="child-info">
                    <h3>{`접종 백신 명 : ${history.vaccine_name}`}</h3>
                    <Container>
                        <Container>
                            {`접종일 : ${language === "FIN" ?
                                yyyy_mm_dd.day + " " + yyyy_mm_dd.month + " " + yyyy_mm_dd.year
                                :
                                yyyy_mm_dd.year + " " + yyyy_mm_dd.month + " " + yyyy_mm_dd.day }`}
                        </Container>
                        <Container>
                            {`접종회차 ${history.vaccine_round }`}
                        </Container>


                    </Container>
                </Container>

            );
        });
    };

    if(vaccinationHistory.length === 0){
        return <></>
    }

    return (

            <Container className="History">
                <h1>접종기록</h1>
                {
                    vaccinationHistory.length !== 0 ?
                        showingHistory(vaccinationHistory)
                        :
                        <></>

                }
            </Container>

    );
};

export default History;