import React, { useState, useEffect } from 'react';
import axios, {AxiosError} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { useNavigate, Link } from 'react-router-dom';
import { MainTranslations } from '../translation/Main';
import { getToken, getDecodedToken } from "../util/jwtDecoder";
import {Button, Container} from "react-bootstrap";
import {setNoticePopUp} from "../redux/slice";
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";

const AdminMain = () => {

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const navigagte = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;

    const translations = MainTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];

    interface JoinOnlyProperty {
        id: number;
        email: string | null;
        nickname: string;
    }

    interface Joinonly {
        user_detail: false;
        joinonly: { [key: string]: JoinOnlyProperty };
    }

    interface ChildrenProperty {
        detail_id: number;
        name: string | null;
        description: string | null;
        gender: number | null;
        birthdate: string | null;
        nationality: string | null;
    }

    interface RegularProperty {
        id: number,
        email: string,
        nickname: string,
        children: [ChildrenProperty]
    }

    interface Regular {
        user_detail: true;
        regular: { [key: string]: RegularProperty };
    }



    type UserDataResponse = Joinonly | Regular;

    const [users, setUsers] = useState<UserDataResponse | null>(null);

    useEffect(() => {
        const mainDataFetch = async () => {

            try {

                const response = await axios.get<UserDataResponse>(`${apiUrl}/user/`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });

                setUsers(response.data);
                console.log(response.data);
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
                            message = "";
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

        if(userId === undefined) {
            navigagte("/");
        }else{
            mainDataFetch();
        }

    }, []);

    useEffect(() => {

    }, [users]);

    if (users === null) {
        return <></>
    }

    console.log(users);

    return (
        <Container className="Main center_ui">
            <Container className={"main_top"}>
                <div className={"mt_elem"}>
                    <p className={"main_greeting"}>
                        관리자 메인
                    </p>
                </div>

                <div className={"mt_elem"}>
                    <input type={"text"} placeholder={"필터"}></input>
                </div>
            </Container>


        </Container>
    );
};

export default AdminMain;