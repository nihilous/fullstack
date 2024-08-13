import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useNavigate } from 'react-router-dom';
import { loginJoinTranslations } from '../translation/LoginJoin';

const LoginJoin: React.FC = () => {
    const apiUrl = useSelector((state: RootState) => state.app.apiUrl);
    const language = useSelector((state: RootState) => state.app.language);
    const navigate = useNavigate();

    const [isLoginView, setIsLoginView] = useState(true);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [joinEmail, setJoinEmail] = useState('');
    const [joinNickname, setJoinNickname] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [joinPasswordRepeat, setJoinPasswordRepeat] = useState('');

    const translations = loginJoinTranslations[language];

    const handleLoginSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${apiUrl}/login/`, {
                email: loginEmail,
                password: loginPassword,
            });
            Cookies.set('token', response.data.token);
            navigate('/main');

        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    const handleJoinSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (joinPassword !== joinPasswordRepeat) {
                console.error('Passwords do not match');
                return;
            }
            const response = await axios.post(`${apiUrl}/user/`, {
                email: joinEmail,
                nickname: joinNickname,
                password: joinPassword,
            });
            console.log('Join Data:', response.data);

            setJoinEmail('');
            setJoinNickname('');
            setJoinPassword('');
            setJoinPasswordRepeat('');

            setIsLoginView(true);
        } catch (error) {
            console.error('Error joining:', error);
        }
    };

    return (
        <div className="LoginJoin">
            {isLoginView ? (
                <form onSubmit={handleLoginSubmit}>
                    <div id="login">
                        <input
                            type="text"
                            name="login_email"
                            placeholder={translations.email}
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            name="login_password"
                            placeholder={translations.password}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <button type="submit">{translations.login}</button>
                        <button type="button" onClick={() => setIsLoginView(false)}>{translations.join}</button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleJoinSubmit}>
                    <div id="join">
                        <input
                            type="text"
                            name="join_email"
                            placeholder={translations.email}
                            value={joinEmail}
                            onChange={(e) => setJoinEmail(e.target.value)}
                        />
                        <input
                            type="text"
                            name="join_nickname"
                            placeholder={translations.nickname}
                            value={joinNickname}
                            onChange={(e) => setJoinNickname(e.target.value)}
                        />
                        <input
                            type="password"
                            name="join_password"
                            placeholder={translations.password}
                            value={joinPassword}
                            onChange={(e) => setJoinPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            name="join_password_repeat"
                            placeholder={translations.password_repeat}
                            value={joinPasswordRepeat}
                            onChange={(e) => setJoinPasswordRepeat(e.target.value)}
                        />
                        <button type="submit">{translations.register}</button>
                        <button type="button" onClick={() => setIsLoginView(true)}>{translations.cancel}</button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default LoginJoin;