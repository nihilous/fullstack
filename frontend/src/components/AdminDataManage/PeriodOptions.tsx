import React from 'react';

interface PeriodOptionsProps {
  isPeriod: boolean;
  periodType: string | null;
}

const PeriodOptions = (props: PeriodOptionsProps) => {
  const isPeriod = props.isPeriod;
  const periodType = props.periodType;
  const options = [];

  if (isPeriod) {
    if (periodType === 'M') {
      for (let i = 1; i < 193; i++) {
        options.push(
          <option key={i} value={i}>
            {i}
          </option>,
        );
      }
    } else {
      for (let i = 1; i < 17; i++) {
        options.push(
          <option key={i} value={i}>
            {i}
          </option>,
        );
      }
    }
  } else {
    for (let i = 1; i < 33; i++) {
      options.push(
        <option key={i} value={i}>
          {i}
        </option>,
      );
    }
  }

  return <>{options}</>;
};

export default PeriodOptions;
