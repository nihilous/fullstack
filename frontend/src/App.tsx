import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LoginJoin from './components/LoginJoin';
import Main from './components/Main';

const App: React.FC = () => {
    return (

        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<LoginJoin />} />
                <Route path="/main" element={<Main />} />
            </Routes>
        </Router>
    );
};

export default App;