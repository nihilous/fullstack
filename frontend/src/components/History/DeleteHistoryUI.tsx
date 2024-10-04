import { Button, Container, Form } from 'react-bootstrap';
import React from 'react';
import { setNoticePopUp } from '../../redux/slice';
import axios, { AxiosError } from 'axios';
import { getToken } from '../../util/jwtDecoder';
import jwtChecker from '../../util/jwtChecker';
import { Dispatch } from 'redux';
import { NavigateFunction } from 'react-router-dom';

interface DeleteInfoUIProp {
  dispatch: Dispatch<any>;
  navigate: NavigateFunction;
  translations: any;
  popupTranslations: any;
  apiUrl: string;
  userId: number;
  closeDeleteUI: Function;
  deleteConfirm: string;
  setDeleteConfirm: React.Dispatch<React.SetStateAction<string>>;
  historyDataFetch: Function;
  removeHistory: boolean;
  setRemoveHistory: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  targetHistoryRef: React.MutableRefObject<number | null>;
}

const DeleteInfoUI = (props: DeleteInfoUIProp) => {
  const dispatch = props.dispatch;
  const navigate = props.navigate;
  const translations = props.translations;
  const popupTranslations = props.popupTranslations;
  const apiUrl = props.apiUrl;
  const userId = props.userId;
  const id = props.id;
  const closeDeleteUI = props.closeDeleteUI;
  const deleteConfirm = props.deleteConfirm;
  const setDeleteConfirm = props.setDeleteConfirm;
  const historyDataFetch = props.historyDataFetch;
  const removeHistory = props.removeHistory;
  const setRemoveHistory = props.setRemoveHistory;
  const targetHistoryRef = props.targetHistoryRef;

  const approveMessage = translations.agree_to_delete;

  const deleteChildRecord = async () => {
    let message = ``;
    if (deleteConfirm !== approveMessage) {
      message = 'not matched';
      dispatch(
        setNoticePopUp({
          on: true,
          is_error: true,
          message: message,
        }),
      );
      setDeleteConfirm(``);
      return;
    }

    try {
      const response = await axios.delete(`${apiUrl}/user/${userId}/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (response?.data.affectedHistoryRow === 0) {
        message = popupTranslations.delete_success;
      } else {
        message = `${popupTranslations.delete_child_record_success}${response?.data.affectedHistoryRow}`;
      }

      dispatch(
        setNoticePopUp({
          on: true,
          is_error: false,
          message: message,
        }),
      );

      navigate('/main');
    } catch (error) {
      const axiosError = error as AxiosError<{ childDeleteRes: number }>;
      if (axiosError.response) {
        const ChildDeleteRes = axiosError.response.data.childDeleteRes;
        switch (ChildDeleteRes) {
          case 1:
            message = popupTranslations.injection;
            break;
          case 2:
            message = popupTranslations.noAuthority;
            break;
          case 3:
            message = popupTranslations.delete_already;
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

  const deleteHistoryRecord = async () => {
    let message = ``;
    const target_history_id = targetHistoryRef.current;

    if (deleteConfirm !== approveMessage) {
      message = 'not matched';
      dispatch(
        setNoticePopUp({
          on: true,
          is_error: true,
          message: message,
        }),
      );
      setDeleteConfirm(``);
      return;
    }

    try {
      const response = await axios.delete(
        `${apiUrl}/history/${userId}/${id}/${target_history_id}`,
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );

      if (response?.data.affectedHistoryRow === 0) {
        message = popupTranslations.deleted_history_record_zero;
      } else {
        message = popupTranslations.delete_history_record_success;
      }

      dispatch(
        setNoticePopUp({
          on: true,
          is_error: false,
          message: message,
        }),
      );
      setDeleteConfirm(``);
      await historyDataFetch();

      setRemoveHistory(!removeHistory);
    } catch (error) {
      const axiosError = error as AxiosError<{ historyDeleteRes: number }>;
      if (axiosError.response) {
        const HistoryDeleteRes = axiosError.response.data.historyDeleteRes;
        switch (HistoryDeleteRes) {
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

  return (
    <div className={'popup_form'}>
      <Container>
        <Form.Group controlId="DeleteApprove" className="mt-3">
          <Form.Label>
            {removeHistory
              ? translations.delete_history_record
              : translations.delete_child_record}
          </Form.Label>
          <Form.Control
            type="text"
            placeholder={`${translations.type}${translations.agree_to_delete}`}
            value={deleteConfirm}
            onChange={e => setDeleteConfirm(e.target.value)}
          />
        </Form.Group>

        <Button
          variant="primary"
          type="submit"
          className="mt-3"
          onClick={() =>
            removeHistory ? deleteHistoryRecord() : deleteChildRecord()
          }
        >
          {`${translations.delete}`}
        </Button>
        <Button
          variant="secondary"
          className="mt-3 ms-2"
          onClick={() => closeDeleteUI()}
        >
          {`${translations.cancel}`}
        </Button>
      </Container>
    </div>
  );
};

export default DeleteInfoUI;
