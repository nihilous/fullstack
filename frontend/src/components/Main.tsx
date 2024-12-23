import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { MainTranslations } from '../translation/Main';
import { getToken, getDecodedToken } from '../util/jwtDecoder';
import { Button, Container } from 'react-bootstrap';
import { setNoticePopUp } from '../redux/slice';
import { PopupMessageTranslations } from '../translation/PopupMessageTranslations';
import jwtChecker from '../util/jwtChecker';
import { UserDetailResponse, UserDetailProperty } from '../types/MainType';
import ChildInformation from './Main/ChildInformation';

const Main = () => {
  const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
  const language = useSelector((state: RootState) => state.app.language);
  const navigagte = useNavigate();
  const dispatch = useDispatch();
  const userId = getDecodedToken()?.userId;
  const userDetailIds = getDecodedToken()?.userDetailIds;
  const translations = MainTranslations[language];
  const popupTranslations = PopupMessageTranslations[language];

  const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
  const [filter, setFilter] = useState<string>(``);
  const [filterNationality, setFilterNationality] = useState<number | null>(
    null,
  );
  const [filterGender, setFilterGender] = useState<number | null>(null);
  const [filteredUser, setFilteredUser] = useState<UserDetailProperty[]>([]);

  useEffect(() => {
    const mainDataFetch = async () => {
      try {
        const response = await axios.get<UserDetailResponse>(
          `${apiUrl}/user/${userId}`,
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );

        setUserDetail(response.data);

        if (response.data.user_detail) {
          setFilteredUser(Object.values(response.data.record));
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ UserRes: number }>;
        if (axiosError.response) {
          const UserRes = axiosError.response.data.UserRes;
          let message = ``;
          switch (UserRes) {
            case 1:
              message = popupTranslations.noAuthority;
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

    if (userId === undefined) {
      navigagte('/');
    } else {
      mainDataFetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(() => {}, [userDetail]);

  useEffect(() => {
    if (userDetail?.user_detail) {
      const filteredRecords = Object.values(userDetail.record).filter(value => {
        const matchesFilter = filter
          ? value.name?.toLowerCase().includes(filter.toLowerCase()) ||
            value.description?.toLowerCase().includes(filter.toLowerCase()) ||
            value.birthdate?.toLowerCase().includes(filter.toLowerCase())
          : true;

        const matchesNationality = filterNationality
          ? value.nationality === filterNationality
          : true;

        const matchesGender =
          filterGender !== null ? value.gender === filterGender : true;

        return matchesFilter && matchesNationality && matchesGender;
      });

      setFilteredUser(filteredRecords);
    } else {
      setFilteredUser(filteredUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, filterGender, filterNationality]);

  const handleFilterNationality = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setFilterNationality(parseInt(event.target.value, 10) || null);
  };

  const handleFilterGender = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setFilterGender(value !== '' ? parseInt(value) : null);
  };

  if (userDetail === null) {
    return <></>;
  }

  return (
    <Container className="Main center_ui">
      <Container className={'main_top'}>
        <div className={'mt_elem'}>
          <p className={'main_greeting'}>
            {`${translations.welcome} ${userDetail?.record[0]?.nickname ?? ''}  ${
              userDetail?.user_detail
                ? translations.have_child +
                  Object.keys(userDetail.record).length +
                  ' ' +
                  ((userDetailIds?.length ?? 0) > 1
                    ? translations.child_datas
                    : translations.child_data)
                : translations.no_child
            }`}
          </p>
        </div>

        <div className={'mt_elem filter_wrap'}>
          <input
            type={'text'}
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder={translations.filter}
          ></input>
          <div className={'select_wrap'}>
            <select onChange={handleFilterNationality}>
              <option value="">{translations.child_nationality}</option>
              <option value={1}>{translations.finland}</option>
              <option value={2}>{translations.korea}</option>
              <option value={3}>{translations.usa}</option>
            </select>
            <select onChange={handleFilterGender}>
              <option value="">{translations.child_gender}</option>
              <option value="0">{translations.boy}</option>
              <option value="1">{translations.girl}</option>
            </select>
          </div>
        </div>
      </Container>

      {userDetail?.user_detail === true ? (
        <Container className={'main_info_elem_wrapper'}>
          <ChildInformation
            language={language}
            translations={translations}
            info={filteredUser}
          />
        </Container>
      ) : (
        <Container className={'main_rc_btn'}>
          <Button href={`/register_child`}>{translations.register}</Button>
        </Container>
      )}
    </Container>
  );
};

export default Main;
