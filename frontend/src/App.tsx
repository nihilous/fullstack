import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginJoin from './components/LoginJoin';
import Main from './components/Main';
import RegisterChild from './components/RegisterChild';
import History from './components/History';
import Notice from './components/Notice';
const App = () => {
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