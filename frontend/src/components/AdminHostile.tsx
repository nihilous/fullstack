import React, {useState, useEffect, useRef, useCallback} from 'react';
import axios, {AxiosError} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { AdminHostileTranslations } from '../translation/AdminHostile';
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";
import { getToken, getDecodedToken } from "../util/jwtDecoder";
import { Container, Form} from "react-bootstrap";
import {setNoticePopUp} from "../redux/slice";
import jwtChecker from "../util/jwtChecker";
import GenerateNavi from "./Common/GenerateNavi";
import HostileUserInformation from "../types/AdminHostileType"
import HostileUserElems from "./AdminHostile/HostileUserElems"

const AdminHostile = () => {

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const navigagte = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;
    const admin = getDecodedToken()?.admin;

    const translations = AdminHostileTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];

    const [naviNum, setNaviNum] = useState<number>(0);
    const totalNavi = useRef<number>(0);
    const [where, setWhere] = useState<string>(`log`);
    const [keyword, setKeyword] = useState<string>(``);
    const [whitelist, setWhitelist] = useState<boolean>(false);
    const [ban, setBan] = useState<boolean>(false);

    const [users, setUsers] = useState<HostileUserInformation [] | null>(null);

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

            setUsers(response.data.data);

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

    if (users === null) {
        return <></>
    }

    return (
        <Container className="Hostile center_ui">
            <Container className={"main_top"}>
                <div className={"mt_elem"}>
                    <p className={"main_greeting"}>
                        {translations.admin_hostile}
                    </p>
                </div>
            </Container>

            {users && <HostileUserElems
                dispatch={dispatch}
                language={language}
                translations={translations}
                popupTranslations={popupTranslations}
                apiUrl={apiUrl}
                info={users}
                naviNum={naviNum}
                hostileUserDataFetch={hostileUserDataFetch}
            />}


            {<GenerateNavi
                total={totalNavi.current}
                naviNum={naviNum}
                setNaviNum={setNaviNum}
            />}


            <div className={"board_input_bar"}>
                <div className={"board_input_search"}>
                    <div>
                        <Form.Select value={where} onChange={(e) => setWhere(e.target.value)}>
                            <option value="log">{translations.log}</option>
                            <option value="ip_address">{translations.ip_address}</option>
                            <option value="updated_at">{translations.updated_at}</option>
                            <option value="created_at">{translations.created_at}</option>
                        </Form.Select>
                    </div>
                    <div>
                    <input type={"text"} value={keyword} onChange={(e) => setKeyword(e.target.value)}
                               placeholder={translations.input}></input>
                    </div>
                </div>
                <div className={"hostile_input_buttons"}>
                    <div className={"hostile_check_wrap"}>
                        <span>
                            <Form.Check
                                type="checkbox"
                                label={translations.banned}
                                checked={ban}
                                onChange={(e) => setBan(e.target.checked)}
                            />
                        </span>
                        <span>
                            <Form.Check
                                type="checkbox"
                                label={translations.whitelist}
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