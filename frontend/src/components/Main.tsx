import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate, Link } from 'react-router-dom';
import { MainTranslations } from '../translation/Main';
import { getToken, getDecodedToken } from "../util/jwtDecoder";
import {Container} from "react-bootstrap";

const Main = () => {

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const naviagte = useNavigate();
    const userId = getDecodedToken()?.userId;
    const userDetailIds = getDecodedToken()?.userDetailIds;
    const translations = MainTranslations[language];

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
                console.error('Error logging in:', error);
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

                    <Container key={child.id} className="child-info">
                        <h3>{`${translations.child_name} : ${child.name}`}</h3>
                        <Container>
                            <Container>
                                {`${translations.child_birthdate} : ${language === "FIN" ?
                                    yyyy_mm_dd.day + " " + yyyy_mm_dd.month + " " + yyyy_mm_dd.year
                                    :
                                    yyyy_mm_dd.year + " " + yyyy_mm_dd.month + " " + yyyy_mm_dd.day }`}
                            </Container>
                            <Container>
                                {`${translations.child_gender} : ${child.gender === 0 ? translations.boy : translations.girl }`}
                            </Container>
                            <Container>
                                {`${translations.child_nationality} : ${formatNationality(child.nationality as string)}`}
                            </Container>
                            <Container>
                                {`${translations.child_description} : ${child.description}`}
                            </Container>
                        </Container>


                        <Container>
                            <Link  to={`/history/${child.id}`} className="child-link">
                                See Vaccination History
                            </Link>
                        </Container>
                        <Container>
                            <Link  to={`/notice/${child.id}`} className="child-link">
                                See Vaccination Recommendations
                            </Link>
                        </Container>

                    </Container>

            );
        });
    };

    if(userDetail === null){
        return <></>
    }

    return (
        <Container className="Main center_ui">
            <div>
                <h1>{`${translations.welcome} ${ userDetail.record[0].nickname }  ${
                    
                    userDetail?.user_detail && userDetail?.record ?
                        translations.have_child + Object.keys(userDetail?.record).length + " " + ((userDetailIds?.length ?? 0) > 1 ? translations.child_datas : translations.child_data)
                        :
                        translations.no_child
                }`}</h1>
            </div>

            {
                userDetail?.user_detail ?

                    <Container>
                        {childInformation(userDetail.record)}
                    </Container>

                    :

                    <Container>
                        <Container>
                            <Link to={`/register_child`}>
                                {translations.register}
                            </Link>
                        </Container>

                    </Container>
            }

        </Container>
    );
};

export default Main;