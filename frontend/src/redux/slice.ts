import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
    apiUrl: string;
}

const apiUrl = process.env.REACT_APP_MODE === 'DEV' ? process.env.REACT_APP_DEV_API_URL || '' : process.env.REACT_APP_API_URL || '';

const initialState: AppState = {
    apiUrl,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setApiUrl(state, action: PayloadAction<string>) {
            state.apiUrl = action.payload;
        },
    },
});

export const { setApiUrl } = appSlice.actions;
export default appSlice.reducer;