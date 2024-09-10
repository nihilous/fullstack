import React, {useEffect, useState} from 'react';
import axios, {AxiosError} from 'axios';
import Cookies from 'js-cookie';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { RegisterChildTranslations } from '../translation/RegisterChild';
import { Form, Button, Container, Col, Row } from 'react-bootstrap';
import { getToken, getDecodedToken, decodeToken } from "../util/jwtDecoder";
import { useNavigate} from "react-router-dom";
import {setNoticePopUp} from "../redux/slice";
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";
import jwtChecker from "../util/jwtChecker";

const RegisterChild = () => {
    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const naviagte = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;

    interface UserDetailProperty {
        id: number;
        name: string | null;
        birthdate: string | null;
        gender: number | null;
        nationality: string | null;
        description: string | null;
        nickname: string | null;
    }

    const [name, setName] = useState<string>(``);
    const [birthdate, setBirthdate] = useState<string>(``);
    const [gender, setGender] = useState<number | null>(null);
    const [nationality, setNationality] = useState<string>(``);
    const [description, setDescription] = useState<string>(``);
    const [child, setChild] = useState<UserDetailProperty[]>([]);
    const translations = RegisterChildTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];

    const clearState = () => {
        setName('');
        setBirthdate('');
        setGender(null);
        setNationality('');
        setDescription('');
    }

    useEffect(() => {
        const existingDataFetch = async () => {

            try {

                const response = await axios.get(`${apiUrl}/user/${getDecodedToken()?.userId}`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });

                if (response?.data?.user_detail) {

                    const record = response?.data?.record;
                    const recordArray = Object.values(record) as UserDetailProperty[];

                    setChild(recordArray);
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
        if(userId === undefined){
            naviagte("/");
        }else{
            existingDataFetch();
        }


    }, []);

    const handleRegisterSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {

            const response = await axios.post(`${apiUrl}/user/${getDecodedToken()?.userId}`, {
                name: name,
                description: description,
                gender: gender,
                birthdate: birthdate,
                nationality: nationality,
            }, {headers: { Authorization: `Bearer ${getToken()}` }});

            Cookies.set('token', response.data.token);
            const decoded_info = decodeToken(response.data.token);


            if (decoded_info?.record) {
                setChild(decoded_info.record);
            }
            dispatch(setNoticePopUp({
                on: true,
                is_error: false,
                message: popupTranslations.ChildRegiSuccess
            }));

            clearState();

        } catch (error) {

            const axiosError = error as AxiosError<{ childRes: number }>;
            if (axiosError.response) {

                const childRegiRes = axiosError.response.data.childRes;
                let message = ``;
                switch (childRegiRes) {
                    case 1:
                        message = popupTranslations.ChildRegiRequired;
                        break;
                    case 2:
                        message = popupTranslations.injection;
                        break;
                    case 3:
                        message = popupTranslations.noAuthority;
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

    const showingChildInfo = (children: UserDetailProperty[] ) => {
        return children.map((child) => {

            const formatDate = (dateString: string) => {
                const [year, month, day] = dateString.split('T')[0].split('-');
                return { year, month, day };
            };

            const formatNationality = (nationalityString: string) => {
                switch (nationalityString){
                    case "FIN":
                        return translations.finland;
                    case "KOR":
                        return translations.korea;
                    case "ENG":
                        return translations.usa;
                }
            };

            const yyyy_mm_dd = formatDate(child.birthdate as string);
            return (

                <div key={child.id} className="child-info cr_info_elem">
                    <div className={"mie_info_wrapper"}>
                        <div className={"mie_info"}>
                            <span>{`${translations.name}`}</span>
                            <span>{`${child.name}`}</span>
                        </div>
                        <div className={"mie_info"}>
                            <span>{`${translations.birthdate}`}</span>
                            <span>{`${language === "FIN" ?
                                yyyy_mm_dd.day + " " + yyyy_mm_dd.month + " " + yyyy_mm_dd.year
                                :
                                yyyy_mm_dd.year + " " + yyyy_mm_dd.month + " " + yyyy_mm_dd.day}`}</span>
                        </div>
                        <div className={"mie_info"}>
                            <span>{`${translations.gender}`}</span>
                            <span>{`${child.gender === 0 ? translations.boy : translations.girl}`}</span>

                        </div>
                        <div className={"mie_info"}>
                            <span>{`${translations.nationality}`}</span>
                            <span>{`${formatNationality(child.nationality as string)}`}</span>

                        </div>
                        <div className={"mie_info"}>
                            <span>{`${translations.description}`}</span>
                            <span>{`${child.description}`}</span>
                        </div>
                    </div>
                    <div className={"mie_button_wrapper"}>
                        <Button href={`/history/${child.id}`} className="btn btn-primary mie_button">
                            {`${translations.history}`}
                        </Button>
                        <Button href={`/notice/${child.id}`} className="btn btn-primary mie_button">
                            {`${translations.schedule}`}
                        </Button>
                        <div className={"clear"}></div>
                    </div>
                </div>

            );
        });
    };

    return (
        <Container className="center_ui">
            <Container className="RegisterChild">
                <Row className="justify-content-md-center">
                    <Col md={6}>

                        <Form onSubmit={handleRegisterSubmit}>
                            <Form.Group controlId="registerChildName">
                                <Form.Label>{translations.name}</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={translations.name}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="registerChildBirthdate">
                                <Form.Label>{translations.birthdate}</Form.Label>
                                <Form.Control
                                    type="date"
                                    placeholder={translations.birthdate}
                                    value={birthdate}
                                    onChange={(e) => setBirthdate(e.target.value)}
                                />
                            </Form.Group>

                            <Form.Group controlId="registerChildGender">
                                <Form.Label>{translations.gender}</Form.Label>
                                <Form.Select
                                    value={gender ?? ""}
                                    onChange={(e) => setGender(parseInt(e.target.value, 10))}
                                >
                                    <option value="">{translations.select_gender}</option>
                                    <option value={0}>{translations.boy}</option>
                                    <option value={1}>{translations.girl}</option>
                                </Form.Select>
                            </Form.Group>


                            <Form.Group controlId="registerChildNationality">
                                <Form.Label>{translations.nationality}</Form.Label>
                                <Form.Select
                                    value={nationality ?? ""}
                                    onChange={(e) => setNationality(e.target.value)}
                                >
                                    <option value="">{translations.select_nationality}</option>
                                    <option value="FIN">{translations.finland}</option>
                                    <option value="KOR">{translations.korea}</option>
                                    <option value="ENG">{translations.usa}</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group controlId="registerChildDescription">
                                <Form.Label>{translations.description}</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder={translations.description}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="mt-3">
                                {translations.register}
                            </Button>
                            <Button variant="secondary" className="mt-3 ms-2" onClick={() => clearState()}>
                                {translations.cancel}
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>

            { child.length > 0 ?  (
                <div className={"register_child_elem_wrapper"}>
                    {showingChildInfo(child)}
                </div>

            ) : (
                <div className={"register_child_elem_wrapper rc_text"}>{translations.no_info}</div>
            )}

        </Container>
    );
};

export default RegisterChild;