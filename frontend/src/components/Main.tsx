import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate, Link } from 'react-router-dom';

import { token, decodedToken } from "../util/jwtDecoder";

const Main: React.FC = () => {

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const userId = decodedToken?.userId;
    const admin = decodedToken?.admin;
    const userDetailIds = decodedToken?.userDetailIds;

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

    interface UserDetailWithoutDetails {
        user_detail: false;
        id: number;
        email: string | null;
        nickname: string;
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
                <Link key={child.id} to={`/child/${child.id}`} className="child-link">
                    <div className="child-info">
                        <h3>{child.name}</h3>
                        <p>{child.description}</p>
                    </div>
                </Link>
            );
        });
    };

    if(userDetail === null){
        return <></>
    }

    return (
        <div className="Main">
            <div>
                <h1>{`Welcome ${
                    userDetail?.user_detail ?
                        userDetail?.record[0]?.nickname
                        :
                        userDetail?.nickname
                } You Have ${
                    userDetail?.user_detail && userDetail?.record ?
                        userDetailIds?.length + " Child Records"
                        :
                        "to make Child Information"
                }`}</h1>
            </div>

            {
                userDetail?.user_detail ?
                    <>
                        {childInformation(userDetail.record)}
                    </>

                    :
                    <></>
            }

        </div>
    );
};

export default Main;