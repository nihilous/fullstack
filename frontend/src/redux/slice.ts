import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import NoticePopUp from '../types/NoticePopUpType';

interface AppState {
  apiUrl: string;
  language: 'FIN' | 'SWE' | 'ENG' | 'KOR';
  notice_popup: { on: boolean; is_error: boolean | null; message: string };
  jwtExpirationTimer: number | NodeJS.Timeout | null;
}

const apiUrl =
  process.env.REACT_APP_MODE === 'DEV'
    ? process.env.REACT_APP_DEV_API_URL || ''
    : process.env.REACT_APP_API_URL || '';

const getInitialLanguage = (): 'FIN' | 'SWE' | 'ENG' | 'KOR' => {
  const savedLanguage = Cookies.get('language');
  if (savedLanguage && ['FIN', 'SWE', 'ENG', 'KOR'].includes(savedLanguage)) {
    return savedLanguage as 'FIN' | 'SWE' | 'ENG' | 'KOR';
  }
  return 'ENG';
};

const notice_popup = { on: false, is_error: null, message: '' };

const initialState: AppState = {
  apiUrl,
  language: getInitialLanguage(),
  notice_popup,
  jwtExpirationTimer: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setApiUrl(state, action: PayloadAction<string>) {
      state.apiUrl = action.payload;
    },
    setLanguage(state, action: PayloadAction<'FIN' | 'SWE' | 'ENG' | 'KOR'>) {
      state.language = action.payload;
      Cookies.set('language', action.payload, { expires: 365 });
    },
    setNoticePopUp(state, action: PayloadAction<NoticePopUp>) {
      state.notice_popup = action.payload;
    },
    setJwtExpirationTimer(
      state,
      action: PayloadAction<number | NodeJS.Timeout | null>,
    ) {
      state.jwtExpirationTimer = action.payload;
    },
  },
});

export const { setApiUrl, setLanguage, setNoticePopUp, setJwtExpirationTimer } =
  appSlice.actions;
export default appSlice.reducer;
