import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import AddFunds from './pages/AddFunds';
import RequestByForm from './pages/RequestByForm';
import RequestByQR from './pages/RequestByQR';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleSetToken = (newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setToken={handleSetToken} />} />
        <Route path="/register" element={<Register setToken={handleSetToken} />} />
        
        <Route path="/dashboard" element={token ? <Dashboard setToken={handleSetToken} /> : <Navigate to="/login" />} />
        <Route path="/send-money" element={token ? <SendMoney /> : <Navigate to="/login" />} />
        <Route path="/add-funds" element={token ? <AddFunds /> : <Navigate to="/login" />} />
        <Route path="/request-by-form" element={token ? <RequestByForm /> : <Navigate to="/login" />} />
        <Route path="/request-by-qr" element={token ? <RequestByQR /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}
