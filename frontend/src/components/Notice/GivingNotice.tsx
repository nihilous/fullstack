import { formatDate, formatDateWithoutT } from '../../util/formatDate';
import { Button, Container } from 'react-bootstrap';
import React from 'react';
import NoticeProperty from '../../types/NoticeType';

interface GivingNoticeProp {
  language: string;
  translations: any;
  notices: NoticeProperty[];
  handleVaccination: Function;
}

const GivingNotice = (props: GivingNoticeProp) => {
  const language = props.language;
  const translations = props.translations;
  const notices = props.notices;
  const handleVaccination = props.handleVaccination;

  return (
    <>
      {notices.map(notice => {
        const history = formatDate(
          notice.history_date !== null ? (notice.history_date as string) : '',
          language,
        );

        const min_exp =
          notice.expected_vaccine_minimum_recommend_date !== undefined
            ? formatDateWithoutT(
                notice.expected_vaccine_minimum_recommend_date,
                language,
              )
            : null;
        const max_exp =
          notice.expected_vaccine_maximum_recommend_date !== undefined
            ? formatDateWithoutT(
                notice.expected_vaccine_maximum_recommend_date,
                language,
              )
            : null;

        return (
          <Container key={notice.id} className="child-info notice_info_elem">
            <div className={'nie_infos'}>
              <div className={'nie_info nie_title'}>
                {`${translations.name}`}
              </div>
              <div className={'nie_info nie_vaccine_name'}>
                {`${notice.vaccine_name}`}
              </div>

              <div className={'nie_info'}>
                <div
                  className={'nie_title'}
                >{`${translations.after_birth}`}</div>
                <div className={'nie_info after_birth'}>
                  <span>
                    {`${
                      notice.vaccine_minimum_period_type === 'M'
                        ? parseInt(notice.vaccine_minimum_recommend_date) > 12
                          ? Math.trunc(
                              parseInt(notice.vaccine_minimum_recommend_date) /
                                12,
                            ).toString() +
                            ' ' +
                            translations.year +
                            ' ' +
                            (
                              parseInt(notice.vaccine_minimum_recommend_date) %
                              12
                            ).toString()
                          : notice.vaccine_minimum_recommend_date
                        : notice.vaccine_minimum_recommend_date
                    }
                                    
                                    ${
                                      notice.vaccine_minimum_period_type === 'M'
                                        ? translations.month
                                        : translations.year
                                    }`}
                  </span>
                  {(notice.vaccine_is_periodical as boolean) ? (
                    <>
                      <span>&nbsp;~&nbsp;</span>
                      <span>
                        {`${
                          notice.vaccine_maximum_period_type === 'M'
                            ? parseInt(notice.vaccine_maximum_recommend_date) >
                              12
                              ? Math.trunc(
                                  parseInt(
                                    notice.vaccine_maximum_recommend_date,
                                  ) / 12,
                                ).toString() +
                                ' ' +
                                translations.year +
                                ' ' +
                                (
                                  parseInt(
                                    notice.vaccine_maximum_recommend_date,
                                  ) % 12
                                ).toString()
                              : notice.vaccine_maximum_recommend_date
                            : notice.vaccine_maximum_recommend_date
                        }
                                                
                                                ${
                                                  notice.vaccine_maximum_period_type ===
                                                  'M'
                                                    ? translations.month
                                                    : translations.year
                                                }`}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className={'nie_info round'}>
                <div className={'nie_title'}>{`${translations.round}`}</div>
                <div>{`${notice.vaccine_round}`}</div>
              </div>

              {notice.history_date === null && min_exp ? (
                <div className={'nie_info'}>
                  <div
                    className={'nie_title'}
                  >{`${translations.scheduled_to}`}</div>
                  <div className={'schedule'}>
                    <span>{`${min_exp}`}</span>

                    {(notice.vaccine_is_periodical as boolean) ? (
                      <>
                        <span>-</span>

                        {notice.history_date === null && max_exp ? (
                          <span>{`${max_exp}`}</span>
                        ) : (
                          <></>
                        )}
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
              ) : (
                <></>
              )}

              {notice.history_date !== null ? (
                <div className={'nie_info vaccinated_date'}>
                  <div
                    className={'nie_title'}
                  >{`${translations.vaccination_date}`}</div>
                  <div>{`${history}`}</div>
                </div>
              ) : (
                <></>
              )}
            </div>

            {notice.history_date !== null ? (
              <></>
            ) : (
              <div className={`notice_reg_btn`}>
                <Button onClick={() => handleVaccination(notice.id)}>
                  {`${translations.register}`}
                </Button>
              </div>
            )}
          </Container>
        );
      })}
    </>
  );
};

export default GivingNotice;
