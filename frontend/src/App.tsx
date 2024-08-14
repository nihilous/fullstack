import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginJoin from './components/LoginJoin';
import Main from './components/Main';
import RegisterChild from './components/RegisterChild';

const App = () => {
    return (

        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<LoginJoin />} />
                <Route path="/main" element={<Main />} />
                <Route path="/register_child" element={<RegisterChild />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default App;