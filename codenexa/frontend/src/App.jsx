import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './Login';
import RequirementForm from './RequirementForm';
import Success from './Success';

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="bg-glow"></div>
        <div className="bg-glow-right"></div>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/requirement" element={<RequirementForm />} />
          <Route path="/success" element={<Success />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      </div>
    </Router>
  );
}

export default App;
