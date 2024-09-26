import React, {useState, useEffect, useRef} from 'react';
import axios, {AxiosError} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { AdminManageTranslations } from '../translation/AdminManage';
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";
import { getToken, getDecodedToken } from "../util/jwtDecoder";
import {Button, Container, Form} from "react-bootstrap";
import {setNoticePopUp} from "../redux/slice";
import jwtChecker from "../util/jwtChecker";

import Tooltip from '@mui/material/Tooltip';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import PublicIcon from '@mui/icons-material/Public';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NightlightRoundedIcon from '@mui/icons-material/NightlightRounded';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import AvTimerRoundedIcon from '@mui/icons-material/AvTimerRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';

const AdminDataManage = () => {

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const navigagte = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;
    const admin = getDecodedToken()?.admin;

    const translations = AdminManageTranslations[language];
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

    interface Vaccines {
        id: number;
        vaccine_national_code: number;
        vaccine_name: string;
        vaccine_is_periodical: boolean;
        vaccine_minimum_period_type: string;
        vaccine_minimum_recommend_date: number;
        vaccine_maximum_period_type: string | null;
        vaccine_maximum_recommend_date: number | null;
        vaccine_round: number;
        vaccine_description: string;
        country_name_original: string;
    }

    interface CountryVaccineDataResponse {
        existing_countries: Country[];
        temporal_countries: Country[];
        existing_vaccines: VaccineName[];
        temporal_vaccines: Vaccines[];
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

    const [editVaccine, setEditVaccine] = useState<boolean>(false);
    const [editVaccineNum, setEditVaccineNum] = useState<number | null>(null);
    const [editVaccineName, setEditVaccineName] = useState<string | null>(``);
    const [editVaccineNationalCode, setEditVaccineNationalCode] = useState<number | null>(null);
    const [editVaccinePeriodical, setEditVaccinePeriodical] = useState<number>(2);
    const [editVaccineMinPeriodType, setEditVaccineMinPeriodType] = useState<string>(``);
    const [editVaccineMinPeriod, setEditVaccineMinPeriod] = useState<number | null>(null);
    const [editVaccineMaxPeriodType, setEditVaccineMaxPeriodType] = useState<string>(``);
    const [editVaccineMaxPeriod, setEditVaccineMaxPeriod] = useState<number | null>(null);
    const [editVaccineRound, setEditVaccineRound] = useState<number | null>(null);
    const [editVaccineDescription, setEditVaccineDescription] = useState<string>(``);

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

    const [deleteNational, setDeleteNational] = useState<boolean>(false);
    const [deleteNationalId, setDeleteNationalId] = useState<number | null>(null);

    const [deleteVaccine, setDeleteVaccine] = useState<boolean>(false);
    const [deleteVaccineId, setDeleteVaccineId] = useState<number | null>(null);

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

    useEffect(() => {

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

    const saveModifiedCountry = async (id: number) => {

        try {

            const params = {
                ori_id: id, new_id: editNationalId, code :editNationalCode, eng: editNationalEng, ori: editNationalOri
            }
            await axios.put<CountryVaccineDataResponse>(`${apiUrl}/admin/manage/update/country`,params ,{
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            await mainDataFetch();
            setEditNational(false);

        } catch (error) {
            const axiosError = error as AxiosError<{ adminUpdateCountry: number }>;
            if (axiosError.response) {
                const adminUpdateCountry = axiosError.response.data.adminUpdateCountry;
                let message = ``;
                switch (adminUpdateCountry) {
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
                    case 5:
                        message = "no record to update";
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
            await axios.post<CountryVaccineDataResponse>(`${apiUrl}/admin/manage/add/country`,params ,{
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            await mainDataFetch();
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

    const deleteCountry = (id: number) => {
        setDeleteNationalId(id);
        setDeleteNational(!deleteNational)
    }

    const saveDeleteCountry = async (id: number) => {

        try {

            await axios.delete<CountryVaccineDataResponse>(`${apiUrl}/admin/manage/delete/country/${id}` ,{
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            await mainDataFetch();

            setDeleteNationalId(null);
            setDeleteNational(!deleteNational)

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
                        message = "no record to delete";
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

    const deleteCountryUI = () => {
        return(
            <div className={"popup_form"}>
                <Container>

                    <div style={{display: "flex", alignContent: "center"}}>
                        <div style={{width:'50%', textAlign: 'center'}}>
                            <Button variant="primary" type="submit" className="mt-3" onClick={() => saveDeleteCountry(deleteNationalId as number)}>
                                {translations.delete}
                            </Button>
                        </div>
                        <div style={{width: '50%', textAlign: 'center'}}>
                            <Button variant="secondary" className="mt-3 ms-2" onClick={() => setDeleteNational(!deleteNational)}>
                                {translations.cancel}
                            </Button>
                        </div>


                    </div>



                </Container>
            </div>
        )
    };

    const cancelAddCountry = () => {
        setAddNational(false)
    }

    const addVaccineData = async () => {

        try {
            const is_periodical = Boolean(vaccinePeriodical);

            const params = is_periodical ?
                {
                    vaccine_national_code: vaccineNationalCode,
                    vaccine_name: vaccineName,
                    vaccine_is_periodical: vaccinePeriodical,
                    vaccine_minimum_period_type: vaccineMinPeriodType,
                    vaccine_minimum_recommend_date: vaccineMinPeriod,
                    vaccine_maximum_period_type: vaccineMaxPeriodType,
                    vaccine_maximum_recommend_date: vaccineMaxPeriod,
                    vaccine_round: vaccineRound,
                    vaccine_description: vaccineDescription,
                }
                :
                {
                    vaccine_national_code: vaccineNationalCode,
                    vaccine_name: vaccineName,
                    vaccine_is_periodical: vaccinePeriodical,
                    vaccine_minimum_period_type: vaccineMinPeriodType,
                    vaccine_minimum_recommend_date: vaccineMinPeriod,
                    vaccine_maximum_period_type: null,
                    vaccine_maximum_recommend_date: null,
                    vaccine_round: vaccineRound,
                    vaccine_description: vaccineDescription,
                }

                await axios.post<CountryVaccineDataResponse>(`${apiUrl}/admin/manage/add/vaccine`,params ,{
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            await mainDataFetch();

            setVaccineNationalCode(null);
            setVaccineName("");
            setVaccinePeriodical(2);
            setVaccineMinPeriodType("");
            setVaccineMinPeriod(null);
            setVaccineMaxPeriodType("");
            setVaccineMaxPeriod(null);
            setVaccineRound(null);
            setVaccineDescription("");


        } catch (error) {
            const axiosError = error as AxiosError<{ adminAddVaccine: number }>;
            if (axiosError.response) {
                const adminAddVaccine = axiosError.response.data.adminAddVaccine;
                let message = ``;
                switch (adminAddVaccine) {
                    case 1:
                        message = popupTranslations.noAuthority;
                        break;
                    case 2:
                        message = popupTranslations.injection;
                        break;
                    case 3:
                        message = "param required"
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

    const editVaccineInfo = (id: number, nat_code: number, name: string, is_periodical: boolean, min_type: string, min_date: number, max_type: string, max_date: number | null, round: number, desc: string) => {
        setEditVaccineNum(id);
        setEditVaccineNationalCode(nat_code);
        setEditVaccineName(name);
        setEditVaccinePeriodical(is_periodical ? 1 : 0);
        setEditVaccineMinPeriodType(min_type);
        setEditVaccineMinPeriod(min_date);
        setEditVaccineMaxPeriodType(max_type);
        setEditVaccineMaxPeriod(max_date);
        setEditVaccineRound(round);
        setEditVaccineDescription(desc);
        setEditVaccine(true);
    }

    const saveModifiedVaccine = async () => {
        try {
            const is_periodical = Boolean(vaccinePeriodical);

            const params = is_periodical ?
                {
                    vaccine_id: editVaccineNum,
                    vaccine_national_code: editVaccineNationalCode,
                    vaccine_name: editVaccineName,
                    vaccine_is_periodical: editVaccinePeriodical,
                    vaccine_minimum_period_type: editVaccineMinPeriodType,
                    vaccine_minimum_recommend_date: editVaccineMinPeriod,
                    vaccine_maximum_period_type: editVaccineMaxPeriodType,
                    vaccine_maximum_recommend_date: editVaccineMaxPeriod,
                    vaccine_round: editVaccineRound,
                    vaccine_description: editVaccineDescription,
                }
                :
                {
                    vaccine_id: editVaccineNum,
                    vaccine_national_code: editVaccineNationalCode,
                    vaccine_name: editVaccineName,
                    vaccine_is_periodical: editVaccinePeriodical,
                    vaccine_minimum_period_type: editVaccineMinPeriodType,
                    vaccine_minimum_recommend_date: editVaccineMinPeriod,
                    vaccine_maximum_period_type: null,
                    vaccine_maximum_recommend_date: null,
                    vaccine_round: editVaccineRound,
                    vaccine_description: editVaccineDescription,
                }

                await axios.put<CountryVaccineDataResponse>(`${apiUrl}/admin/manage/update/vaccine`,params ,{
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            await mainDataFetch();

            setEditVaccineNum(null);
            setEditVaccineNationalCode(null);
            setEditVaccineName("");
            setEditVaccinePeriodical(2);
            setEditVaccineMinPeriodType("");
            setEditVaccineMinPeriod(null);
            setEditVaccineMaxPeriodType("");
            setEditVaccineMaxPeriod(null);
            setEditVaccineRound(null);
            setEditVaccineDescription("");
            setEditVaccine(false);


        } catch (error) {
            const axiosError = error as AxiosError<{ adminModifyVaccine: number }>;
            if (axiosError.response) {
                const adminModifyVaccine = axiosError.response.data.adminModifyVaccine;
                let message = ``;
                switch (adminModifyVaccine) {
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
                        message = "no record to update"
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

    const saveDeleteVaccine = async (id: number) => {

        try {

            await axios.delete<CountryVaccineDataResponse>(`${apiUrl}/admin/manage/delete/vaccine/${id}` ,{
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            await mainDataFetch();

            setDeleteVaccineId(null);
            setDeleteVaccine(!deleteVaccine)

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
                        message = "no record to delete";
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

    const cancelModifiedVaccine = () => {
        setEditVaccineNum(null);
        setEditVaccineNationalCode(null);
        setEditVaccineName("");
        setEditVaccinePeriodical(2);
        setEditVaccineMinPeriodType("");
        setEditVaccineMinPeriod(null);
        setEditVaccineMaxPeriodType("");
        setEditVaccineMaxPeriod(null);
        setEditVaccineRound(null);
        setEditVaccineDescription("");
        setEditVaccine(false);
    }

    const deleteVaccineRecord = (id: number) => {
        setDeleteVaccine(!deleteVaccine);
        setDeleteVaccineId(id);
    }

    const deleteVaccineUI = () => {
        return(
            <div className={"popup_form"}>
                <Container>

                    <div style={{display: "flex", alignContent: "center"}}>
                        <div style={{width:'50%', textAlign: 'center'}}>
                            <Button variant="primary" type="submit" className="mt-3" onClick={() => saveDeleteVaccine(deleteVaccineId as number)}>
                                {translations.delete}
                            </Button>
                        </div>
                        <div style={{width: '50%', textAlign: 'center'}}>
                            <Button variant="secondary" className="mt-3 ms-2" onClick={() => setDeleteVaccine(!deleteVaccine)}>
                                {translations.cancel}
                            </Button>
                        </div>


                    </div>



                </Container>
            </div>
        )
    };

    const countryVaccineInformation = (info: CountryVaccineDataResponse) => {

        return (
            <>

                <div>
                    <div className={`adminMangeTitle`}>
                        {translations.existing_country}
                    </div>
                    <div className={`adminManageCountryHeader`}>
                        <div>
                            {translations.id}
                        </div>
                        <div>
                            {translations.national_code}
                        </div>
                        <div>
                            {translations.name_english}
                        </div>
                        <div>
                            {translations.name_original}
                        </div>
                    </div>

                    <div className={`adminManageCountry`}>
                        {info.existing_countries.map(country => (


                            <div key={country.id} className={`amc_wrap`}>
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

                    <div className={`adminMangeTitle`}>
                        {translations.temporal_country}
                    </div>

                    <div className={`adminManageCountryHeader`}>
                        <div>
                            {translations.id}
                        </div>
                        <div>
                            {translations.national_code}
                        </div>
                        <div>
                            {translations.name_english}
                        </div>
                        <div>
                            {translations.name_original}
                        </div>
                    </div>

                    <div className={`adminManageCountry`}>
                        {info.temporal_countries.map(country => (
                            country.id === editNationalNum && editNational ?
                                <div key={country.id} className={`amc_edit_wrap`}>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={`${country.id}`}
                                            value={editNationalId !== null ? editNationalId : ""}
                                            onChange={(e) => e.target.value !== "" ? setEditNationalId(parseInt(e.target.value, 10)) : setEditNationalId(null)}
                                        />
                                    </div>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={`${country.national_code}`}
                                            value={editNationalCode !== "" ? editNationalCode : ""}
                                            onChange={(e) => setEditNationalCode(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={`${country.name_english}`}
                                            value={editNationalEng !== "" ? editNationalEng : ""}
                                            onChange={(e) => setEditNationalEng(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={`${country.name_original}`}
                                            value={editNationalOri !== "" ? editNationalOri : ""}
                                            onChange={(e) => setEditNationalOri(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Button onClick={() => saveModifiedCountry(country.id)}>{translations.save}</Button>
                                    </div>
                                    <div>
                                        <Button onClick={() => cancelModifiedCountry(country.id)}>{translations.cancel}</Button>
                                    </div>
                                </div>
                                :

                                <div key={country.id} className={`amc_wrap`}>
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
                                        <Button onClick={() => editCountry(country.id)}>{translations.edit}</Button>
                                    </div>
                                    <div>
                                        <Button onClick={() => deleteCountry(country.id)}>{translations.delete}</Button>
                                    </div>
                                </div>
                        ))}
                    </div>

                    <div className={`adminMangeTitle`}>
                        {translations.temporal_vaccine}
                    </div>

                    <div style={{marginTop: "40px"}}>
                        <div className={`manageTempVacHeader`} style={{display: "flex", alignContent: "center"}}>
                            <div>
                                <Tooltip title={translations.id}>
                                    <FormatListNumberedIcon/>
                                </Tooltip>
                            </div>
                            <div>
                                <Tooltip title={translations.national_code}>
                                    <PublicIcon/>
                                </Tooltip>
                            </div>
                            <div>
                                <Tooltip title={translations.vaccine_name}>
                                    <VaccinesIcon/>
                                </Tooltip>
                            </div>
                            <div>
                                <Tooltip title={translations.vaccine_is_periodical}>
                                    <CalendarMonthIcon/>
                                </Tooltip>
                            </div>
                            <div>
                                <Tooltip title={translations.vaccine_minimum_period_type}>
                                    <NightlightRoundedIcon/>
                                </Tooltip>
                            </div>
                            <div>
                                <Tooltip title={translations.vaccine_minimum_recommend_date}>
                                    <CalendarMonthIcon/>
                                </Tooltip>
                            </div>

                            <div>
                                <Tooltip title={translations.vaccine_maximum_period_type}>
                                    <WbSunnyRoundedIcon/>
                                </Tooltip>
                            </div>
                            <div>
                                <Tooltip title={translations.vaccine_maximum_recommend_date}>
                                    <CalendarMonthIcon/>
                                </Tooltip>
                            </div>

                            <div>
                                <Tooltip title={translations.vaccine_round}>
                                    <AvTimerRoundedIcon/>
                                </Tooltip>
                            </div>
                            <div>
                                <Tooltip title={translations.vaccine_description}>
                                    <DescriptionRoundedIcon/>
                                </Tooltip>
                            </div>
                            <div>
                                <Tooltip title={`Vaccine Info Modification`}>
                                    <AutoFixHighRoundedIcon/>
                                </Tooltip>
                            </div>
                            <div>
                                <Tooltip title={`Vaccine Info Delete`}>
                                    <DeleteForeverRoundedIcon/>
                                </Tooltip>
                            </div>
                        </div>


                        {info.temporal_vaccines.map(vaccine => (

                            vaccine.id === editVaccineNum && editVaccine ?
                                <div key={vaccine.id} className={`manageTempVacElem`}>
                                    <div>
                                        <Tooltip title={`temporal vaccine id`}>
                                            <span>{vaccine.id}</span>
                                        </Tooltip>

                                    </div>
                                    <div>
                                        <Tooltip title={`temporal vaccine national code`}>
                                            <Form.Select
                                                onChange={(e) => setEditVaccineNationalCode(e.target.value !== null ? parseInt(e.target.value, 10) : 0)}
                                                value={editVaccineNum !== null ? editVaccineNum as number : ""}
                                                size="sm"
                                                className="footer_language"
                                            >
                                                <option value="">Select Vaccine National Code</option>
                                                {info.existing_countries.map(country => (
                                                    <option key={country.id}
                                                            value={country.id}>{country.name_original}</option>
                                                ))}
                                                {info.temporal_countries.map(country => (
                                                    <option key={country.id}
                                                            value={country.id}>{country.name_original}</option>
                                                ))}

                                            </Form.Select>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip title={`temporal vaccine name`}>
                                            <Form.Select
                                                onChange={(e) => setEditVaccineName(e.target.value)}
                                                value={editVaccineName !== "" ? editVaccineName as string : ""}
                                                size="sm"
                                                className="footer_language"
                                            >
                                                <option value="">Select Vaccine</option>
                                                {info.existing_vaccines.map(vaccine => (
                                                    <option key={vaccine.id}
                                                            value={vaccine.vaccine_name}>{vaccine.vaccine_name}</option>
                                                ))}
                                            </Form.Select>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip title={`temporal vaccine is periodical?`}>
                                            <Form.Select
                                                onChange={(e) => setEditVaccinePeriodical(parseInt(e.target.value))}
                                                value={editVaccinePeriodical}
                                                size="sm"
                                                className="footer_language"
                                            >
                                                <option value={2}>Is Periodical</option>
                                                <option value={1}>periodical</option>
                                                <option value={0}>none periodical</option>
                                            </Form.Select>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip title={`temporal vaccine minimum period type (month or year)`}>
                                            <Form.Select
                                                onChange={(e) => setEditVaccineMinPeriodType(e.target.value)}
                                                value={editVaccineMinPeriodType !== "" ? editVaccineMinPeriodType as string : ""}
                                                size="sm"
                                                className="footer_language"
                                            >
                                                <option value="">Select Minimum Period Type</option>
                                                <option value="M">Month</option>
                                                <option value="Y">Year</option>
                                            </Form.Select>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip title={`temporal vaccine minimum recommended date`}>
                                            <Form.Select
                                                onChange={(e) => setEditVaccineMinPeriod(parseInt(e.target.value, 10))}
                                                value={editVaccineMinPeriod !== null ? editVaccineMinPeriod.toString() : ""}
                                                size="sm"
                                                className="footer_language"
                                            >
                                                <option value={0}>Select Minimum Period</option>
                                                {
                                                    editVaccineMinPeriodType && periodOptions(true, editVaccineMinPeriodType)
                                                }

                                            </Form.Select>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip title={`temporal vaccine maximum period type (month or year)`}>
                                            <Form.Select
                                                onChange={(e) => editVaccinePeriodical === 1 ? setEditVaccineMaxPeriodType(e.target.value) : setEditVaccineMaxPeriodType("")}
                                                value={editVaccineMaxPeriodType !== "" ? editVaccineMaxPeriodType as string : ""}
                                                size="sm"
                                                className="footer_language"
                                            >
                                                {editVaccinePeriodical !== 1 ?
                                                    <option value="">Select Maximum Period Type</option>
                                                    :
                                                    <>
                                                        <option value="">Select Maximum Period Type</option>
                                                        <option value="M">Month</option>
                                                        <option value="Y">Year</option>
                                                    </>

                                                }
                                            </Form.Select>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip title={`temporal vaccine maximum recommended date`}>
                                            <Form.Select
                                                onChange={(e) => editVaccinePeriodical === 1 ? setEditVaccineMaxPeriod(parseInt(e.target.value, 10)) : setEditVaccineMaxPeriod(null)}
                                                value={editVaccineMaxPeriod !== null ? editVaccineMaxPeriod.toString() : ""}
                                                size="sm"
                                                className="footer_language"
                                            >
                                                {editVaccinePeriodical !== 1 ?
                                                    <option value={0}>Select Maximum Period</option>
                                                    :
                                                    <>
                                                        <option value={0}>Select Maximum Period</option>
                                                        {
                                                            editVaccineMaxPeriodType && periodOptions(true, editVaccineMaxPeriodType)
                                                        }
                                                    </>
                                                }
                                            </Form.Select>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip title={`temporal vaccine round of dose`}>
                                            <Form.Select
                                                onChange={(e) => setEditVaccineRound(parseInt(e.target.value, 10))}
                                                value={editVaccineRound !== null ? editVaccineRound.toString() : ""}
                                                size="sm"
                                                className="footer_language"
                                            >
                                                <option value="">Select Vaccine Round</option>
                                                {
                                                    periodOptions(false, null)
                                                }

                                            </Form.Select>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip title={`temporal vaccine description`}>
                                            <Form.Control
                                                type="text"
                                                placeholder={`description`}
                                                value={editVaccineDescription}
                                                onChange={(e) => setEditVaccineDescription(e.target.value)}
                                            />
                                        </Tooltip>
                                    </div>

                                    <div>
                                        <Button onClick={() => saveModifiedVaccine()}>{translations.save}</Button>
                                    </div>
                                    <div>
                                        <Button onClick={() => cancelModifiedVaccine()}>{translations.cancel}</Button>
                                    </div>
                                </div>
                                :
                                <div key={vaccine.id} className={`manageTempVacElem`}
                                     style={{display: "flex", alignContent: "center"}}>
                                    <div>
                                        {vaccine.id}
                                    </div>
                                    <div>
                                        <Tooltip title={`${vaccine.country_name_original}`}>
                                            <span>{vaccine.vaccine_national_code}</span>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip title={`${vaccine.vaccine_name}`}>
                                            <span>{vaccine.vaccine_name}</span>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip
                                            title={`${vaccine.vaccine_is_periodical ? "Vaccinate Between Minimum Period to Maximum Period" : "Vaccinate On Minimum Period"}`}>
                                            <span>{vaccine.vaccine_is_periodical ? "Y" : "N"}</span>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip
                                            title={`${vaccine.vaccine_minimum_period_type === "M" ? "Month" : "Year"}`}>
                                            <span>{vaccine.vaccine_minimum_period_type}</span>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip title={`Minimum Recommended Date`}>
                                        <span>
                                            {
                                                vaccine.vaccine_minimum_period_type === "M" ?
                                                    vaccine.vaccine_minimum_recommend_date > 12 ?
                                                        Math.trunc((vaccine.vaccine_minimum_recommend_date / 12)).toString() + "Y" + " " + (vaccine.vaccine_minimum_recommend_date % 12).toString()
                                                        :
                                                        vaccine.vaccine_minimum_recommend_date
                                                    :
                                                    vaccine.vaccine_minimum_recommend_date
                                            }

                                            {
                                                vaccine.vaccine_minimum_period_type === "M" ?
                                                    "M"
                                                    :
                                                    "Y"
                                            }
                                        </span>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip
                                            title={`${vaccine.vaccine_maximum_period_type === null ? "" : vaccine.vaccine_maximum_period_type === "M" ? "Month" : "Year"}`}>
                                            <span>{vaccine.vaccine_maximum_period_type === null ? "" : vaccine.vaccine_maximum_period_type}</span>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip title={`Maximum Recommended Date`}>
                                        <span>
                                            {
                                                vaccine.vaccine_maximum_recommend_date === null ? "" : vaccine.vaccine_maximum_period_type === "M" ?
                                                    vaccine.vaccine_maximum_recommend_date > 12 ?
                                                        Math.trunc((vaccine.vaccine_maximum_recommend_date / 12)).toString() + "Y" + " " + (vaccine.vaccine_maximum_recommend_date % 12).toString()
                                                        :
                                                        vaccine.vaccine_maximum_recommend_date
                                                    :
                                                    vaccine.vaccine_maximum_recommend_date
                                            }
                                            {
                                                vaccine.vaccine_maximum_period_type === "M" ?
                                                    "M"
                                                    :
                                                    vaccine.vaccine_maximum_period_type === "Y" ?
                                                        "Y"
                                                        :
                                                        ""
                                            }
                                        </span>
                                        </Tooltip>

                                    </div>
                                    <div>
                                        <Tooltip
                                            title={`${vaccine.vaccine_round === 1 ? vaccine.vaccine_round + "st" : vaccine.vaccine_round === 2 ? vaccine.vaccine_round + "nd" : vaccine.vaccine_round === 3 ? vaccine.vaccine_round + "rd" : vaccine.vaccine_round + "th"}`}>
                                            <span>{vaccine.vaccine_round}</span>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <Tooltip title={`${vaccine.vaccine_description}`}>
                                            <span>{vaccine.vaccine_description}</span>
                                        </Tooltip>
                                    </div>

                                    <div>
                                        <Button onClick={() =>
                                            editVaccineInfo(
                                                vaccine.id,
                                                vaccine.vaccine_national_code,
                                                vaccine.vaccine_name,
                                                vaccine.vaccine_is_periodical,
                                                vaccine.vaccine_minimum_period_type,
                                                vaccine.vaccine_minimum_recommend_date,
                                                vaccine.vaccine_maximum_period_type !== null ? vaccine.vaccine_maximum_period_type as string : "",
                                                vaccine.vaccine_maximum_recommend_date !== null ? vaccine.vaccine_maximum_recommend_date as number : null,
                                                vaccine.vaccine_round,
                                                vaccine.vaccine_description)}>
                                            {translations.edit}
                                        </Button>
                                    </div>
                                    <div>
                                        <Button onClick={() => deleteVaccineRecord(vaccine.id)}>{translations.delete}</Button>
                                    </div>
                                </div>


                        ))}

                    </div>

                    <div className={`adminMangeTitle`}>
                        {translations.add_temporal_country}
                    </div>

                    <div>
                        <div style={{display: "flex", alignContent: "center", marginTop: "40px"}}>
                            {addNational ?
                                <>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={translations.id}
                                            value={addNationalId !== null ? addNationalId : ""}
                                            onChange={(e) => e.target.value !== "" ? setAddNationalId(parseInt(e.target.value, 10)) : setAddNationalId(null)}
                                        />
                                    </div>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={translations.national_code}
                                            value={addNationalCode.toUpperCase()}
                                            onChange={(e) => setAddNationalCode(e.target.value.toUpperCase())}
                                        />
                                    </div>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={translations.name_english}
                                            value={addNationalEng}
                                            onChange={(e) => setAddNationalEng(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Form.Control
                                            type="text"
                                            placeholder={translations.name_original}
                                            value={addNationalOri}
                                            onChange={(e) => setAddNationalOri(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Button onClick={() => saveAddCountry()}>{translations.save}</Button>
                                    </div>
                                    <div>
                                        <Button onClick={() => cancelAddCountry()}>{translations.cancel}</Button>
                                    </div>
                                </>
                                :
                                <div>
                                    <Button onClick={() => addCountry()}>{translations.add_country}</Button>
                                </div>
                            }

                        </div>
                    </div>
                </div>

                <div className={`adminMangeTitle`}>
                    {translations.add_temporal_vaccine}
                </div>

                <div className={`adminAddVaccine`}>
                    <div>
                        <Tooltip title={translations.national_code}>
                            <Form.Select
                                onChange={(e) => setVaccineNationalCode(e.target.value !== null ? parseInt(e.target.value, 10) : 0)}
                                value={vaccineNationalCode !== null ? vaccineNationalCode as number : ""}
                                size="sm"
                                className="footer_language"
                            >
                                <option value="">{translations.national_code}</option>
                                {info.existing_countries.map(country => (
                                    <option key={country.id} value={country.id}>{country.name_original}</option>
                                ))}
                                {info.temporal_countries.map(country => (
                                    <option key={country.id} value={country.id}>{country.name_original}</option>
                                ))}

                            </Form.Select>
                        </Tooltip>

                    </div>
                    <div>
                        <Tooltip title={translations.vaccine_name}>
                            <Form.Select
                                onChange={(e) => setVaccineName(e.target.value)}
                                value={vaccineName !== "" ? vaccineName as string : ""}
                                size="sm"
                                className="footer_language"
                            >
                                <option value="">{translations.vaccine_name}</option>
                                {info.existing_vaccines.map(vaccine => (
                                    <option key={vaccine.id}
                                            value={vaccine.vaccine_name}>{vaccine.vaccine_name}</option>
                                ))}
                            </Form.Select>
                        </Tooltip>
                    </div>
                    <div>
                        <Tooltip title={translations.vaccine_is_periodical}>
                            <Form.Select
                                onChange={(e) => setVaccinePeriodical(parseInt(e.target.value))}
                                value={vaccinePeriodical}
                                size="sm"
                                className="footer_language"
                            >
                                <option value={2}>{translations.vaccine_is_periodical}</option>
                                <option value={1}>{translations.min_to_max}</option>
                                <option value={0}>{translations.on_date}</option>
                            </Form.Select>
                        </Tooltip>

                    </div>
                    <div>
                        <Tooltip title={translations.vaccine_minimum_period_type}>
                            <Form.Select
                                onChange={(e) => setVaccineMinPeriodType(e.target.value)}
                                value={vaccineMinPeriodType !== "" ? vaccineMinPeriodType as string : ""}
                                size="sm"
                                className="footer_language"
                            >
                                <option value="">{translations.vaccine_minimum_period_type}</option>
                                <option value="M">{translations.month}</option>
                                <option value="Y">{translations.year}</option>
                            </Form.Select>
                        </Tooltip>
                    </div>
                    <div>
                        <Tooltip title={translations.vaccine_minimum_recommend_date}>
                            <Form.Select
                                onChange={(e) => setVaccineMinPeriod(parseInt(e.target.value, 10))}
                                value={vaccineMinPeriod !== null ? vaccineMinPeriod.toString() : ""}
                                size="sm"
                                className="footer_language"
                            >
                                <option value={0}>{translations.vaccine_minimum_recommend_date}</option>
                                {
                                    vaccineMinPeriodType && periodOptions(true, vaccineMinPeriodType)
                                }

                            </Form.Select>
                        </Tooltip>

                    </div>
                    <div>
                        <Tooltip title={translations.vaccine_maximum_period_type}>
                            <Form.Select
                                onChange={(e) => vaccinePeriodical === 1 ? setVaccineMaxPeriodType(e.target.value) : setVaccineMaxPeriodType("")}
                                value={vaccineMaxPeriodType !== "" ? vaccineMaxPeriodType as string : ""}
                                size="sm"
                                className="footer_language"
                            >
                                {vaccinePeriodical !== 1 ?
                                    <option value="">{translations.vaccine_maximum_period_type}</option>
                                    :
                                    <>
                                        <option value="">{translations.vaccine_maximum_period_type}</option>
                                        <option value="M">Month</option>
                                        <option value="Y">Year</option>
                                    </>
                                }
                            </Form.Select>
                        </Tooltip>
                    </div>
                    <div>
                        <Tooltip title={translations.vaccine_maximum_recommend_date}>
                            <Form.Select
                                onChange={(e) => vaccinePeriodical === 1 ? setVaccineMaxPeriod(parseInt(e.target.value, 10)) : setVaccineMaxPeriod(null)}
                                value={vaccineMaxPeriod !== null ? vaccineMaxPeriod.toString() : ""}
                                size="sm"
                                className="footer_language"
                            >
                                {
                                    vaccinePeriodical !== 1 ?
                                        <option value={0}>{translations.vaccine_maximum_recommend_date}</option>
                                        :
                                        <>
                                            <option value={0}>{translations.vaccine_maximum_recommend_date}</option>
                                            {
                                                vaccineMaxPeriodType && periodOptions(true, vaccineMaxPeriodType)
                                            }
                                        </>
                                }

                            </Form.Select>
                        </Tooltip>
                    </div>

                    <div>
                        <Tooltip title={translations.vaccine_round}>
                            <Form.Select
                                onChange={(e) => setVaccineRound(parseInt(e.target.value, 10))}
                                value={vaccineRound !== null ? vaccineRound.toString() : ""}
                                size="sm"
                                className="footer_language"
                            >
                                <option value="">{translations.vaccine_round}</option>
                                {
                                    periodOptions(false, null)
                                }

                            </Form.Select>
                        </Tooltip>

                    </div>
                    <div>
                        <Tooltip title={translations.vaccine_description}>
                            <Form.Control
                                type="text"
                                placeholder={translations.vaccine_description}
                                value={vaccineDescription}
                                onChange={(e) => setVaccineDescription(e.target.value)}
                            />
                        </Tooltip>
                    </div>
                </div>

                <div className={`tempVaccineAddHeader`}>
                    <span>
                        {translations.national_code}
                    </span>
                    <span>
                        {translations.vaccine_name}
                    </span>
                    <span>
                        {translations.vaccine_is_periodical}
                    </span>
                    <span>
                        {translations.vaccine_minimum_period_type}
                    </span>
                    <span>
                        {translations.vaccine_minimum_recommend_date}
                    </span>
                    <span>
                        {translations.vaccine_maximum_period_type}
                    </span>
                    <span>
                        {translations.vaccine_maximum_recommend_date}
                    </span>
                    <span>
                        {translations.vaccine_round}
                    </span>
                    <span>
                        {translations.vaccine_description}
                    </span>
                </div>
                <div className={`tempVaccineAddElem`}>
                    <Tooltip title={`${vaccineNationalCode !== null ? vaccineNationalCode : ""}`}>
                        <span>
                            {`${vaccineNationalCode !== null ? vaccineNationalCode : ""}`}
                        </span>
                    </Tooltip>
                    <Tooltip title={`${vaccineName}`}>
                        <span>
                            {`${vaccineName}`}
                        </span>
                    </Tooltip>
                    <Tooltip title={`${vaccinePeriodical !== 2 ? vaccinePeriodical === 1 ? "Periodic" : "On Date" : ""}`}>
                        <span>
                            {`${vaccinePeriodical !== 2 ? vaccinePeriodical === 1 ? "Periodic" : "On Date" : ""}`}
                        </span>
                    </Tooltip>
                    <Tooltip title={`${vaccineMinPeriodType}`}>
                        <span>
                            {`${vaccineMinPeriodType}`}
                        </span>
                    </Tooltip>
                    <Tooltip title={`${vaccineMinPeriod !== null && vaccineMinPeriod !== 0 ? vaccineMinPeriod : ""}`}>
                        <span>
                            {`${vaccineMinPeriod !== null && vaccineMinPeriod !== 0 ? vaccineMinPeriod : ""}`}
                        </span>
                    </Tooltip>

                    <Tooltip title={`${vaccinePeriodical === 1 ? vaccineMaxPeriodType : ""}`}>
                        <span>
                            {`${vaccinePeriodical === 1 ? vaccineMaxPeriodType : ""}`}
                        </span>
                    </Tooltip>

                    <Tooltip title={`${vaccinePeriodical === 1 ? vaccineMaxPeriod !== null && vaccineMaxPeriod !== 0 ? vaccineMaxPeriod : "" : ""}`}>
                        <span>
                            {`${vaccinePeriodical === 1 ? vaccineMaxPeriod !== null && vaccineMaxPeriod !== 0 ? vaccineMaxPeriod : "" : ""}`}
                        </span>
                    </Tooltip>

                    <Tooltip title={`${vaccineRound !== null ? vaccineRound : ""}`}>
                        <span>
                            {`${vaccineRound !== null ? vaccineRound : ""}`}
                        </span>
                    </Tooltip>

                    <Tooltip title={`${vaccineDescription}`}>
                        <span>
                            {`${vaccineDescription}`}
                        </span>
                    </Tooltip>

                </div>
                <div>
                {vaccineNationalCode !== null && vaccineName !== "" && vaccinePeriodical !== 2 && vaccineMinPeriodType !== "" && vaccineMinPeriod !== null && vaccineMinPeriod !== 0 && (vaccinePeriodical === 1 ? vaccineMaxPeriodType !== "" && vaccineMaxPeriod !== null && vaccineMaxPeriod !== 0 : true) && vaccineRound !== null && vaccineDescription !== "" ?
                        <Button onClick={() => addVaccineData()}>{translations.save}</Button>
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
                        {translations.admin_manage}
                    </p>
                </div>

            </Container>
            {filteredInfos && countryVaccineInformation(filteredInfos)}
            {
                deleteNational ?
                    deleteCountryUI()
                    :
                    null
            }

            {
                deleteVaccine ?
                    deleteVaccineUI()
                    :
                    null
            }

        </Container>
    );
};

export default AdminDataManage;