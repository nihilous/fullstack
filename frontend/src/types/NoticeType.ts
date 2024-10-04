interface NoticeProperty {
    id : number
    birthdate : string
    vaccine_name : string
    vaccine_is_periodical : boolean
    vaccine_minimum_period_type : string
    vaccine_minimum_recommend_date : string
    vaccine_maximum_period_type : string
    vaccine_maximum_recommend_date : string
    vaccine_round : number
    expected_vaccine_minimum_recommend_date: string
    expected_vaccine_maximum_recommend_date: string
    history_date : string | null
}

export default NoticeProperty;