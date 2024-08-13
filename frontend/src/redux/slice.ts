import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

interface AppState {
    apiUrl: string;
    language: 'FIN' | 'ENG' | 'KOR';
}

const apiUrl = process.env.REACT_APP_MODE === 'DEV' ? process.env.REACT_APP_DEV_API_URL || '' : process.env.REACT_APP_API_URL || '';

const getInitialLanguage = (): 'FIN' | 'ENG' | 'KOR' => {
    const savedLanguage = Cookies.get('language');
    if (savedLanguage && ['FIN', 'ENG', 'KOR'].includes(savedLanguage)) {
        return savedLanguage as 'FIN' | 'ENG' | 'KOR';
    }
    return 'ENG';
};

const initialState: AppState = {
    apiUrl,
    language: getInitialLanguage(),
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setApiUrl(state, action: PayloadAction<string>) {
            state.apiUrl = action.payload;
        },
        setLanguage(state, action: PayloadAction<'FIN' | 'ENG' | 'KOR'>) {
            state.language = action.payload;
            Cookies.set('language', action.payload, { expires: 365 });
        },
    },
});

export const { setApiUrl, setLanguage } = appSlice.actions;
export default appSlice.reducer;
