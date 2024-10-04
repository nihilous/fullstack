import React, { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { useParams, useNavigate } from 'react-router-dom';
import { HistoryTranslations } from '../translation/History';
import { getToken, getDecodedToken } from '../util/jwtDecoder';
import { Button, Container } from 'react-bootstrap';
import { setNoticePopUp } from '../redux/slice';
import { PopupMessageTranslations } from '../translation/PopupMessageTranslations';
import jwtChecker from '../util/jwtChecker';
import HistoryProperty from '../types/HistoryType';
import ShowingHistory from './History/ShowingHistory';
import DeleteInfoUI from './History/DeleteHistoryUI';
import UpdateChildUI from './History/UpdateChildUI';
import UpdateHistoryUI from './History/UpdateHistoryUI';

const History = () => {
  const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
  const language = useSelector((state: RootState) => state.app.language);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = getDecodedToken()?.userId;
  const { id } = useParams();
  const user_detail_id = Number(id);
  const userDetailIds = getDecodedToken()?.userDetailIds;
  const translations = HistoryTranslations[language];
  const popupTranslations = PopupMessageTranslations[language];
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [vaccinationHistory, setVaccinationHistory] =
    useState<HistoryProperty>();
  const [removeChild, setRemoveChild] = useState<boolean>(false);
  const [updateHistory, setUpdateHistory] = useState<boolean>(false);
  const [updateTargetDate, setUpdateTargetDate] = useState<string>(``);
  const [removeHistory, setRemoveHistory] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string>(``);
  const [name, setName] = useState<string>(``);
  const [birthdate, setBirthdate] = useState<string>(``);
  const [gender, setGender] = useState<number | null>(null);
  const [nationality, setNationality] = useState<number | null>(null);
  const [description, setDescription] = useState<string>(``);
  const [updateChild, setUpdateChild] = useState<boolean>(false);
  const targetHistoryRef = useRef<number | null>(null);

  userDetailIds?.map((child_id: number) => {
    if (child_id === user_detail_id && !isAuthorized) {
      setIsAuthorized(true);
    }

    return null;
  });

  const historyDataFetch = async () => {
    try {
      const response = await axios.get<HistoryProperty[]>(
        `${apiUrl}/history/${userId}/${id}`,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      setVaccinationHistory(response.data[0]);
      setName(response.data[0].name);
      setBirthdate(response.data[0].birthdate.split('T')[0]);
      setGender(response.data[0].gender);
      setNationality(response.data[0].nationality);
      setDescription(response.data[0].description);
    } catch (error) {
      const axiosError = error as AxiosError<{ historyRes: number }>;
      if (axiosError.response) {
        const HistoryRes = axiosError.response.data.historyRes;
        let message = ``;
        switch (HistoryRes) {
          case 1:
            message = popupTranslations.noAuthority;
            break;
          case 2:
            message = popupTranslations.HistoryNotExist;
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
      navigate('/');
    }

    if (!isAuthorized) {
      return;
    }

    historyDataFetch();
  });

  const modifyChildRecord = async (
    id: number,
    method: string,
    oriDate: string | null,
  ) => {
    if (method === 'update') {
      setUpdateHistory(!updateHistory);
      oriDate && setUpdateTargetDate(oriDate);
    } else if (method === 'delete') {
      setRemoveHistory(!removeHistory);
    }

    targetHistoryRef.current = id;
  };

  const closeDeleteUI = () => {
    if (removeHistory) {
      setRemoveHistory(!removeHistory);
    } else if (removeChild) {
      setRemoveChild(!removeChild);
    } else if (updateChild) {
      setUpdateChild(!updateChild);
    }
    setDeleteConfirm(``);
  };

  return (
    <Container className="History center_ui">
      <div className={'main_top container'}>
        <p className={'history_title'}>{`${translations.title}`}</p>
      </div>
      {vaccinationHistory?.histories ? (
        vaccinationHistory?.histories && (
          <ShowingHistory
            language={language}
            translations={translations}
            infoWithHistories={vaccinationHistory}
            modifyChildRecord={modifyChildRecord}
          />
        )
      ) : (
        <div className={'main_top container'}>
          <p className={'history_title'}>{translations.no_record}</p>
        </div>
      )}
      <div className={'clear'}></div>
      <div className={'container his_delete'}>
        <div>
          <Button
            variant="warning"
            onClick={() => setUpdateChild(!updateChild)}
          >
            {translations.update_child_record}
          </Button>
        </div>
        <div>
          <Button variant="danger" onClick={() => setRemoveChild(!removeChild)}>
            {translations.delete_child_record}
          </Button>
        </div>
      </div>

      {removeChild || removeHistory ? (
        <DeleteInfoUI
          dispatch={dispatch}
          navigate={navigate}
          translations={translations}
          popupTranslations={popupTranslations}
          apiUrl={apiUrl}
          userId={userId as number}
          id={id as string}
          deleteConfirm={deleteConfirm}
          setDeleteConfirm={setDeleteConfirm}
          closeDeleteUI={closeDeleteUI}
          historyDataFetch={historyDataFetch}
          removeHistory={removeHistory}
          setRemoveHistory={setRemoveHistory}
          targetHistoryRef={targetHistoryRef}
        />
      ) : null}

      {updateHistory ? (
        <UpdateHistoryUI
          dispatch={dispatch}
          translations={translations}
          popupTranslations={popupTranslations}
          apiUrl={apiUrl}
          userId={userId as number}
          id={id as string}
          historyDataFetch={historyDataFetch}
          targetHistoryRef={targetHistoryRef}
          updateTargetDate={updateTargetDate}
          setUpdateTargetDate={setUpdateTargetDate}
          updateHistory={updateHistory}
          setUpdateHistory={setUpdateHistory}
        />
      ) : null}

      {updateChild ? (
        <UpdateChildUI
          dispatch={dispatch}
          translations={translations}
          popupTranslations={popupTranslations}
          apiUrl={apiUrl}
          userId={userId as number}
          id={id as string}
          closeDeleteUI={closeDeleteUI}
          historyDataFetch={historyDataFetch}
          name={name}
          setName={setName}
          birthdate={birthdate}
          setBirthdate={setBirthdate}
          gender={gender}
          setGender={setGender}
          nationality={nationality}
          setNationality={setNationality}
          description={description}
          setDescription={setDescription}
        />
      ) : null}
    </Container>
  );
};

export default History;
