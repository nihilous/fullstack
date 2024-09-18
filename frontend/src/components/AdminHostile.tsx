import React, {useState, useEffect, useRef} from 'react';
import axios, {AxiosError} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { AdminMainTranslations } from '../translation/AdminMain';
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";
import { getToken, getDecodedToken } from "../util/jwtDecoder";
import {Button, Container} from "react-bootstrap";
import {setNoticePopUp} from "../redux/slice";
import jwtChecker from "../util/jwtChecker";

const AdminHostile = () => {

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const navigagte = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;
    const admin = getDecodedToken()?.admin;

    const translations = AdminMainTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];

    interface HostileUserInformation {
        id: number;
        ip_address: string;
        attack_count: number;
        is_banned: boolean;
        log: string;
        created_at: string;
        updated_at: string;
    }

    const informations = useRef<HostileUserInformation [] | null>(null);
    const [filteredUser, setFilteredUser] = useState<HostileUserInformation [] | null>(null);

    useEffect(() => {
        const hostileUserDataFetch = async () => {

            try {

                const response = await axios.get<HostileUserInformation []>(`${apiUrl}/admin/hostile`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });

                informations.current = response.data;
                setFilteredUser(response.data);

            } catch (error) {
                const axiosError = error as AxiosError<{ UserRes: number }>;
                if (axiosError.response) {
                    const UserRes = axiosError.response.data.UserRes;
                    let message = ``;
                    switch (UserRes) {
                        case 1:
                            message = "";
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

        if(userId === undefined){
            navigagte("/");
        }else if(!admin){
            navigagte("/main");
        }
        else{
            hostileUserDataFetch();
        }

    }, []);

    useEffect(() => {

    }, [informations]);

    const userInformation = (info: HostileUserInformation[]) => {

        return info.map((data, userIndex) => {
            const parsedLogs = JSON.parse(data.log);

            return (
                <div key={data.id} style={{border: "1px solid black", marginBottom: "20px", padding: "20px"}} >
                    <div style={{display: "flex", alignContent: "center"}}>
                        <span>id</span>
                        <span>{data.id}</span>
                    </div>
                    <div>
                        <span>ip</span>
                        <span>{data.ip_address}</span>
                    </div>
                    <div>
                        <span>count</span>
                        <span>{data.attack_count}</span>
                    </div>
                    <div>
                        <span>banned</span>
                        <span>{data.is_banned ? "true" : "false"}</span>
                    </div>
                    <div>
                        <span>update</span>
                        <span>{data.updated_at}</span>
                    </div>
                    <div>
                        <span>create</span>
                        <span>{data.created_at}</span>
                    </div>
                    <div>
                        {parsedLogs.map((logEntry: string, logIndex: number) => {
                            const parsedLogEntry = JSON.parse(logEntry);

                            return (
                                <div key={logIndex} style={{ border: "1px solid black", padding: "20px", marginTop: "20px"}} >

                                    {Object.entries(parsedLogEntry).map(([key, value], entryIndex) => (
                                        <div key={entryIndex}>

                                            <span>{key}</span>
                                            <span>{`${(value)}`}</span>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        });
    };

    informations.current && userInformation(informations.current);

    if (informations === null) {
        return <></>
    }

    return (
        <Container className="Hostile center_ui">
            <Container className={"main_top"}>
                <div className={"mt_elem"}>
                    <p className={"main_greeting"}>
                        {translations.admin_main}
                    </p>
                </div>
            </Container>

            {informations.current && userInformation(informations.current)}

        </Container>
    );
};

export default AdminHostile;