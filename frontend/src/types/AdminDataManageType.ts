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

export default CountryVaccineDataResponse