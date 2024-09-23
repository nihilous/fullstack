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

const AdminMain = () => {

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const navigagte = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;
    const admin = getDecodedToken()?.admin;

    const translations = AdminMainTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];

    interface JoinOnlyProperty {
        id: number;
        email: string;
        nickname: string;
        is_active: number;
        last_login: string;
        created_at: string;
        post_count: number;
        reply_count: number;
    }

    interface RegularProperty {
        id: number;
        email: string;
        nickname: string;
        is_active: number;
        last_login: string;
        created_at: string;
        post_count: number;
        reply_count: number;
        children: {
            detail_id: number;
            name: string;
            description: string;
            gender: number;
            birthdate: string;
            nationality: number;
            name_original: string;
        }[];
    }

    interface UserDataResponse {
        joinonly: JoinOnlyProperty[];
        regular: RegularProperty[];
    }

    const users = useRef<UserDataResponse | null>(null);
    const [visibleChildren, setVisibleChildren] = useState<{ [key: number]: boolean }>({});

    const [filter, setFilter] = useState<string>(``);
    const [filterNationality, setFilterNationality] = useState<number | null>(null);
    const [filterGender, setFilterGender] = useState<number | null>(null);
    const [filterActive, setFilterActive] = useState<number | null>(null);
    const [filteredUser, setFilteredUser] = useState<UserDataResponse | null>(null);

    useEffect(() => {
        const mainDataFetch = async () => {

            try {

                const response = await axios.get<UserDataResponse>(`${apiUrl}/admin/`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });

                users.current = response.data;
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
            mainDataFetch();
        }

    }, []);

    useEffect(() => {

    }, [users]);

    useEffect(() => {
        if (users.current) {
            const filteredJoinOnly = users.current.joinonly.filter((value) => {
                if (filterNationality === null && filterGender === null) {
                    const matchesFilter = filter
                        ? value.email?.toLowerCase().includes(filter.toLowerCase()) ||
                        value.nickname?.toLowerCase().includes(filter.toLowerCase()) ||
                        value.created_at?.toLowerCase().includes(filter.toLowerCase()) ||
                        value.last_login?.toLowerCase().includes(filter.toLowerCase())
                        : true;

                    const matchesActive = filterActive !== null
                        ? value.is_active === filterActive
                        : true;

                    return matchesFilter && matchesActive;
                }

                return false;
            });

            const filteredRegular = users.current.regular
                .map((value) => {
                    const matchesFilter = filter
                        ? value.email?.toLowerCase().includes(filter.toLowerCase()) ||
                        value.nickname?.toLowerCase().includes(filter.toLowerCase()) ||
                        value.created_at?.toLowerCase().includes(filter.toLowerCase()) ||
                        value.last_login?.toLowerCase().includes(filter.toLowerCase())
                        : true;

                    const matchesActive = filterActive !== null
                        ? value.is_active === filterActive
                        : true;

                    const filteredChildren = value.children.filter((child) => {
                        const matchesChildFilter = filter
                            ? child.name?.toLowerCase().includes(filter.toLowerCase()) ||
                            child.description?.toLowerCase().includes(filter.toLowerCase()) ||
                            child.birthdate?.toLowerCase().includes(filter.toLowerCase())
                            : true;

                        const matchesNationality = filterNationality
                            ? child.nationality === filterNationality
                            : true;

                        const matchesGender = filterGender !== null
                            ? child.gender === filterGender
                            : true;

                        return matchesChildFilter && matchesNationality && matchesGender;
                    });

                    return (filteredChildren.length > 0 || matchesFilter) && matchesActive
                        ? { ...value, children: filteredChildren }
                        : null;
                })
                .filter((value) => value !== null);

            setFilteredUser({
                joinonly: filteredJoinOnly,
                regular: filteredRegular as RegularProperty[],
            });
        }
    }, [filter, filterNationality, filterGender, filterActive]);

    const toggleChildrenVisibility = (userId: number) => {
        setVisibleChildren(prevState => ({
            ...prevState,
            [userId]: !prevState[userId]
        }));
    };

    const handleFilterNationality = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterNationality(parseInt(event.target.value,10) || null);
    };

    const handleFilterGender = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setFilterGender(value !== '' ? parseInt(value) : null);
    };

    const handleFilterActive = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setFilterActive(value !== '' ? parseInt(value) : null);
    };

    const userInformation = (info: UserDataResponse) => {

        const formatDate = (dateString: string, language: string) => {
            if(dateString === null){
                return translations.login_date_null;
            }
            const [year, month, day] = dateString.split('T')[0].split('-');
            if (language === "FIN") {
                return `${day} ${month} ${year}`;
            }
            return `${year} ${month} ${day}`;
        };

        return (
            <>
                <div className={"admin_main_category"}>
                    {`${translations.regular} ${info.regular.length} ${translations.count_people}`}
                </div>
                <div>
                    {info.regular.map(user => (


                        <div key={user.id} className={"am_parent"}>
                            <div className={"amp_info_wrap"}>
                                <div className={"amp_info"}>
                                    <div>
                                        <span>{translations.user_id}</span>
                                        <span>{user.id}</span>
                                    </div>
                                    <div>
                                        <span>{translations.email}</span>
                                        <span>{user.email}</span>
                                    </div>
                                    <div>
                                        <span>{translations.nickname}</span>
                                        <span>{user.nickname}</span>
                                    </div>
                                    <div>
                                        <span>{translations.join_date}</span>
                                        <span>{formatDate(user.created_at, language)}</span>
                                    </div>
                                    <div>
                                        <span>{translations.last_login}</span>
                                        <span>{formatDate(user.last_login, language)}</span>
                                    </div>
                                    <div>
                                        <span>{translations.is_hibernate}</span>
                                        <span>{user.is_active === 1 ? translations.active : translations.deactivated}</span>
                                    </div>
                                    <div>
                                        <span>{translations.registered_children}</span>
                                        <span>{`${user.children.length} ${translations.count_people}`}</span>
                                    </div>
                                    <div>
                                        <span>{translations.post_wrote}</span>
                                        <span>{user.post_count}</span>
                                    </div>
                                    <div>
                                        <span>{translations.reply_wrote}</span>
                                        <span>{user.reply_count}</span>
                                    </div>
                                </div>
                                <div className={"amp_button"}>
                                    <Button onClick={() => toggleChildrenVisibility(user.id)}>
                                        {visibleChildren[user.id] ? translations.fold : translations.watch}
                                    </Button>
                                </div>

                            </div>


                            <div className={`${visibleChildren[user.id] ? "am_children_wrap" : null}`}>
                                {visibleChildren[user.id] && user.children.map(child => {


                                    return (
                                        <div key={"child" + child.detail_id} className={"am_child"}>
                                            <div>
                                                <span>{translations.child_id}</span>
                                                <span>{child.detail_id}</span>
                                            </div>
                                            <div>
                                                <span>{translations.child_name}</span>
                                                <span>{child.name}</span>
                                            </div>
                                            <div>
                                                <span>{translations.child_birthdate}</span>
                                                <span>{formatDate(child.birthdate, language)}</span>
                                            </div>
                                            <div>
                                                <span>{translations.child_gender}</span>
                                                <span>{`${child.gender === 0 ? translations.boy : translations.girl}`}</span>
                                            </div>
                                            <div>
                                                <span>{translations.child_nationality}</span>
                                                <span>{child.name_original}</span>
                                            </div>
                                            <div>
                                                <span>{translations.child_description}</span>
                                                <span>{child.description}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    ))}
                </div>

                <div className={"admin_main_category"}>
                    {`${translations.join_only} ${info.joinonly.length} ${translations.count_people}`}
                </div>
                <div>
                    {info.joinonly.map(user => (
                        <div key={user.id} className={"am_parent"}>
                            <div className={"amp_info_wrap"}>
                                <div className={"amp_info join_only"}>
                                    <div>
                                        <span>{translations.user_id}</span>
                                        <span>{user.id}</span>
                                    </div>
                                    <div>
                                        <span>{translations.email}</span>
                                        <span>{user.email}</span>
                                    </div>
                                    <div>
                                        <span>{translations.nickname}</span>
                                        <span>{user.nickname}</span>
                                    </div>
                                    <div>
                                        <span>{translations.join_date}</span>
                                        <span>{formatDate(user.created_at, language)}</span>
                                    </div>
                                    <div>
                                        <span>{translations.last_login}</span>
                                        <span>{formatDate(user.last_login, language)}</span>
                                    </div>
                                    <div>
                                        <span>{translations.is_hibernate}</span>
                                        <span>{user.is_active === 1 ? translations.active : translations.deactivated}</span>
                                    </div>
                                    <div>
                                        <span>{translations.post_wrote}</span>
                                        <span>{user.post_count}</span>
                                    </div>
                                    <div>
                                        <span>{translations.reply_wrote}</span>
                                        <span>{user.reply_count}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </>
        );
    };

    if (users === null) {
        return <></>
    }

    return (
        <Container className="Main center_ui">
            <Container className={"main_top"}>
                <div className={"mt_elem"}>
                    <p className={"main_greeting"}>
                        {translations.admin_main}
                    </p>
                </div>

                <div className={"mt_elem filter_wrap"}>
                    <input type={"text"} value={filter} onChange={(e) => setFilter(e.target.value)}
                           placeholder={translations.filter}></input>
                    <div className={"select_wrap_3"}>
                        <select onChange={handleFilterNationality}>
                            <option value="">{translations.child_nationality}</option>
                            <option value={1}>{translations.finland}</option>
                            <option value={2}>{translations.korea}</option>
                            <option value={3}>{translations.usa}</option>
                        </select>
                        <select onChange={handleFilterGender}>
                            <option value="">{translations.child_gender}</option>
                            <option value="0">{translations.boy}</option>
                            <option value="1">{translations.girl}</option>

                        </select>
                        <select onChange={handleFilterActive}>
                        <option value="">{translations.is_hibernate}</option>
                            <option value="1">{translations.active}</option>
                            <option value="0">{translations.deactivated}</option>

                        </select>
                    </div>


                </div>
            </Container>
            {filteredUser && userInformation(filteredUser)}


        </Container>
    );
};

export default AdminMain;