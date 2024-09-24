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
        existing_countries: Country[];
        vaccines: VaccineName[];
    }

    const infos = useRef<CountryVaccineDataResponse | null>(null);
    const [filteredInfos, setFilteredInfos] = useState<CountryVaccineDataResponse | null>(null);

    const [vaccineName, setVaccineName] = useState<string | null>(``);
    const [vaccineNationalCode, setVaccineNationalCode] = useState<number | null>(null);
    const [vaccinePeriodical, setVaccinePeriodical] = useState<number>(2);
    const [vaccineMinPeriodType, setVaccineMinPeriodType] = useState<string>(``);
    const [vaccineMinPeriod, setVaccineMinPeriod] = useState<number | null>(null);
    const [vaccineMaxPeriodType, setVaccineMaxPeriodType] = useState<string>(``);
    const [vaccineMaxPeriod, setVaccineMaxPeriod] = useState<number | null>(null);
    const [vaccineRound, setVaccineRound] = useState<number | null>(null);
    const [vaccineDescription, setVaccineDescription] = useState<string>(``);

    const [editNational, setEditNational] = useState<boolean>(false);
    const [editNationalNum, setEditNationalNum] = useState<number | null>(null);
    const [editNationalId, setEditNationalId] = useState<number | null>(null);
    const [editNationalCode, setEditNationalCode] = useState<string>(``);
    const [editNationalEng, setEditNationalEng] = useState<string>(``);
    const [editNationalOri, setEditNationalOri] = useState<string>(``);

    const [addNational, setAddNational] = useState<boolean>(false);
    const [addNationalId, setAddNationalId] = useState<number | null>(null);
    const [addNationalCode, setAddNationalCode] = useState<string>(``);
    const [addNationalEng, setAddNationalEng] = useState<string>(``);
    const [addNationalOri, setAddNationalOri] = useState<string>(``);

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

    const editCountry = (id: number) => {
        setEditNationalNum(id);
        setEditNational(true);
    }

    const saveModifiedCountry = (id: number) => {
        setEditNationalNum(id);
        setEditNational(false);
    }

    const cancelModifiedCountry = (id: number) => {
        setEditNationalNum(null);
        setEditNational(false);
    }

    const addCountry = () => {
        setAddNational(true)
    }

    const saveAddCountry = async () => {

        try {

            const params = {
                id: addNationalId, code :addNationalCode, eng: addNationalEng, ori: addNationalOri
            }
            const response = await axios.post<CountryVaccineDataResponse>(`${apiUrl}/admin/manage/add/country`,params ,{
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            console.log(response.data);

            setAddNational(false)

        } catch (error) {
            const axiosError = error as AxiosError<{ adminAddCountry: number }>;
            if (axiosError.response) {
                const adminAddCountry = axiosError.response.data.adminAddCountry;
                let message = ``;
                switch (adminAddCountry) {
                    case 1:
                        message = popupTranslations.noAuthority;
                        break;
                    case 2:
                        message = popupTranslations.injection;
                        break;
                    case 3:
                        message = "param required"
                        break;
                    case 4:
                        message = "id exists";
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

    }

    const cancelAddCountry = () => {
        setAddNational(false)
    }

    const addVaccineData = () => {

    }

    const countryVaccineInformation = (info: CountryVaccineDataResponse) => {

        return (
            <>
                <div className={"admin_main_category"}>

                </div>
                <div>
                    <div style={{display:"flex",alignContent:"center"}}>
                        <div>
                            id
                        </div>
                        <div>
                            national code
                        </div>
                        <div>
                            english name
                        </div>
                        <div>
                            original name
                        </div>

                    </div>

                    <div style={{marginTop: "40px"}}>
                        {info.existing_countries.map(country => (
                            country.id === editNationalNum && editNational ?
                                <div key={country.id} style={{display: "flex", alignContent: "center"}}>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={`${country.id}`}
                                            value={country.id}
                                            onChange={(e) => setEditNationalId(parseInt(e.target.value, 10))}
                                        />
                                    </div>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={`${country.national_code}`}
                                            value={country.national_code}
                                            onChange={(e) => setEditNationalCode(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={`${country.name_english}`}
                                            value={country.name_english}
                                            onChange={(e) => setEditNationalEng(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={`${country.name_original}`}
                                            value={country.name_original}
                                            onChange={(e) => setEditNationalOri(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Button onClick={() => saveModifiedCountry(country.id)}>Save</Button>
                                    </div>
                                    <div>
                                        <Button onClick={() => cancelModifiedCountry(country.id)}>Cancel</Button>
                                    </div>
                                </div>
                                :

                                <div key={country.id} style={{display: "flex", alignContent: "center"}}>
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
                                    <div>
                                        <Button onClick={() => editCountry(country.id)}>Edit</Button>
                                    </div>
                                    <div>
                                        <Button>Delete</Button>
                                    </div>
                                </div>
                        ))}
                    </div>
                    <div>
                        <div style={{display: "flex", alignContent: "center", marginTop: "40px"}}>
                            {addNational ?
                                <>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={`national id`}
                                            value={addNationalId !== null ? addNationalId : ""}
                                            onChange={(e) => e.target.value !== "" ? setAddNationalId(parseInt(e.target.value, 10)) : setAddNationalId(null)}
                                        />
                                    </div>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={`national code`}
                                            value={addNationalCode}
                                            onChange={(e) => setAddNationalCode(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={`english name`}
                                            value={addNationalEng}
                                            onChange={(e) => setAddNationalEng(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={`original name`}
                                            value={addNationalOri}
                                            onChange={(e) => setAddNationalOri(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Button onClick={() => saveAddCountry()}>Save</Button>
                                    </div>
                                    <div>
                                        <Button onClick={() => cancelAddCountry()}>Cancel</Button>
                                    </div>
                                </>
                                :
                                <div>
                                    <Button onClick={() => addCountry()}>Add Country</Button>
                                </div>
                            }

                        </div>
                    </div>
                </div>

                <div style={{alignContent: "center", marginTop: "40px"}}>
                    <div>
                    <Form.Select
                            onChange={(e) => setVaccineNationalCode(e.target.value !== null ? parseInt(e.target.value, 10) : 0)}
                            value={vaccineNationalCode !== null ? vaccineNationalCode as number : ""}
                            size="sm"
                            className="footer_language"
                        >
                            <option value="">Select Vaccine National Code</option>
                            {info.existing_countries.map(country => (
                                <option key={country.id} value={country.id}>{country.name_original}</option>
                            ))}

                        </Form.Select>
                    </div>
                    <div>
                        <Form.Select
                            onChange={(e) => setVaccineName(e.target.value)}
                            value={vaccineName !== "" ? vaccineName as string : ""}
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
                        <Form.Select
                            onChange={(e) => setVaccinePeriodical(parseInt(e.target.value))}
                            value={vaccinePeriodical ? "periodical" : "none periodical"}
                            size="sm"
                            className="footer_language"
                        >
                            <option value={2}>Is Periodical</option>
                            <option value={1}>periodical</option>
                            <option value={0}>none periodical</option>
                        </Form.Select>
                    </div>
                    <div>
                        <Form.Select
                            onChange={(e) => setVaccineMinPeriodType(e.target.value)}
                            value={vaccineMinPeriodType !== "" ? vaccineMinPeriodType as string : ""}
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
                            value={vaccineMinPeriod !== null ? vaccineMinPeriod.toString() : ""}
                            size="sm"
                            className="footer_language"
                        >
                            <option value={0}>Select Minimum Period</option>
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
                                    value={vaccineMaxPeriodType !== "" ? vaccineMaxPeriodType as string : ""}
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
                                    value={vaccineMaxPeriod !== null ? vaccineMaxPeriod.toString() : ""}
                                    size="sm"
                                    className="footer_language"
                                >
                                    <option value={0}>Select Maximum Period</option>
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
                            value={vaccineRound !== null ? vaccineRound.toString() : ""}
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

                <div>
                    {`${vaccineNationalCode !== null ? vaccineNationalCode : ""} ${vaccineName} ${vaccinePeriodical !== 2 ? vaccinePeriodical === 1 ? "주기적" : "비주기적" : ""} ${vaccineMinPeriodType} ${vaccineMinPeriod !== null && vaccineMinPeriod !== 0 ? vaccineMinPeriod : ""} ${vaccinePeriodical === 1 ? vaccineMaxPeriodType : ""} ${vaccinePeriodical === 1 ? vaccineMaxPeriod !== null && vaccineMaxPeriod !== 0 ? vaccineMaxPeriod : "" : ""} ${vaccineRound !== null ? vaccineRound : ""} ${vaccineDescription}`}
                </div>
                <div>
                    { vaccineNationalCode !== null && vaccineName !== "" && vaccinePeriodical !== 2 && vaccineMinPeriodType !== "" && vaccineMinPeriod !== null  && vaccineMinPeriod !== 0 && (vaccinePeriodical === 1 ? vaccineMaxPeriodType !== "" && vaccineMaxPeriod !== null && vaccineMaxPeriod !== 0 : true) && vaccineRound !== null && vaccineDescription !== "" ?
                        <Button onClick={() => addVaccineData()}>생성</Button>
                        :
                        null
                    }
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