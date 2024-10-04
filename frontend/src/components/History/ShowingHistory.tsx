import { Button, Container } from 'react-bootstrap';
import { formatDate } from '../../util/formatDate';
import React from 'react';
import HistoryProperty from '../../types/HistoryType';

interface ShowingHistoryProps {
  language: string;
  translations: any;
  modifyChildRecord: Function;
  infoWithHistories: HistoryProperty;
}

const ShowingHistory = (props: ShowingHistoryProps) => {
  const language = props.language;
  const translations = props.translations;
  const modifyChildRecord = props.modifyChildRecord;
  const info = props.infoWithHistories;

  return (
    <>
      {info.histories.map(history => {
        return (
          <Container key={history.id} className="child-info history_info_elem">
            <div>{`${translations.name}`}</div>
            <div
              className={'hie_vaccine_name'}
            >{`${history.vaccine_name}`}</div>

            <div>
              <div className={'hie_info'}>
                <span>{`${translations.date}`}</span>
                <span>
                  {formatDate(history.history_date as string, language)}
                </span>
              </div>
              <div className={'hie_info'}>
                <span>{`${translations.round}`}</span>
                <span>{`${history.vaccine_round}`}</span>
              </div>

              <div className={'hie_buttons'}>
                <span>
                  <Button
                    variant="warning"
                    onClick={() =>
                      modifyChildRecord(
                        history.id,
                        'update',
                        history.history_date.split('T')[0],
                      )
                    }
                  >
                    {translations.update}
                  </Button>
                </span>
                <span>
                  <Button
                    variant="danger"
                    onClick={() =>
                      modifyChildRecord(history.id, 'delete', null)
                    }
                  >
                    {translations.delete}
                  </Button>
                </span>
              </div>
            </div>
          </Container>
        );
      })}
    </>
  );
};

export default ShowingHistory;
