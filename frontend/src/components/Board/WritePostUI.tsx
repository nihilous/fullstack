import { Button, Container, Form } from 'react-bootstrap';
import React, { useState } from 'react';
import { Dispatch } from 'redux';
import axios, { AxiosError } from 'axios';
import { getToken } from '../../util/jwtDecoder';
import { setNoticePopUp } from '../../redux/slice';
import jwtChecker from '../../util/jwtChecker';

interface WritePostUIProps {
  dispatch: Dispatch<any>;
  translations: any;
  popupTranslations: any;
  apiUrl: string;
  userId: number;
  existingDataFetch: Function;
  setToggleUI: React.Dispatch<React.SetStateAction<boolean>>;
  toggleUI: boolean;
}

const WritePostUI = (props: WritePostUIProps) => {
  const dispatch = props.dispatch;
  const translations = props.translations;
  const popupTranslations = props.popupTranslations;
  const apiUrl = props.apiUrl;
  const userId = props.userId;
  const existingDataFetch = props.existingDataFetch;
  const toggleUI = props.toggleUI;
  const setToggleUI = props.setToggleUI;

  const [title, setTitle] = useState<string>(``);
  const [text, setText] = useState<string>(``);

  const writePost = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/board/`,
        { user_id: userId, title: title, text: text },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      if (response.status === 201) {
        setTitle(``);
        setText(``);
        existingDataFetch(0);

        const message = popupTranslations.BoardPostingSuccess;
        dispatch(
          setNoticePopUp({
            on: true,
            is_error: false,
            message: message,
          }),
        );
        setToggleUI(!toggleUI);
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

  return (
    <div className={'popup_form'}>
      <Container className="write_post">
        <Form.Group controlId="PostTitle" className="mt-3">
          <Form.Label>{`title`}</Form.Label>
          <Form.Control
            type="text"
            placeholder={`title`}
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="PostText" className="mt-3">
          <Form.Label>{`text`}</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            placeholder={`text`}
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          className="mt-3"
          onClick={() => writePost()}
        >
          {translations.write}
        </Button>
        <Button
          variant="secondary"
          className="mt-3 ms-2"
          onClick={() => setToggleUI(!toggleUI)}
        >
          {translations.cancel}
        </Button>
      </Container>
    </div>
  );
};

export default WritePostUI;
