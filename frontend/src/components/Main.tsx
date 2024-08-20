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

const Main = () => {

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const naviagte = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;
    const userDetailIds = getDecodedToken()?.userDetailIds;
    const translations = MainTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];

    interface UserDetailProperty {
        id: number;
        name: string | null;
        description: string | null;
        gender: number | null;
        birthdate: string | null;
        nationality: string | null;
        nickname: string;
    }

    interface UserDetailWithDetails {
        user_detail: true;
        record: { [key: string]: UserDetailProperty };
    }

    interface UserBasicProperty {
        id: number;
        email: string | null;
        nickname: string;
    }

    interface UserDetailWithoutDetails {
        user_detail: false;
        record: { [key: string]: UserBasicProperty };
    }

    type UserDetailResponse = UserDetailWithDetails | UserDetailWithoutDetails;

    const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);

    useEffect(() => {
        const mainDataFetch = async () => {

            try {

                const response = await axios.get<UserDetailResponse>(`${apiUrl}/user/${userId}`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });

                setUserDetail(response.data);
            } catch (error) {
                const axiosError = error as AxiosError<{ UserRes: number }>;
                if (axiosError.response) {
                    const UserRes = axiosError.response.data.UserRes;
                    let message = ``;
                    switch (UserRes) {
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

        if(userId === undefined) {
            naviagte("/");
        }else{
            mainDataFetch();
        }

    }, []);

    useEffect(() => {

    }, [userDetail]);

    const childInformation = (info: { [key: string]: UserDetailProperty }) => {
        return Object.keys(info).map(key => {
            const child = info[key];

            const formatDate = (dateString: string) => {
                const [year, month, day] = dateString.split('T')[0].split('-');
                return { year, month, day };
            };

            const formatNationality = (nationalityString: string) => {
                switch (nationalityString){
                    case "FIN":
                        return translations.finland;
                    case "KOR":
                        return translations.korea;
                }
            };

            const yyyy_mm_dd = formatDate(child.birthdate as string);
            return (

                    <div key={child.id} className="child-info main_info_elem">
                        <div className={"mie_info_wrapper"}>
                            <div className={"mie_info"}>
                                <span>{`${translations.child_name}`}</span>
                                <span>{`${child.name}`}</span>
                            </div>
                            <div className={"mie_info"}>
                                <span>{`${translations.child_birthdate}`}</span>
                                <span>{`${language === "FIN" ?
                                    yyyy_mm_dd.day + " " + yyyy_mm_dd.month + " " + yyyy_mm_dd.year
                                    :
                                    yyyy_mm_dd.year + " " + yyyy_mm_dd.month + " " + yyyy_mm_dd.day}`}</span>
                            </div>
                            <div className={"mie_info"}>
                                <span>{`${translations.child_gender}`}</span>
                                <span>{`${child.gender === 0 ? translations.boy : translations.girl}`}</span>

                            </div>
                            <div className={"mie_info"}>
                                <span>{`${translations.child_nationality}`}</span>
                                <span>{`${formatNationality(child.nationality as string)}`}</span>

                            </div>
                            <div className={"mie_info"}>
                                <span>{`${translations.child_description}`}</span>
                                <span>{`${child.description}`}</span>
                            </div>
                        </div>
                        <div className={"mie_button_wrapper"}>
                            <Button href={`/history/${child.id}`} className="btn btn-primary mie_button">
                                {`${translations.history}`}
                            </Button>
                            <Button href={`/notice/${child.id}`} className="btn btn-primary mie_button">
                                {`${translations.schedule}`}
                            </Button>
                            <div className={"clear"}></div>
                        </div>
                    </div>

            );
        });
    };

    if (userDetail === null) {
        return <></>
    }

    return (
        <Container className="Main center_ui">
            <Container className={"main_top"}>
                <div className={"mt_elem"}>
                    <p className={"main_greeting"}>{`${translations.welcome} ${userDetail.record[0].nickname}  ${

                        userDetail?.user_detail && userDetail?.record ?
                        translations.have_child + Object.keys(userDetail?.record).length + " " + ((userDetailIds?.length ?? 0) > 1 ? translations.child_datas : translations.child_data)
                            :
                            translations.no_child
                    }`}</p>
                </div>

                <div className={"mt_elem"}>
                    <input type={"text"} placeholder={"필터"}></input>
                </div>
            </Container>

            {
                userDetail?.user_detail ?

                    <Container className={"main_info_elem_wrapper"}>
                        {childInformation(userDetail.record)}
                    </Container>

                    :

                    <Container className={"main_rc_btn"}>
                        <Button href={`/register_child`}>
                            {translations.register}
                        </Button>
                    </Container>
            }

        </Container>
    );
};

export default Main;