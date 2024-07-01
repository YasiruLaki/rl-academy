// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Courses from './pages/couses';
import Login from './pages/login';
import Profile from './pages/profile';
import Sidebar from './components/sidebar';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="container">
        <div className="content">
          <Sidebar />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
