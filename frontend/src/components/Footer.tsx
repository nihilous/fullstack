import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../redux/slice';
import { RootState } from '../store';
import { Form, Container, Row, Col } from 'react-bootstrap';
import { FooterTranslations } from '../translation/Footer';

const Footer = () => {
    const dispatch = useDispatch();
    const language = useSelector((state: RootState) => state.app.language);
    const translations = FooterTranslations[language];

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setLanguage(event.target.value as 'FIN' | 'ENG' | 'KOR'));
    };

    return (
        <Container fluid className="fixed-bottom footer">
            <Row className="justify-content-end">
                <Col xs="auto">
                    <Form className="d-flex align-items-center">
                        <Form.Label className="mb-0 text-nowrap">{translations.language}</Form.Label>
                        <Form.Select
                            value={language}
                            onChange={handleLanguageChange}
                            size="sm"
                            className="footer_language"
                        >
                            <option value="FIN">Suomi</option>
                            <option value="ENG">English</option>
                            <option value="KOR">한국어</option>
                        </Form.Select>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default Footer;