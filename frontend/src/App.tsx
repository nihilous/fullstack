import React from 'react';
import Cookies from 'js-cookie';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { startJwtTimers } from './util/timer';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginJoin from './components/LoginJoin';
import Main from './components/Main';
import RegisterChild from './components/RegisterChild';
import History from './components/History';
import Notice from './components/Notice';
const App = () => {

    const dispatch = useDispatch();

    useEffect(() => {
        const token = Cookies.get('token');
        const expirationTime = localStorage.getItem('jwtExpiration');

        if (token && expirationTime) {
            const parsedExpirationTime = parseInt(expirationTime);
            const preWarningTime = parsedExpirationTime - 10 * 60 * 1000;
            startJwtTimers(dispatch, parsedExpirationTime, preWarningTime);
        }
    }, [dispatch]);


    return (

        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<LoginJoin />} />
                <Route path="/main" element={<Main />} />
                <Route path="/register_child" element={<RegisterChild />} />
                <Route path="/history/:id" element={<History />} />
                <Route path="/notice/:id" element={<Notice />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;