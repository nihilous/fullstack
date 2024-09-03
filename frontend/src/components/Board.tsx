import React, {useEffect, useRef, useState} from 'react';
import axios, {AxiosError} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { BoardTranslations } from '../translation/Board';
import {Button, Container, Form} from 'react-bootstrap';
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
    const [where, setWhere] = useState<string>(``);
    const [keyword, setKeyword] = useState<string>(``);
    const [toggleUI, setToggleUI] = useState<boolean>(false);

    const [title, setTitle] = useState<string>(``);
    const [text, setText] = useState<string>(``);

    const translations = BoardTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];


    const existingDataFetch = async (page:number) => {

        try {

            const response = await axios.get(`${apiUrl}/board/bbs/${userId}/${page}`, {
                headers: { Authorization: `Bearer ${getToken()}` },
                params: {
                    where: where,
                    keyword: keyword,
                }
            });

            totalNavi.current = response.data.post;
            if(page === 0)
            {
                setNaviNum(page);
            }
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

    const wrightPost = async () => {

        try {

            const response = await axios.post(`${apiUrl}/board/`, {"user_id":userId,"title":title,"text":text},{
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if(response.status === 201) {
                existingDataFetch(0);

                const message = popupTranslations.BoardPostingSuccess;
                dispatch(setNoticePopUp({
                    on: true,
                    is_error: false,
                    message: message
                }));
                setToggleUI(!toggleUI)
            }

        } catch (error) {

            const axiosError = error as AxiosError<{ boardPostWriteRes: number }>;
            if (axiosError.response) {
                const BoardPostWriteRes = axiosError.response.data.boardPostWriteRes;
                let message = ``;
                switch (BoardPostWriteRes) {
                    case 1:
                        message = popupTranslations.noAuthority;
                        break;
                    case 2:
                        message = popupTranslations.injection;
                        break;
                    case 3:
                        message = popupTranslations.BoardWriteRequire;
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

    const writePostUI = () => {
        return(
            <div className={"popup_form"}>
                <Container className="write_post">
                    <Form.Group controlId="PostTitle" className="mt-3">
                        <Form.Label>{`title`}</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder={`title`}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group controlId="PostText" className="mt-3">
                        <Form.Label>{`text`}</Form.Label>
                        <Form.Control
                            as="textarea" rows={6}
                            placeholder={`text`}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="mt-3" onClick={() => wrightPost()}>
                        {translations.write}
                    </Button>
                    <Button variant="secondary" className="mt-3 ms-2" onClick={() => setToggleUI(!toggleUI)}>
                        {translations.cancel}
                    </Button>

                </Container>
            </div>
        )
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

            <div className={"board_input_bar"}>

                <div>
                    <Form.Select value={where ?? ""} onChange={(e) => setWhere(e.target.value)}>
                        <option value="">{translations.select}</option>
                        <option value="nickname">{translations.nickname}</option>
                        <option value="title">{translations.title}</option>
                        <option value="text">{translations.text}</option>
                        <option value="reply">{translations.reply}</option>
                    </Form.Select>
                </div>
                <div>
                    <input type={"text"} value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={translations.search_inst}></input>
                    <Button variant="primary" type="submit" className="mt-3" onClick={() => existingDataFetch(0)}>
                        {translations.find}
                    </Button>
                </div>

                <div>
                    <Button variant="primary" type="submit" className="mt-3" onClick={() => setToggleUI(!toggleUI)}>
                        {translations.write}
                    </Button>
                </div>




            </div>

            {
                toggleUI ?
                    writePostUI()
                    :
                    null
            }
        </Container>
    );
};

export default Board;