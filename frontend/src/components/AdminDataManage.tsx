import React, {useState, useEffect, useRef} from 'react';
import axios, {AxiosError} from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { AdminManageTranslations } from '../translation/AdminManage';
import {PopupMessageTranslations} from "../translation/PopupMessageTranslations";
import { getToken, getDecodedToken } from "../util/jwtDecoder";
import {Container} from "react-bootstrap";
import {setNoticePopUp} from "../redux/slice";
import jwtChecker from "../util/jwtChecker";
import DeleteCountryUI from "./AdminDataManage/DeleteCountryUI"
import DeleteVaccineUI from "./AdminDataManage/DeleteVaccineUI"
import CountryVaccineDataResponse from "../types/AdminDataManageType"
import CountryVaccineInformation from "./AdminDataManage/CountryVaccineInformation";

const AdminDataManage = () => {

    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const navigagte = useNavigate();
    const dispatch = useDispatch();
    const userId = getDecodedToken()?.userId;
    const admin = getDecodedToken()?.admin;

    const translations = AdminManageTranslations[language];
    const popupTranslations = PopupMessageTranslations[language];

    const infos = useRef<CountryVaccineDataResponse | null>(null);
    const [filteredInfos, setFilteredInfos] = useState<CountryVaccineDataResponse | null>(null);

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

    const deleteCountry = (id: number) => {
        setDeleteNationalId(id);
        setDeleteNational(!deleteNational)
    }

    const deleteVaccineRecord = (id: number) => {
        setDeleteVaccine(!deleteVaccine);
        setDeleteVaccineId(id);
    }

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
            {filteredInfos && <CountryVaccineInformation
                dispatch={dispatch}
                apiUrl={apiUrl}
                translations={translations}
                popupTranslations={popupTranslations}
                mainDataFetch={mainDataFetch}
                deleteVaccineRecord={deleteVaccineRecord}
                deleteCountry={deleteCountry}
                info={filteredInfos}

            />}
            {
                deleteNational ?
                    <DeleteCountryUI
                        dispatch={dispatch}
                        apiUrl={apiUrl}
                        translations={translations}
                        popupTranslations={popupTranslations}
                        mainDataFetch={mainDataFetch}
                        deleteNationalId={deleteNationalId as number}
                        setDeleteNationalId={setDeleteNationalId}
                        deleteNational={deleteNational}
                        setDeleteNational={setDeleteNational}
                    />
                    :
                    null
            }

            {
                deleteVaccine ?
                    <DeleteVaccineUI
                        dispatch={dispatch}
                        apiUrl={apiUrl}
                        translations={translations}
                        popupTranslations={popupTranslations}
                        mainDataFetch={mainDataFetch}
                        deleteVaccineId={deleteVaccineId as number}
                        setDeleteVaccineId={setDeleteVaccineId}
                        deleteVaccine={deleteVaccine}
                        setDeleteVaccine={setDeleteVaccine}
                    />
                    :
                    null
            }

        </Container>
    );
};

export default AdminDataManage;