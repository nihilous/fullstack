import React, { useEffect, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { BoardTranslations } from '../translation/Board';
import { Button, Container, Form } from 'react-bootstrap';
import { getToken, getDecodedToken } from '../util/jwtDecoder';
import { useNavigate } from 'react-router-dom';
import { setNoticePopUp } from '../redux/slice';
import { PopupMessageTranslations } from '../translation/PopupMessageTranslations';
import jwtChecker from '../util/jwtChecker';

import GenerateNavi from './Common/GenerateNavi';
import GeneratePosts from './Board/GeneratePosts';
import { post_for_bbs, post_with_replies } from '../types/BoardType';
import ReadPostUI from './Board/ReadPostUI';
import WritePostUI from './Board/WritePostUI';

const Board = () => {
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

  const [watchPost, setWatchPost] = useState<boolean>(false);
  const [postNum, setPostNum] = useState<number | null>(null);
  const [post, setPost] = useState<post_with_replies | null>(null);

  const translations = BoardTranslations[language];
  const popupTranslations = PopupMessageTranslations[language];

  const existingDataFetch = async (page: number) => {
    try {
      const response = await axios.get(
        `${apiUrl}/board/bbs/${userId}/${page}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
          params: {
            where: where,
            keyword: keyword,
          },
        },
      );

      totalNavi.current = response.data.post;
      if (page === 0) {
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
            const checkRes = jwtChecker(
              error as AxiosError<{ tokenExpired: boolean }>,
              popupTranslations,
            );
            message = checkRes.message;
            break;
        }

        dispatch(
          setNoticePopUp({
            on: true,
            is_error: true,
            message: message,
          }),
        );
      }
    }
  };

  useEffect(() => {
    if (userId === undefined) {
      naviagte('/');
    } else {
      existingDataFetch(naviNum);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [naviNum]);

  const fetchPost = async (post_id: number) => {
    try {
      const response = await axios.get(
        `${apiUrl}/board/post/${userId}/${post_id}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

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
            const checkRes = jwtChecker(
              error as AxiosError<{ tokenExpired: boolean }>,
              popupTranslations,
            );
            message = checkRes.message;
            break;
        }

        dispatch(
          setNoticePopUp({
            on: true,
            is_error: true,
            message: message,
          }),
        );
      }
    }
  };

  const closePost = () => {
    setWatchPost(false);
    setPost(null);
    setPostNum(null);
  };

  return (
    <Container className="center_ui">
      {post && watchPost ? (
        <ReadPostUI
          dispatch={dispatch}
          language={language}
          translations={translations}
          popupTranslations={popupTranslations}
          apiUrl={apiUrl}
          userId={userId as number}
          admin={admin as boolean}
          post_info={post}
          fetchPost={fetchPost}
          postNum={postNum as number}
          closePost={closePost}
          existingDataFetch={existingDataFetch}
          navinum={naviNum}
        />
      ) : null}

      <div>
        <div className={'post'}>
          <div className={'post_header'}>
            <span>{translations.nickname}</span>
            <span>{translations.title}</span>
            <span>{translations.datetime}</span>
          </div>
        </div>
        {posts && (
          <GeneratePosts
            language={language}
            translations={translations}
            posts={posts}
            postNum={postNum as number}
            closePost={closePost}
            fetchPost={fetchPost}
          />
        )}
      </div>

      {
        <GenerateNavi
          total={totalNavi.current}
          naviNum={naviNum}
          setNaviNum={setNaviNum}
        />
      }

      <div className={'board_input_bar'}>
        <div className={'board_input_search'}>
          <div>
            <Form.Select value={where} onChange={e => setWhere(e.target.value)}>
              <option value="title">{translations.title}</option>
              <option value="nickname">{translations.nickname}</option>
              <option value="text">{translations.text}</option>
              <option value="reply">{translations.reply}</option>
            </Form.Select>
          </div>
          <div>
            <input
              type={'text'}
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder={translations.search_inst}
            ></input>
          </div>
        </div>
        <div className={'board_input_buttons'}>
          <div>
            <Button
              variant="primary"
              type="submit"
              className="mt-3"
              onClick={() => existingDataFetch(0)}
            >
              {translations.find}
            </Button>
          </div>
          <div>
            <Button
              variant="primary"
              type="submit"
              className="mt-3"
              onClick={() => setToggleUI(!toggleUI)}
            >
              {translations.write}
            </Button>
          </div>
        </div>
      </div>

      {toggleUI ? (
        <WritePostUI
          dispatch={dispatch}
          translations={translations}
          popupTranslations={popupTranslations}
          apiUrl={apiUrl}
          userId={userId as number}
          existingDataFetch={existingDataFetch}
          toggleUI={toggleUI}
          setToggleUI={setToggleUI}
        />
      ) : null}
    </Container>
  );
};

export default Board;
