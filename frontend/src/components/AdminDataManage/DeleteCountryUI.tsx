import axios, {AxiosError} from "axios";
import {getToken} from "../../util/jwtDecoder";
import jwtChecker from "../../util/jwtChecker";
import {setNoticePopUp} from "../../redux/slice";
import {Button, Container} from "react-bootstrap";
import React from "react";
import {Dispatch} from "redux";
import CountryVaccineDataResponse from "../../types/AdminDataManageType"

interface DeleteCountryUIProps {
    dispatch: Dispatch<any>;
    translations: any;
    popupTranslations: any;
    apiUrl: string;
    mainDataFetch: Function;
    deleteNationalId: number;
    setDeleteNationalId: React.Dispatch<React.SetStateAction<number | null>>;
    deleteNational: boolean;
    setDeleteNational: React.Dispatch<React.SetStateAction<boolean>>;

}

const DeleteCountryUI = (props:DeleteCountryUIProps) => {

    const dispatch = props.dispatch;
    const apiUrl = props.apiUrl;
    const translations = props.translations;
    const popupTranslations = props.popupTranslations;
    const mainDataFetch = props.mainDataFetch;
    const deleteNationalId = props.deleteNationalId;
    const setDeleteNationalId = props.setDeleteNationalId;
    const deleteNational = props.deleteNational;
    const setDeleteNational = props.setDeleteNational;


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

export default DeleteCountryUI;