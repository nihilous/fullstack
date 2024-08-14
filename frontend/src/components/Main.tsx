import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate, Link } from 'react-router-dom';
import { MainTranslations } from '../translation/Main';
import { token, decodedToken } from "../util/jwtDecoder";
import {Container} from "react-bootstrap";

const Main = () => {

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const userId = decodedToken?.userId;
    const userDetailIds = decodedToken?.userDetailIds;
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
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUserDetail(response.data);
            } catch (error) {
                console.error('Error logging in:', error);
            }
        };

        mainDataFetch();

    }, []);

    useEffect(() => {
        console.log('Updated userDetail:', userDetail);
    }, [userDetail]);

    const childInformation = (info: { [key: string]: UserDetailProperty }) => {
        return Object.keys(info).map(key => {
            const child = info[key];
            return (

                    <Container key={child.id} className="child-info">
                        <h3>{`${translations.child_name} : ${child.name}`}</h3>
                        <Container>
                            <Container>
                                {`${translations.child_birthdate} : ${child.birthdate}`}
                            </Container>
                            <Container>
                                {`${translations.child_gender} : ${child.gender}`}
                            </Container>
                            <Container>
                                {`${translations.child_nationality} : ${child.nationality}`}
                            </Container>
                            <Container>
                                {`${translations.child_description} : ${child.description}`}
                            </Container>
                        </Container>

                        <Link  to={`/child/${child.id}`} className="child-link">
                            detail history
                        </Link>
                    </Container>

            );
        });
    };

    if(userDetail === null){
        return <></>
    }

    return (
        <div className="Main">
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

        </div>
    );
};

export default Main;