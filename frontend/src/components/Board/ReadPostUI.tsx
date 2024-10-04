import {post_with_replies} from "../../types/BoardType";
import {Button, Form} from "react-bootstrap";
import {formatDate} from "../../util/formatDate";
import React, {useState} from "react";
import axios, {AxiosError} from "axios";
import {getToken} from "../../util/jwtDecoder";
import {setNoticePopUp} from "../../redux/slice";
import jwtChecker from "../../util/jwtChecker";
import {Dispatch} from "redux";

interface ReadPostUIProps {
    dispatch: Dispatch<any>;
    language: string;
    translations: any;
    popupTranslations: any;
    apiUrl : string;
    userId : number;
    admin : boolean;
    post_info: post_with_replies;
    fetchPost: Function;
    closePost: Function;
    existingDataFetch: Function;
    navinum : number;
    postNum : number;
}

const ReadPostUI = (props: ReadPostUIProps) => {

    const dispatch = props.dispatch;
    const language = props.language;
    const translations = props.translations;
    const popupTranslations = props.popupTranslations;
    const apiUrl = props.apiUrl;
    const userId = props.userId;
    const admin = props.admin;
    const post_info = props.post_info
    const fetchPost = props.fetchPost;
    const closePost = props.closePost;
    const postNum = props.postNum;
    const naviNum = props.navinum;
    const existingDataFetch = props.existingDataFetch;

    const [newReply, setNewReply] = useState<string>(``);

    const [editPost, setEditPost] = useState<boolean>(false);
    const [editPostNum, setEditPostNum] = useState<number | null>(null);
    const [editPostTitle, setEditPostTitle] = useState<string>(``);
    const [editPostText, setEditPostText] = useState<string>(``);

    const [editReply, setEditReply] = useState<boolean>(false);
    const [editReplyNum, setEditReplyNum] = useState<number | null>(null);
    const [editReplyText, setEditReplyText] = useState<string>(``);

    const replies = post_info.replies;
    const reply_elem = [];

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

export default ReadPostUI;