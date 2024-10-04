interface HistoryProperty {
  name: string;
  birthdate: string;
  gender: number;
  nationality: number;
  description: string;
  histories: {
    id: number;
    vaccine_name: string;
    vaccine_round: number;
    history_date: string;
  }[];
}

export default HistoryProperty;
