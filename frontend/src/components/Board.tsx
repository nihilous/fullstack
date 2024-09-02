import React, {useEffect, useRef, useState} from 'react';
import axios, {AxiosError} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { BoardTranslations } from '../translation/Board';
import { Button, Container } from 'react-bootstrap';
import { getToken, getDecodedToken } from "../util/jwtDecoder";
import { useNavigate} from "react-router-dom";
import {setNoticePopUp} from "../redux/slice";
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";

const Board = () => {

    interface post {
        id: number
        user_id: number
        title: string
        nickname: string
        updated_at: string
    }

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const naviagte = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;

    const [naviNum, setNaviNum] = useState<number>(0);
    const totalNavi = useRef<number>(0);

    const [posts, setPosts] = useState<post[]>();

    const translations = BoardTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];


    const existingDataFetch = async (page:number) => {

        try {

            const response = await axios.get(`${apiUrl}/board/bbs/${userId}/${page}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            totalNavi.current = response.data.post;
            setPosts(response.data.data);

        } catch (error) {

            const axiosError = error as AxiosError<{ boardGetRes: number }>;
            if (axiosError.response) {
                const BoardGetRes = axiosError.response.data.boardGetRes;
                let message = ``;
                switch (BoardGetRes) {
                    case 1:
                        message = popupTranslations.noAuthority;
                        break;
                    case 2:
                        message = popupTranslations.injection;
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

    useEffect(() => {

        if(userId === undefined){
            naviagte("/");
        }else{
            existingDataFetch(naviNum);
        }


    }, [naviNum]);

    const generateNavi = (total: number, recent: number) => {
        const buttons = [];
        const itemsPerPage = 10;

        const currentSet = Math.floor(recent / itemsPerPage);

        const start = currentSet * itemsPerPage;
        const end = Math.min(start + itemsPerPage, total);

        for (let i = start; i < end; i++) {
            buttons.push(
                <Button className={`nav_target ${i === naviNum ? "now_nav" : ""}`} key={i} onClick={() => setNaviNum(i)}>
                    {i + 1}
                </Button>
            );
        }

        return <div>{buttons}</div>;
    };

    const formatDate = (dateString: string, language: string) => {

        const [year, month, day] = dateString.split('T')[0].split('-');
        if (language === "FIN") {
            return `${day} ${month} ${year}`;
        }
        return `${year} ${month} ${day}`;
    };


    const generatePosts = (posts: post[]) => {
        return (
            <div className={"post"}>
                {posts.map((post: post) => (
                    <div key={post.id} className={"post_elem"}>
                        <span>{post.id}</span>
                        <span>{post.nickname}</span>
                        <span>{post.title}</span>
                        <span>{formatDate(post.updated_at, language)}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Container className="center_ui">
            <div>
                <div className={"post"}>
                    <div className={"post_header"}>
                        <span>{translations.no}</span>
                        <span>{translations.nickname}</span>
                        <span>{translations.title}</span>
                        <span>{translations.datetime}</span>
                    </div>
                </div>
                {posts && generatePosts(posts)}
            </div>

            <div className="board_navs">
                <div className={"nav_prev"}>
                    {totalNavi.current > 9 && naviNum > 9 ?
                        <Button onClick={() => setNaviNum(Math.max(naviNum - 10, 0))}>
                            {"<"}
                        </Button>
                        :
                        null
                    }
                </div>

                {generateNavi(totalNavi.current, naviNum)}
                <div className={"nav_next"}>
                    {totalNavi.current > 9 && naviNum < totalNavi.current - totalNavi.current%10 ?
                        <Button onClick={() => setNaviNum(Math.min(naviNum + 10, totalNavi.current - 1))}>
                            {">"}
                        </Button>
                        :
                        null
                    }
                </div>

            </div>
        </Container>
    );
};

export default Board;