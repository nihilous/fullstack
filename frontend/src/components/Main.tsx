import React, {useState, useEffect, useRef} from 'react';
import axios, {AxiosError} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { MainTranslations } from '../translation/Main';
import { getToken, getDecodedToken } from "../util/jwtDecoder";
import {Button, Container} from "react-bootstrap";
import { setNoticePopUp} from "../redux/slice";
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";

const Main = () => {

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const navigagte = useNavigate();
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

    const userDetail = useRef<UserDetailResponse | null>(null);
    const [filter, setFilter] = useState<string>(``);
    const [filterNationality, setFilterNationality] = useState<string | null>(null);
    const [filterGender, setFilterGender] = useState<number | null>(null);
    const [filteredUser, setFilteredUser] = useState<UserDetailProperty[]>([]);

    useEffect(() => {
        const mainDataFetch = async () => {

            try {

                const response = await axios.get<UserDetailResponse>(`${apiUrl}/user/${userId}`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });

                userDetail.current = response.data;
                if(response.data.user_detail){

                    setFilteredUser(Object.values(response.data.record));
                }
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
            navigagte("/");
        }else{
            mainDataFetch();
        }

    }, []);

    useEffect(() => {

    }, [userDetail]);

    useEffect(() => {

        if (userDetail.current?.user_detail) {

            const filteredRecords = Object.values(userDetail.current.record).filter((value) => {
                const matchesFilter = filter
                    ? value.name?.toLowerCase().includes(filter.toLowerCase()) ||
                    value.description?.toLowerCase().includes(filter.toLowerCase()) ||
                    value.birthdate?.toLowerCase().includes(filter.toLowerCase())
                    : true;

                const matchesNationality = filterNationality
                    ? value.nationality?.toLowerCase() === filterNationality.toLowerCase()
                    : true;

                const matchesGender = filterGender !== null
                    ? value.gender === filterGender
                    : true;

                return matchesFilter && matchesNationality && matchesGender;
            });

            setFilteredUser(filteredRecords);

        } else {

            setFilteredUser(filteredUser);
        }
    }, [filter, filterGender, filterNationality]);


    const handleFilterNationality = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterNationality(event.target.value || null);
    };

    const handleFilterGender = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setFilterGender(value !== '' ? parseInt(value) : null);
    };



    const childInformation = (info: UserDetailProperty[]) => {
        return info.map(child => {

            const formatDate = (dateString: string) => {
                const [year, month, day] = dateString.split('T')[0].split('-');
                return { year, month, day };
            };

            const formatNationality = (nationalityString: string) => {
                switch (nationalityString) {
                    case "FIN":
                        return translations.finland;
                    case "KOR":
                        return translations.korea;
                    default:
                        return nationalityString;
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

    if (userDetail.current === null) {
        return <></>
    }

    return (
        <Container className="Main center_ui">
            <Container className={"main_top"}>
                <div className={"mt_elem"}>
                    <p className={"main_greeting"}>{`${translations.welcome} ${userDetail.current?.record[0]?.nickname ?? ''}  ${
                        userDetail.current?.user_detail
                            ? translations.have_child + Object.keys(userDetail.current.record).length + " " + ((userDetailIds?.length ?? 0) > 1 ? translations.child_datas : translations.child_data)
                            : translations.no_child
                    }`}
                    </p>
                </div>

                <div className={"mt_elem filter_wrap"}>
                    <input type={"text"} value={filter} onChange={(e) => setFilter(e.target.value)}
                           placeholder={translations.filter}></input>
                    <div className={"select_wrap"}>
                        <select onChange={handleFilterNationality}>
                            <option value="">{translations.child_nationality}</option>
                            <option value="FIN">{translations.finland}</option>
                            <option value="KOR">{translations.korea}</option>
                        </select>
                        <select onChange={handleFilterGender}>
                            <option value="">{translations.child_gender}</option>
                            <option value="0">{translations.boy}</option>
                            <option value="1">{translations.girl}</option>
                        </select>
                    </div>


                </div>
            </Container>

            {
                userDetail?.current.user_detail ?

                    <Container className={"main_info_elem_wrapper"}>
                        {childInformation(filteredUser)}
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