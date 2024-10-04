import React from 'react';

interface GenerateNaviProps {
  total: number;
  naviNum: number;
  setNaviNum: React.Dispatch<React.SetStateAction<number>>;
}

const GenerateNavi = (props: GenerateNaviProps) => {
  const buttons = [];
  const itemsPerPage = 5;
  const total = props.total;
  const naviNum = props.naviNum;
  const setNaviNum = props.setNaviNum;

  const currentSet = Math.floor(naviNum / itemsPerPage);

  const start = currentSet * itemsPerPage;
  const end = Math.min(start + itemsPerPage, total);

  for (let i = start; i < end; i++) {
    buttons.push(
      <span
        className={`nav_target ${i === naviNum ? 'now_nav' : ''}`}
        key={i}
        onClick={() => setNaviNum(i)}
      >
        {i + 1}
      </span>,
    );
  }

  return (
    <div className="board_navs">
      <div className={'nav_prev'}>
        {total > 4 && naviNum > 4 ? (
          <span
            onClick={() => setNaviNum(Math.max(naviNum - 1 - (naviNum % 5), 0))}
          >
            {'<'}
          </span>
        ) : null}
      </div>
      <div>{buttons}</div>
      <div className={'nav_next'}>
        {total > 4 && naviNum < total - (total % 5) ? (
          <span
            onClick={() =>
              setNaviNum(Math.min(naviNum + (5 - (naviNum % 5)), total - 1))
            }
          >
            {'>'}
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default GenerateNavi;
