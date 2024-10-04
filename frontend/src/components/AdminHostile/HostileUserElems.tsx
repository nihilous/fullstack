import { Button } from 'react-bootstrap';
import React from 'react';
import axios, { AxiosError } from 'axios';
import HostileUserInformation from '../../types/AdminHostileType';
import { getToken } from '../../util/jwtDecoder';
import jwtChecker from '../../util/jwtChecker';
import { setNoticePopUp } from '../../redux/slice';
import { Dispatch } from 'redux';
import { formatDate } from '../../util/formatDate';

interface HostileUserInformationProps {
  dispatch: Dispatch<any>;
  language: string;
  translations: any;
  popupTranslations: any;
  apiUrl: string;
  hostileUserDataFetch: Function;
  info: HostileUserInformation[];
  naviNum: number;
}

const HostileUserElems = (props: HostileUserInformationProps) => {
  const dispatch = props.dispatch;
  const language = props.language;
  const translations = props.translations;
  const popupTranslations = props.popupTranslations;
  const apiUrl = props.apiUrl;
  const hostileUserDataFetch = props.hostileUserDataFetch;
  const info = props.info;
  const naviNum = props.naviNum;

  const whiteOrBanUpdate = async (id: number, column: string) => {
    try {
      const response = await axios.put<HostileUserInformation[]>(
        `${apiUrl}/admin/hostile/${column}`,
        { id: id },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      if (response.status === 201) {
        hostileUserDataFetch(naviNum);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ adminUpdateRes: number }>;
      if (axiosError.response) {
        const AdminUpdateRes = axiosError.response.data.adminUpdateRes;
        let message = ``;
        switch (AdminUpdateRes) {
          case 1:
            message = popupTranslations.noAuthority;
            break;
          case 2:
            message = popupTranslations.injection;
            break;
          case 3:
            message = popupTranslations.AdminHostileZeroUpdate;
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
    <>
      {info.map((data, userIndex) => {
        const parsedLogs = JSON.parse(data.log);

        return (
          <div key={data.id} className={`hostile_elem`}>
            <div className={`info_div`}>
              <span>{translations.index}</span>
              <span>{data.id}</span>
            </div>
            <div className={`info_div`}>
              <span>{translations.ip_address}</span>
              <span>{data.ip_address}</span>
            </div>
            <div className={`info_div`}>
              <span>{translations.attack_count}</span>
              <span>{data.attack_count}</span>
            </div>
            <div className={`info_div`}>
              <span>{translations.is_banned}</span>
              <span>{data.is_banned ? 'true' : 'false'}</span>
            </div>
            <div className={`info_div`}>
              <span>{translations.is_whitelist}</span>
              <span>{data.is_whitelist ? 'true' : 'false'}</span>
            </div>
            <div className={`info_div`}>
              <span>{translations.updated_at}</span>
              <span>{formatDate(data.updated_at, language)}</span>
            </div>
            <div className={`info_div`}>
              <span>{translations.created_at}</span>
              <span>{formatDate(data.created_at, language)}</span>
            </div>
            <div className={`info_div`}>
              <span>
                <Button onClick={() => whiteOrBanUpdate(data.id, 'ban')}>
                  {data.is_banned ? translations.un_ban : translations.ban}
                </Button>
              </span>
              <span>
                <Button onClick={() => whiteOrBanUpdate(data.id, 'whitelist')}>
                  {data.is_whitelist
                    ? translations.un_whitelist
                    : translations.whitelist}
                </Button>
              </span>
            </div>
            <div>
              {parsedLogs.map((logEntry: string, logIndex: number) => {
                const parsedLogEntry = JSON.parse(logEntry);

                return (
                  <div key={logIndex} className={`log_elem`}>
                    <div className={`log_div`}>
                      <span>{translations.key}</span>
                      <span>{translations.value}</span>
                    </div>
                    {Object.entries(parsedLogEntry).map(
                      ([key, value], entryIndex) => (
                        <div className={`log_div`} key={entryIndex}>
                          <span>{key}</span>
                          <span>{`${value}`}</span>
                        </div>
                      ),
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default HostileUserElems;
