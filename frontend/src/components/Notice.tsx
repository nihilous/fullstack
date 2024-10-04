import React, { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { useParams, useNavigate } from 'react-router-dom';
import { NoticeTranslations } from '../translation/Notice';
import { getToken, getDecodedToken } from "../util/jwtDecoder";
import {Container} from "react-bootstrap";
import logout from "../util/logout";
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";
import {setNoticePopUp} from "../redux/slice";
import {formatDate, formatDateWithoutT} from "../util/formatDate";
import NoticeProperty from "../types/NoticeType";
import GivingNotice from "./Notice/GivingNotice";
import SaveVaccinationUI from "./Notice/SaveVaccinationUI"

const Notice = () => {



    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;
    const { id } = useParams();
    const user_detail_id = Number(id);
    const userDetailIds = getDecodedToken()?.userDetailIds;
    const translations = NoticeTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [vaccinationNotice, setVaccinationNotice] = useState<NoticeProperty[]>([]);
    const [vaccination, setVaccination] = useState<boolean>(false);
    const [vaccineId, setVaccineId] = useState<number | null>(null);
    const [vaccinationDate, setVaccinationDate] = useState<string>(``);
    const isAuthorizedRef = useRef(false);

    userDetailIds?.map((child_id: number) => {
        if(child_id === user_detail_id && !isAuthorized){
            isAuthorizedRef.current = true;
            setIsAuthorized(true);
        }
    })

    const authSuccess = isAuthorizedRef.current

    if(!authSuccess){

        const message = popupTranslations.noAuthority;
        dispatch(setNoticePopUp({
            on: true,
            is_error: true,
            message: message
        }));

        setTimeout(() => {
            logout(navigate, dispatch, false);
        }, 3000);

    }

    const noticeDataFetch = async () => {

        try {

            const response = await axios.get<NoticeProperty[]>(`${apiUrl}/notice/${userId}/${id}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });
            setVaccinationNotice(response.data);
        } catch (error) {

            const axiosError = error as AxiosError<{ noticeRes: number }>;
            if (axiosError.response) {
                const NoticeRes = axiosError.response.data.noticeRes;
                let message = ``;
                switch (NoticeRes) {
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

    useEffect(() => {

        if(userId === undefined){
            navigate("/")
        }

        if(!isAuthorized){
            return
        }
        noticeDataFetch();

    }, []);

    const handleVaccination = (vaccine_id: number | null) => {
        if (vaccination) {
            setVaccineId(null);
            setVaccinationDate(``);
        }else{
            setVaccineId(vaccine_id);
        }

        setVaccination(!vaccination);
    };

    if(vaccinationNotice.length === 0){
        return <></>
    }

    const birth = formatDate(vaccinationNotice[0]?.birthdate as string, language);

    return (

        <Container className="Notice center_ui">
            <div className={"main_top"}>
                <p className={`notice_title`}>{translations.notice_title}</p>
            </div>
            <div className={"main_top"}>
                <p className={`notice_title`}>{`${translations.child_birthdate} : ${birth}`}</p>
            </div>

            {
                <GivingNotice
                    language={language}
                    translations={translations}
                    notices = {vaccinationNotice}
                    handleVaccination={handleVaccination}
                />
            }
            <div className={"clear"}></div>
            {
                vaccination ?
                    <SaveVaccinationUI
                        dispatch={dispatch}
                        navigate={navigate}
                        apiUrl={apiUrl}
                        userId={userId as number}
                        translations={translations}
                        popupTranslations={popupTranslations}
                        id={id as string}
                        vaccineId = {vaccineId as number}
                        noticeDataFetch={noticeDataFetch}
                        handleVaccination={handleVaccination}
                        vaccinationDate={vaccinationDate as string}
                        setVaccinationDate={setVaccinationDate}
                    />
                    :
                    <></>
            }

        </Container>

    );
};

export default Notice;