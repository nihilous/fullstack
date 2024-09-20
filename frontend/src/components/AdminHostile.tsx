import React, {useState, useEffect, useRef, useCallback} from 'react';
import axios, {AxiosError} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { AdminMainTranslations } from '../translation/AdminMain';
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";
import { getToken, getDecodedToken } from "../util/jwtDecoder";
import {Button, Container, Form} from "react-bootstrap";
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

    const [naviNum, setNaviNum] = useState<number>(0);
    const totalNavi = useRef<number>(0);
    const [where, setWhere] = useState<string>(`log`);
    const [keyword, setKeyword] = useState<string>(``);
    const [whitelist, setWhitelist] = useState<boolean>(false);
    const [ban, setBan] = useState<boolean>(false);

    interface HostileUserInformation {
        id: number;
        ip_address: string;
        attack_count: number;
        is_banned: boolean;
        is_whitelist: boolean;
        log: string;
        created_at: string;
        updated_at: string;
    }

    const informations = useRef<HostileUserInformation [] | null>(null);
    const [filteredUser, setFilteredUser] = useState<HostileUserInformation [] | null>(null);

    const hostileUserDataFetch = useCallback(async (page:number) => {

        try {

            const response = await axios.get(`${apiUrl}/admin/hostile/${page}`, {
                headers: { Authorization: `Bearer ${getToken()}`},
                params: {
                    where: where,
                    keyword: keyword,
                    ban: ban,
                    whitelist: whitelist
                }
            });

            totalNavi.current = response.data.suspects;
            if(page === 0)
            {
                setNaviNum(page);
            }

            if(page + 1 > totalNavi.current){
                setNaviNum(0);
            }

            informations.current = response.data.data;
            setFilteredUser(response.data.data);

        } catch (error) {
            const axiosError = error as AxiosError<{ adminHostileRes: number }>;
            if (axiosError.response) {
                const AdminHostileRes = axiosError.response.data.adminHostileRes;
                let message = ``;
                switch (AdminHostileRes) {
                    case 1:
                        message = popupTranslations.noAuthority;
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
    },[where, keyword, ban, whitelist]);

    useEffect(() => {

        if(userId === undefined){
            navigagte("/");
        }else if(!admin){
            navigagte("/main");
        }
        else{
            hostileUserDataFetch(naviNum);
        }

    }, [naviNum, hostileUserDataFetch]);

    const formatDate = (dateString: string, language: string) => {

        const [year, month, day] = dateString.includes("T") ? dateString.split('T')[0].split('-') : dateString.split(' ')[0].split('-');
        if (language === "FIN") {
            return `${day} ${month} ${year}`;
        }
        return `${year} ${month} ${day}`;

    };

    const generateNavi = (total: number, recent: number) => {
        const buttons = [];
        const itemsPerPage = 5;

        const currentSet = Math.floor(recent / itemsPerPage);

        const start = currentSet * itemsPerPage;
        const end = Math.min(start + itemsPerPage, total);

        for (let i = start; i < end; i++) {
            buttons.push(
                <span className={`nav_target ${i === naviNum ? "now_nav" : ""}`} key={i} onClick={() => setNaviNum(i)}>
                    {i + 1}
                </span>
            );
        }

        return <div>{buttons}</div>;
    };

    const whiteOrBanUpdate = async (id:number, column:string) => {

        try {

            const response = await axios.put<HostileUserInformation []>(`${apiUrl}/admin/hostile/${column}`, {"id": id},{
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if(response.status === 201) {
                hostileUserDataFetch(naviNum);
            }


        } catch (error) {
            const axiosError = error as AxiosError<{ adminUpdateRes: number }>;
            if (axiosError.response) {
                const AdminUpdateRes = axiosError.response.data.adminUpdateRes;
                let message = ``;
                switch (AdminUpdateRes) {
                    case 1:
                        message = popupTranslations.noAuthority
                        break;
                    case 2:
                        message = popupTranslations.injection
                        break;
                    case 3:
                        message = popupTranslations.AdminHostileZeroUpdate
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

    const userInformation = (info: HostileUserInformation[]) => {

        return info.map((data, userIndex) => {
            const parsedLogs = JSON.parse(data.log);

            return (
                <div key={data.id} className={`hostile_elem`}>
                    <div className={`info_div`}>
                        <span>index</span>
                        <span>{data.id}</span>
                    </div>
                    <div className={`info_div`}>
                        <span>ip</span>
                        <span>{data.ip_address}</span>
                    </div>
                    <div className={`info_div`}>
                        <span>attack count</span>
                        <span>{data.attack_count}</span>
                    </div>
                    <div className={`info_div`}>
                        <span>banned</span>
                        <span>{data.is_banned ? "true" : "false"}</span>
                    </div>
                    <div className={`info_div`}>
                        <span>whitelist</span>
                        <span>{data.is_whitelist ? "true" : "false"}</span>
                    </div>
                    <div className={`info_div`}>
                        <span>update</span>
                        <span>{formatDate(data.updated_at, language)}</span>
                    </div>
                    <div className={`info_div`}>
                        <span>create</span>
                        <span>{formatDate(data.created_at, language)}</span>
                    </div>
                    <div className={`info_div`}>
                        <span>
                            <Button onClick={() => whiteOrBanUpdate(data.id, "ban")}>
                                ban
                            </Button>
                        </span>
                        <span>
                            <Button onClick={() => whiteOrBanUpdate(data.id, "whitelist")}>
                                whitelist
                            </Button>
                        </span>
                    </div>
                    <div>
                        {parsedLogs.map((logEntry: string, logIndex: number) => {
                            const parsedLogEntry = JSON.parse(logEntry);

                            return (
                                <div key={logIndex} className={`log_elem`}>
                                    <div className={`log_div`}>

                                        <span>{`key`}</span>
                                        <span>{`value`}</span>
                                    </div>
                                    {Object.entries(parsedLogEntry).map(([key, value], entryIndex) => (
                                        <div className={`log_div`} key={entryIndex}>

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


            <div className="board_navs">
                <div className={"nav_prev"}>
                    {totalNavi.current > 4 && naviNum > 4 ?
                        <span onClick={() => setNaviNum(Math.max(naviNum - 1 - (naviNum % 5), 0))}>
                            {"<"}
                        </span>
                        :
                        null
                    }
                </div>

                {generateNavi(totalNavi.current, naviNum)}
                <div className={"nav_next"}>
                    {totalNavi.current > 4 && naviNum < totalNavi.current - totalNavi.current % 5 ?
                        <span
                            onClick={() => setNaviNum(Math.min(naviNum + (5 - (naviNum % 5)), totalNavi.current - 1))}>
                            {">"}
                        </span>
                        :
                        null
                    }
                </div>
            </div>

            <div className={"board_input_bar"}>
                <div className={"board_input_search"}>
                    <div>
                        <Form.Select value={where} onChange={(e) => setWhere(e.target.value)}>
                            <option value="log">{"log"}</option>
                            <option value="ip_address">{"ip_address"}</option>
                            <option value="created_at">{"created_at"}</option>
                            <option value="updated_at">{"updated_at"}</option>
                        </Form.Select>
                    </div>
                    <div>
                        <input type={"text"} value={keyword} onChange={(e) => setKeyword(e.target.value)}
                               placeholder={"입력"}></input>
                    </div>
                </div>
                <div className={"hostile_input_buttons"}>
                    <div>
                        <Button variant="primary" type="submit" className="mt-3" onClick={() => hostileUserDataFetch(0)}>
                            {"찾기"}
                        </Button>
                    </div>
                    <div className={"hostile_check_wrap"}>
                        <span>
                            <Form.Check
                                type="checkbox"
                                label={`ban`}
                                checked={ban}
                                onChange={(e) => setBan(e.target.checked)}
                            />
                        </span>
                        <span>
                            <Form.Check
                                type="checkbox"
                                label={`whitelist`}
                                checked={whitelist}
                                onChange={(e) => setWhitelist(e.target.checked)}
                            />
                        </span>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default AdminHostile;