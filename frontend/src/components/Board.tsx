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

    interface post_for_bbs {
        id: number
        user_id: number
        title: string
        nickname: string
        updated_at: string
    }

    interface post_with_replies  {
        id: number
        user_id: number
        title: string
        text: string
        nickname: string
        updated_at: string
        replies: {
            reply_id: number
            reply_user_id: number
            reply_user_nickname: string
            reply_text: string
            reply_updated_at: string
        }[] | null
    }

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const naviagte = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;

    const [naviNum, setNaviNum] = useState<number>(0);
    const totalNavi = useRef<number>(0);

    const [posts, setPosts] = useState<post_for_bbs[]>();
    const [where, setWhere] = useState<string>(``);
    const [keyword, setKeyword] = useState<string>(``);
    const [toggleUI, setToggleUI] = useState<boolean>(false);

    const [title, setTitle] = useState<string>(``);
    const [text, setText] = useState<string>(``);

    const [watchPost, setWatchPost] = useState<boolean>(false);
    const [postNum, setPostNum] = useState<number | null>(null);
    const [post, setPost] = useState<post_with_replies | null>(null);

    const [newReply, setNewReply] = useState<string>(``);

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

            const [year, month, day] = dateString.includes("T") ? dateString.split('T')[0].split('-') : dateString.split(' ')[0].split('-');
            if (language === "FIN") {
                return `${day} ${month} ${year}`;
            }
            return `${year} ${month} ${day}`;

    };


    const fetchPost = async (post_id: number) => {

        try {

            const response = await axios.get(`${apiUrl}/board/post/${userId}/${post_id}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if (response.status === 200) {

                setPost(response.data[0]);
                setPostNum(response.data[0].id);
                setWatchPost(true);
            }

        } catch (error) {

            const axiosError = error as AxiosError<{ boardPostGetRes: number }>;
            if (axiosError.response) {
                const BoardPostGetRes = axiosError.response.data.boardPostGetRes;
                let message = ``;
                switch (BoardPostGetRes) {
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

    }

    const writeReply = async (post_id:number) => {

        try {

            const response = await axios.post(`${apiUrl}/board/${post_id}`, {"user_id":userId,"text":newReply},{
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if(response.status === 201) {
                fetchPost(post_id);

                const message = popupTranslations.BoardPostingSuccess;
                dispatch(setNoticePopUp({
                    on: true,
                    is_error: false,
                    message: message
                }));

            }

        } catch (error) {

            const axiosError = error as AxiosError<{ boardReplyWriteRes: number }>;
            if (axiosError.response) {
                const BoardReplyWriteRes = axiosError.response.data.boardReplyWriteRes;
                let message = ``;
                switch (BoardReplyWriteRes) {
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

    const readPostUI = (post_info: post_with_replies) => {

        const replies = post_info.replies;
        const reply_elem = [];

        if(replies !== null){
            const parsed_repies = JSON.parse(JSON.stringify(replies));
            for(let i = 0; i < parsed_repies.length; i++){
                reply_elem.push(
                    <div key={parsed_repies[i].reply_id} className={"reply_elem"}>
                        <div className={"rep_writer"}>{parsed_repies[i].reply_user_nickname}</div>
                        <div className={"rep_text"}>{parsed_repies[i].reply_text}</div>
                        <div className={"rep_date_delete"}>
                            <div>{formatDate(parsed_repies[i].reply_updated_at, language)}</div>

                            {parsed_repies[i].reply_user_id === userId ?
                                <div>
                                    <Button>
                                        댓글삭제
                                    </Button>
                                </div>
                                :
                                null
                            }
                        </div>
                    </div>
                )

            }
        }

        return(
            <div key={`post_view_${post_info.id}`} className={"post_wrap"}>
                <div className={"post_main"}>
                    <div className={"pm_top"}>
                        <div className={"pmt_no"}>
                            <div>글번호</div>
                            <div>{post_info.id}</div>
                        </div>
                        <div className={"pmt_writer"}>
                            <div>작성자</div>
                            <div>{post_info.nickname}</div>
                        </div>
                        <div className={"pmt_title"}>
                            <div>제목</div>
                            <div>{post_info.title}</div>
                        </div>
                        <div className={"pmt_time"}>
                            <div>작성시간</div>
                            <div>{formatDate(post_info.updated_at, language)}</div>
                        </div>
                    </div>
                    <div className={"pm_mid"}>
                        {post_info.text}
                    </div>

                        {post_info.user_id === userId ?
                            <div className={"pm_bot"}>
                                <Button>글삭제</Button>
                            </div>
                            :
                            null
                        }

                </div>

                <div className={"post_reply"}>
                    {reply_elem.length !== 0 ? reply_elem : null}
                </div>

                <div className={"new_reply"}>
                    <div>
                        <Form.Control
                            as="textarea" rows={6}
                            placeholder={`text`}
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                        />
                    </div>
                    <div>
                        <Button variant="primary" type="submit" className="mt-3" onClick={() => writeReply(post_info.id)}>
                            {translations.write}
                        </Button>
                    </div>
                </div>
            </div>

        )


    }


    const generatePosts = (posts: post_for_bbs[]) => {

        return (
            <div className={"post"}>
                {posts.map((post_elem: post_for_bbs) => (

                    <div key={post_elem.id} className={`${postNum === post_elem.id ? "post_elem post_viewing" : "post_elem "}`} onClick={() => fetchPost(post_elem.id)}>
                        <span>{post_elem.id}</span>
                        <span>{post_elem.nickname}</span>
                        <span>{post_elem.title}</span>
                        <span>{formatDate(post_elem.updated_at, language)}</span>
                    </div>
                ))}
            </div>
        );
    };

    const writePost = async () => {

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

                    <Button variant="primary" type="submit" className="mt-3" onClick={() => writePost()}>
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
            {post && watchPost ?
                readPostUI(post)
                :
                null
            }

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