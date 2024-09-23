import React, {useState, useEffect, useRef} from 'react';
import axios, {AxiosError} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { AdminMainTranslations } from '../translation/AdminMain';
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";
import { getToken, getDecodedToken } from "../util/jwtDecoder";
import {Button, Container, Form} from "react-bootstrap";
import {setNoticePopUp} from "../redux/slice";
import jwtChecker from "../util/jwtChecker";

const AdminDataManage = () => {

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const navigagte = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;
    const admin = getDecodedToken()?.admin;

    const translations = AdminMainTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];

    interface Country {
        id: number;
        national_code: string;
        name_english: string;
        name_original: string;
    }

    interface VaccineName {
        id: number;
        vaccine_name: string;
    }

    interface CountryVaccineDataResponse {
        countries: Country[];
        vaccines: VaccineName[];
    }

    const infos = useRef<CountryVaccineDataResponse | null>(null);
    const [filteredInfos, setFilteredInfos] = useState<CountryVaccineDataResponse | null>(null);

    const [vaccineName, setVaccineName] = useState<string | null>(``);
    const [vaccineNationalCode, setVaccineNationalCode] = useState<number | null>(null);
    const [vaccinePeriodical, setVaccinePeriodical] = useState<boolean>(false);
    const [vaccineMinPeriodType, setVaccineMinPeriodType] = useState<string>(``);
    const [vaccineMinPeriod, setVaccineMinPeriod] = useState<number | null>(null);
    const [vaccineMaxPeriodType, setVaccineMaxPeriodType] = useState<string>(``);
    const [vaccineMaxPeriod, setVaccineMaxPeriod] = useState<number | null>(null);
    const [vaccineRound, setVaccineRound] = useState<number | null>(null);
    const [vaccineDescription, setVaccineDescription] = useState<string>(``);

    useEffect(() => {
        const mainDataFetch = async () => {

            try {

                const response = await axios.get<CountryVaccineDataResponse>(`${apiUrl}/admin/manage`, {
                    headers: { Authorization: `Bearer ${getToken()}` }
                });

                infos.current = response.data;
                setFilteredInfos(response.data);

            } catch (error) {
                const axiosError = error as AxiosError<{ adminManageRes: number }>;
                if (axiosError.response) {
                    const adminManageRes = axiosError.response.data.adminManageRes;
                    let message = ``;
                    switch (adminManageRes) {
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
            navigagte("/");
        }else if(!admin){
            navigagte("/main");
        }
        else{
            mainDataFetch();
        }

    }, []);

    useEffect(() => {

    }, [infos]);

    const periodOptions = (isPeriod:boolean, periodType: string | null) => {

        const options = [];

        if(isPeriod){
            if(periodType === "M"){

                for (let i = 1; i < 193; i++) {
                    options.push(<option key={i} value={i}>{i}</option>)
                }

            } else{
                for (let i = 1; i < 17; i++) {

                    options.push(<option key={i} value={i}>{i}</option>)

                }
            }
        }else{
            for (let i = 1; i < 33; i++) {

                options.push(<option key={i} value={i}>{i}</option>)

            }
        }


        return (
            options
        )

    }

    const countryVaccineInformation = (info: CountryVaccineDataResponse) => {

        return (
            <>
                <div className={"admin_main_category"}>

                </div>
                <div>
                    {info.countries.map(country => (
                        <div key={country.id}>
                            <div>
                                {country.id}
                            </div>
                            <div>
                                {country.national_code}
                            </div>
                            <div>
                                {country.name_english}
                            </div>
                            <div>
                                {country.name_original}
                            </div>

                        </div>
                    ))}
                </div>

                <div>
                    <div>
                        <Form.Select
                            onChange={(e) => setVaccineNationalCode(parseInt(e.target.value, 10))}
                            value=""
                            size="sm"
                            className="footer_language"
                        >
                            <option value="">Select Vaccine National Code</option>
                            {info.countries.map(country => (
                                <option key={country.id} value={country.id}>{country.name_original}</option>
                            ))}

                        </Form.Select>
                    </div>
                    <div>
                        <Form.Select
                            onChange={(e) => setVaccineName(e.target.value)}
                            value=""
                            size="sm"
                            className="footer_language"
                        >
                            <option value="">Select Vaccine</option>
                            {info.vaccines.map(vaccine => (
                                <option key={vaccine.id} value={vaccine.vaccine_name}>{vaccine.vaccine_name}</option>
                            ))}
                        </Form.Select>
                    </div>
                    <div>
                        <span>
                            <Form.Check
                                type="checkbox"
                                label={"is_prediodical"}
                                checked={vaccinePeriodical}
                                onChange={(e) => setVaccinePeriodical(e.target.checked)}
                            />
                        </span>
                    </div>
                    <div>
                        <Form.Select
                            onChange={(e) => setVaccineMinPeriodType(e.target.value)}
                            value=""
                            size="sm"
                            className="footer_language"
                        >
                            <option value="">Select Minimum Period Type</option>
                            <option value="M">Month</option>
                            <option value="Y">Year</option>
                        </Form.Select>
                    </div>
                    <div>
                        <Form.Select
                            onChange={(e) => setVaccineMinPeriod(parseInt(e.target.value, 10))}
                            value=""
                            size="sm"
                            className="footer_language"
                        >
                            <option value="">Select Minimum Period</option>
                            {
                                vaccineMinPeriodType && periodOptions(true, vaccineMinPeriodType)
                            }

                        </Form.Select>
                    </div>

                    {vaccinePeriodical ?
                        <>
                            <div>
                                <Form.Select
                                    onChange={(e) => setVaccineMaxPeriodType(e.target.value)}
                                    value=""
                                    size="sm"
                                    className="footer_language"
                                >
                                    <option value="">Select Maximum Period Type</option>
                                    <option value="M">Month</option>
                                    <option value="Y">Year</option>
                                </Form.Select>
                            </div>
                            <div>
                                <Form.Select
                                    onChange={(e) => setVaccineMaxPeriod(parseInt(e.target.value, 10))}
                                    value=""
                                    size="sm"
                                    className="footer_language"
                                >
                                    <option value="">Select Maximum Period</option>
                                    {
                                        vaccineMaxPeriodType && periodOptions(true, vaccineMaxPeriodType)
                                    }
                                </Form.Select>
                            </div>
                        </>
                        :
                        null
                    }

                    <div>
                        <Form.Select
                            onChange={(e) => setVaccineRound(parseInt(e.target.value, 10))}
                            value=""
                            size="sm"
                            className="footer_language"
                        >
                            <option value="">Select Vaccine Round</option>
                            {
                                periodOptions(false, null)
                            }

                        </Form.Select>
                    </div>
                    <div>
                        <Form.Control
                            type="text"
                            placeholder={`description`}
                            value={vaccineDescription}
                            onChange={(e) => setVaccineDescription(e.target.value)}
                        />
                    </div>
                </div>

            </>
        );
    };

    if (infos === null) {
        return <></>
    }

    return (
        <Container className="Main center_ui">
            <Container className={"main_top"}>
                <div className={"mt_elem"}>
                    <p className={"main_greeting"}>
                        {translations.admin_main}
                    </p>
                </div>

            </Container>
            {filteredInfos && countryVaccineInformation(filteredInfos)}


        </Container>
    );
};

export default AdminDataManage;