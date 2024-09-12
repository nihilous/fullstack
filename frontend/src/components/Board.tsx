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
import jwtChecker from "../util/jwtChecker";

const Board = () => {

    interface post_for_bbs {
        id: number
        user_id: number
        title: string
        nickname: string
        is_admin: boolean
        updated_at: string
    }

    interface post_with_replies  {
        id: number
        user_id: number
        title: string
        text: string
        nickname: string
        is_admin: boolean
        updated_at: string
        replies: {
            reply_id: number
            reply_user_id: number
            reply_user_nickname: string
            reply_text: string
            reply_is_admin: boolean
            reply_updated_at: string
        }[] | null
    }

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const naviagte = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;
    const admin = getDecodedToken()?.admin;

    const [naviNum, setNaviNum] = useState<number>(0);
    const totalNavi = useRef<number>(0);

    const [posts, setPosts] = useState<post_for_bbs[]>();
    const [where, setWhere] = useState<string>(`title`);
    const [keyword, setKeyword] = useState<string>(``);
    const [toggleUI, setToggleUI] = useState<boolean>(false);

    const [title, setTitle] = useState<string>(``);
    const [text, setText] = useState<string>(``);

    const [watchPost, setWatchPost] = useState<boolean>(false);
    const [postNum, setPostNum] = useState<number | null>(null);
    const [post, setPost] = useState<post_with_replies | null>(null);

    const [newReply, setNewReply] = useState<string>(``);

    const [editPost, setEditPost] = useState<boolean>(false);
    const [editPostNum, setEditPostNum] = useState<number | null>(null);
    const [editPostTitle, setEditPostTitle] = useState<string>(``);
    const [editPostText, setEditPostText] = useState<string>(``);

    const [editReply, setEditReply] = useState<boolean>(false);
    const [editReplyNum, setEditReplyNum] = useState<number | null>(null);
    const [editReplyText, setEditReplyText] = useState<string>(``);

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

    useEffect(() => {

        if(userId === undefined){
            naviagte("/");
        }else{
            existingDataFetch(naviNum);
        }


    }, [naviNum]);



    const generateNavi = (total: number, recent: number) => {
        const buttons = [];
        const itemsPerPage = 5;

        const currentSet = Math.floor(recent / itemsPerPage);

        const start = currentSet * itemsPerPage;
        const end = Math.min(start + itemsPerPage, total);

        for (let i = start; i < end; i++) {
            buttons.push(
                <span className={`nav_target ${i === naviNum ? "now_nav" : ""}`} key={i} onClick={() => setNaviNum(i)}>
                    {i + 1}
                </span>
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

    }

    const writeReply = async (post_id:number) => {

        try {

            const response = await axios.post(`${apiUrl}/board/${post_id}`, {"user_id":userId,"text":newReply},{
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if(response.status === 201) {

                setNewReply(``);
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

    const closePost = () => {
        setWatchPost(false);
        setPost(null);
        setPostNum(null);
    }

    const deletePostReply = async (table:string, post_id:number, is_admin:boolean) => {

        let message = ``;

        try {

            const response = is_admin ? await axios.delete(`${apiUrl}/admin/${table}/${post_id}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            }) : await axios.delete(`${apiUrl}/board/${table}/${userId}/${post_id}`, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if(table === "reply"){
                if(response?.data.affectedReplyRows !== 0){
                    message = popupTranslations.BoardDeleteReplySuccess
                }
                if(postNum){
                    fetchPost(postNum);
                }
            }else{
                if(response?.data.affectedReplyRows === 0){
                    message = popupTranslations.BoardDeletePostSuccess
                }else{
                    message = `${popupTranslations.BoardDeletePostReplySuccess}${response?.data.affectedReplyRows}`;
                }
                closePost();
                existingDataFetch(naviNum);
            }

            dispatch(setNoticePopUp({
                on: true,
                is_error: false,
                message: message
            }));

        } catch (error) {
            const axiosError = error as AxiosError<{ boardDeleteRes: number }>;
            if (axiosError.response) {
                const BoardDeleteRes = axiosError.response.data.boardDeleteRes;
                switch (BoardDeleteRes) {
                    case 1:
                        message = popupTranslations.injection;
                        break;
                    case 2:
                        message = popupTranslations.noAuthority;
                        break;
                    case 3:
                        message = popupTranslations.BoardDeleteAlready;
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

    const modifyPostOrReply = (table: string, edit_target_id: number, edit_target_title: string | null, edit_target_text: string) => {
        if(table === "post"){
            setEditReply(false);
            setEditReplyNum(null);
            setEditReplyText('');

            setEditPost(true);
            setEditPostNum(edit_target_id);
            if(edit_target_title){
                setEditPostTitle(edit_target_title);
            }
            setEditPostText(edit_target_text);
        }else{
            setEditPost(false);
            setEditPostNum(null);
            if(edit_target_title){
                setEditPostTitle(``);
            }
            setEditPostText(``);

            setEditReply(true);
            setEditReplyNum(edit_target_id);
            setEditReplyText(edit_target_text);
        }

    }

    const updatePostOrReply = async (edit_target_table:string) => {
        let message = ``;

        try {

            const response = await axios.put(`${apiUrl}/board/${edit_target_table}/${edit_target_table === "post" ? editPostNum : editReplyNum}`,
                edit_target_table === "post" ? {"user_id" : userId, "title" : editPostTitle, "text" : editPostText} : {"user_id" : userId, "text" : editReplyText},{
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            if(edit_target_table === "post"){

                    setEditPost(false);
                    setEditPostNum(null);
                    setEditPostTitle(``);
                    setEditPostText(``);

            }else {
                    setEditReply(false);
                    setEditReplyNum(null);
                    setEditReplyText(``);

            }

            if(response.status === 201 && postNum){
                fetchPost(postNum)
            }


            dispatch(setNoticePopUp({
                on: true,
                is_error: false,
                message: popupTranslations.BoardUpdateSuccess
            }));

        } catch (error) {
            const axiosError = error as AxiosError<{ boardUpdateRes: number }>;
            if (axiosError.response) {
                const BoardUpdateRes = axiosError.response.data.boardUpdateRes;
                switch (BoardUpdateRes) {
                    case 1:
                        message = popupTranslations.noAuthority;
                        break;
                    case 2:
                        message = popupTranslations.injection;
                        break;
                    case 3:
                        message = popupTranslations.injection;
                        break;
                    case 4:
                        message = edit_target_table === "post" ? popupTranslations.BoardWriteRequire : popupTranslations.BoardUpdateNotExist;
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
    }

    const readPostUI = (post_info: post_with_replies) => {

        const replies = post_info.replies;
        const reply_elem = [];

        if(replies !== null){
            const parsed_repies = JSON.parse(JSON.stringify(replies));
            for(let i = 0; i < parsed_repies.length; i++){

                reply_elem.push(
                    <div key={parsed_repies[i].reply_id} className={"reply_elem"}>
                        <div className={"rep_info"}>
                            <div className={"rep_writer"}>{parsed_repies[i].reply_is_admin ? translations.admin : parsed_repies[i].reply_user_nickname === null ? translations.quit : parsed_repies[i].reply_user_nickname}</div>
                            {
                                editReply && editReplyNum === parsed_repies[i].reply_id ?
                                    <Form.Group controlId="ReplyEditText" className={"rep_text"}>
                                        <Form.Control
                                            type="text"
                                            placeholder={`${editReplyText}`}
                                            value={editReplyText}
                                            onChange={(e) => setEditReplyText(e.target.value)}
                                        />
                                    </Form.Group>
                                    :
                                    <div className={"rep_text"}>{parsed_repies[i].reply_text}</div>
                            }

                            <div className={"rep_date_delete"}>
                                <div>{formatDate(parsed_repies[i].reply_updated_at, language)}</div>
                            </div>
                        </div>
                        {parsed_repies[i].reply_user_id === userId && Boolean(parsed_repies[i].is_admin)=== admin ?

                            <div  className={"rep_interaction"}>
                                <div>
                                    {
                                        editReply && editReplyNum === parsed_repies[i].reply_id ?
                                            <Button
                                                onClick={() => updatePostOrReply("reply")}>{translations.save}</Button>
                                            :
                                            <Button
                                                onClick={() => modifyPostOrReply("reply", parsed_repies[i].reply_id, null, parsed_repies[i].reply_text)}>{translations.edit}</Button>

                                    }
                                </div>
                                <div>
                                    <Button onClick={() => deletePostReply("reply", parsed_repies[i].reply_id, false)}>
                                        {translations.delete}
                                    </Button>
                                </div>
                            </div>
                            :
                            admin === true ?
                                <div className={"rep_interaction"}>
                                    <div>
                                        <Button onClick={() => deletePostReply("reply", parsed_repies[i].reply_id, admin)}>
                                            {translations.delete}
                                        </Button>
                                    </div>
                                </div>
                                :
                                null
                        }

                    </div>
                )

            }
        }

        return (
            <div key={`post_view_${post_info.id}`} className={"post_wrap"}>
                <div className={"post_main"}>
                    <div className={"pm_top"}>
                        <div className={"pmt_writer"}>
                            <div>{translations.nickname}</div>
                            <div>{post_info.is_admin ? translations.admin : post_info.nickname === null ? translations.quit : post_info.nickname}</div>
                        </div>
                        <div className={"pmt_title"}>
                            {editPost ?
                                <Form.Group controlId="PostTitle">
                                    <Form.Control
                                        type="text"
                                        placeholder={`${editPostTitle}`}
                                        value={editPostTitle}
                                        onChange={(e) => setEditPostTitle(e.target.value)}
                                    />
                                </Form.Group>
                                :
                                <>
                                    <div>{translations.title}</div>
                                    <div>{post_info.title}</div>
                                </>

                            }

                        </div>
                        <div className={"pmt_time"}>
                            <div>{translations.datetime}</div>
                            <div>{formatDate(post_info.updated_at, language)}</div>
                        </div>
                    </div>
                    <div className={"pm_mid"}>
                        {editPost ?
                            <Form.Group controlId="PostText">
                                <Form.Control
                                    as="textarea" rows={6}
                                    placeholder={`${editPostText}`}
                                    value={editPostText}
                                    onChange={(e) => setEditPostText(e.target.value)}
                                />
                            </Form.Group>
                            :
                            post_info.text
                        }

                    </div>

                        {post_info.user_id === userId && Boolean(post_info.is_admin) === admin ?
                            <div className={"pm_bot"}>
                                <div>
                                    {
                                        editPost ?
                                            <Button
                                                onClick={() => updatePostOrReply("post")}>{translations.save}</Button>
                                            :
                                            <Button
                                                onClick={() => modifyPostOrReply("post",post_info.id, post_info.title, post_info.text)}>{translations.edit}</Button>

                                    }

                                </div>

                                <div>
                                    <Button
                                        onClick={() => deletePostReply("post", post_info.id, false)}>{translations.delete}</Button>
                                </div>
                            </div>

                            :

                            admin === true ?
                                <div className={"pm_bot"}>
                                    <div>
                                        <Button
                                            onClick={() => deletePostReply("post", post_info.id, admin)}>{translations.delete}</Button>
                                    </div>
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
                        <Button variant="primary" type="submit" className="mt-3"
                                onClick={() => writeReply(post_info.id)}>
                            {translations.reply}
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

                    <div key={post_elem.id} className={`${postNum === post_elem.id ? "post_elem post_viewing" : "post_elem "}`} onClick={() => postNum === post_elem.id ? closePost() : fetchPost(post_elem.id)}>
                        <span>{post_elem.is_admin ? translations.admin : post_elem.nickname === null ? translations.quit : post_elem.nickname}</span>
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

                setTitle(``);
                setText(``);
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
                        message = popupTranslations.BoardWriteRequire;
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
                        <span>{translations.nickname}</span>
                        <span>{translations.title}</span>
                        <span>{translations.datetime}</span>
                    </div>
                </div>
                {posts && generatePosts(posts)}
            </div>

            <div className="board_navs">
                <div className={"nav_prev"}>
                    {totalNavi.current > 4 && naviNum > 4 ?
                        <span onClick={() => setNaviNum(Math.max(naviNum - 1 - (naviNum % 5), 0))}>
                            {"<"}
                        </span>
                        :
                        null
                    }
                </div>

                {generateNavi(totalNavi.current, naviNum)}
                <div className={"nav_next"}>
                    {totalNavi.current > 4 && naviNum < totalNavi.current - totalNavi.current%5 ?
                        <span onClick={() => setNaviNum(Math.min(naviNum + (5 - (naviNum % 5)), totalNavi.current - 1))}>
                            {">"}
                        </span>
                        :
                        null
                    }
                </div>
            </div>

            <div className={"board_input_bar"}>
                <div className={"board_input_search"}>
                    <div>
                        <Form.Select value={where} onChange={(e) => setWhere(e.target.value)}>
                            <option value="title">{translations.title}</option>
                            <option value="nickname">{translations.nickname}</option>
                            <option value="text">{translations.text}</option>
                            <option value="reply">{translations.reply}</option>
                        </Form.Select>
                    </div>
                    <div>
                        <input type={"text"} value={keyword} onChange={(e) => setKeyword(e.target.value)}
                               placeholder={translations.search_inst}></input>
                    </div>
                </div>
                <div className={"board_input_buttons"}>
                    <div>
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