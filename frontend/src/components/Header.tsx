import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../redux/slice';
import { RootState } from '../store';

const Header: React.FC = () => {
    const dispatch = useDispatch();
    const language = useSelector((state: RootState) => state.app.language);

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setLanguage(event.target.value as 'FIN' | 'ENG' | 'KOR'));
    };

    return (
        <header>
            <nav>
                <select value={language} onChange={handleLanguageChange}>
                    <option value="FIN">Suomi</option>
                    <option value="ENG">English</option>
                    <option value="KOR">한국어</option>
                </select>
            </nav>
        </header>
    );
};

export default Header;