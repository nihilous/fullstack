import axios, { AxiosError } from 'axios';
import { getDecodedToken, getToken } from '../../util/jwtDecoder';
import { setNoticePopUp } from '../../redux/slice';
import jwtChecker from '../../util/jwtChecker';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import React from 'react';
import { Dispatch } from 'redux';

interface UpdateChildUIProp {
  dispatch: Dispatch<any>;
  translations: any;
  popupTranslations: any;
  apiUrl: string;
  userId: number;
  closeDeleteUI: Function;
  historyDataFetch: Function;
  id: string;

  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  birthdate: string;
  setBirthdate: React.Dispatch<React.SetStateAction<string>>;
  gender: number | null;
  setGender: React.Dispatch<React.SetStateAction<number | null>>;
  nationality: number | null;
  setNationality: React.Dispatch<React.SetStateAction<number | null>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
}

const UpdateChildUI = (props: UpdateChildUIProp) => {
  const dispatch = props.dispatch;
  const translations = props.translations;
  const popupTranslations = props.popupTranslations;
  const apiUrl = props.apiUrl;
  const id = props.id;
  const historyDataFetch = props.historyDataFetch;

  const closeDeleteUI = props.closeDeleteUI;

  const name = props.name;
  const setName = props.setName;
  const birthdate = props.birthdate;
  const setBirthdate = props.setBirthdate;
  const gender = props.gender;
  const setGender = props.setGender;
  const nationality = props.nationality;
  const setNationality = props.setNationality;
  const description = props.description;
  const setDescription = props.setDescription;

  const updateChildRecord = async () => {
    try {
      await axios.put(
        `${apiUrl}/user/${getDecodedToken()?.userId}/${id}`,
        {
          name: name,
          description: description,
          gender: gender,
          birthdate: birthdate,
          nationality: nationality,
        },
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );

      dispatch(
        setNoticePopUp({
          on: true,
          is_error: false,
          message: popupTranslations.update_child_record_success,
        }),
      );

      historyDataFetch();
      closeDeleteUI();
    } catch (error) {
      const axiosError = error as AxiosError<{ childUpdateRes: number }>;
      if (axiosError.response) {
        const childUpdateRes = axiosError.response.data.childUpdateRes;
        let message = ``;
        switch (childUpdateRes) {
          case 1:
            message = popupTranslations.noAuthority;
            break;
          case 2:
            message = popupTranslations.injection;
            break;
          case 3:
            message = popupTranslations.AccountNoField;
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
      <Container className="update_child">
        <Row className="justify-content-md-center">
          <Col md={6}>
            <div className={'update_child_inst'}>
              {translations.update_child_inst}
            </div>

            <Form.Group controlId="registerChildName">
              <Form.Label>{translations.child_name}</Form.Label>
              <Form.Control
                type="text"
                placeholder={translations.child_name}
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="registerChildBirthdate">
              <Form.Label>{translations.birthdate}</Form.Label>
              <Form.Control
                type="date"
                placeholder={translations.birthdate}
                value={birthdate}
                onChange={e => setBirthdate(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="registerChildGender">
              <Form.Label>{translations.gender}</Form.Label>
              <Form.Select
                value={gender ?? ''}
                onChange={e =>
                  setGender(
                    e.target.value !== '' ? parseInt(e.target.value, 10) : null,
                  )
                }
              >
                <option value="">{translations.select_gender}</option>
                <option value={0}>{translations.boy}</option>
                <option value={1}>{translations.girl}</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="registerChildNationality">
              <Form.Label>{translations.nationality}</Form.Label>
              <Form.Select
                value={nationality ?? ''}
                onChange={e =>
                  setNationality(
                    e.target.value !== '' ? parseInt(e.target.value, 10) : null,
                  )
                }
              >
                <option value="">{translations.select_nationality}</option>
                <option value={1}>{translations.finland}</option>
                <option value={2}>{translations.korea}</option>
                <option value={3}>{translations.usa}</option>
              </Form.Select>
            </Form.Group>

            <Form.Group controlId="registerChildDescription">
              <Form.Label>{translations.description}</Form.Label>
              <Form.Control
                type="text"
                placeholder={translations.description}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </Form.Group>
            <div className="his_delete">
              <div>
                <Button
                  variant="primary"
                  className="mt-3"
                  onClick={() => updateChildRecord()}
                >
                  {translations.update}
                </Button>
              </div>
              <div>
                <Button
                  variant="secondary"
                  className="mt-3 ms-2"
                  onClick={() => closeDeleteUI()}
                >
                  {translations.cancel}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UpdateChildUI;
