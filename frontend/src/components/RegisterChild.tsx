import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { RegisterChildTranslations } from '../translation/RegisterChild';
import { Form, Button, Container, Col, Row } from 'react-bootstrap';
import { getToken, getDecodedToken, decodeToken } from "../util/jwtDecoder";
import {Link, useNavigate} from "react-router-dom";

const RegisterChild = () => {
    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const naviagte = useNavigate();
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
                console.error('Error Fetching existing data:', error);
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

            console.log(birthdate);

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

            clearState();

        } catch (error) {
            console.error('Error joining:', error);
        }
    };

    const showingChildInfo = (children: UserDetailProperty[] ) => {
        return children.map((child) => {

            const formatDate = (dateString: string) => {
                const [year, month, day] = dateString.split('T')[0].split('-');
                return { year, month, day };
            };

            const yyyy_mm_dd = formatDate(child.birthdate as string);

            const formatNationality = (nationalityString: string) => {
                switch (nationalityString){
                    case "FIN":
                        return translations.finland;
                    case "KOR":
                        return translations.korea;
                }
            };

            return (

                <Container key={child.id} className="child-info">
                    <h3>{`${translations.name} : ${child.name}`}</h3>
                    <Container>
                        <Container>
                            {`${translations.birthdate} : ${language === "FIN" ?
                                yyyy_mm_dd.day + " " + yyyy_mm_dd.month + " " + yyyy_mm_dd.year
                                :
                                yyyy_mm_dd.year + " " + yyyy_mm_dd.month + " " + yyyy_mm_dd.day }`}
                        </Container>
                        <Container>
                            {`${translations.gender} ${child.gender }`}
                        </Container>
                        <Container>
                            {`${translations.nationality} ${formatNationality(child.nationality as string) }`}
                        </Container>
                        <Container>
                            {`${translations.description} ${child.description }`}
                        </Container>
                        <Container>
                            <Link  to={`/history/${child.id}`} className="child-link">
                                See Vaccination History
                            </Link>
                        </Container>
                        <Container>
                            <Link  to={`/notice/${child.id}`} className="child-link">
                                See Vaccination Recommendations
                            </Link>
                        </Container>
                    </Container>
                </Container>

            );
        });
    };

    return (
        <Container>
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
                showingChildInfo(child)
            ) : (
                <p>No child data available.</p>
            )}

        </Container>
    );
};

export default RegisterChild;