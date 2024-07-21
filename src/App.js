// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Courses from './pages/courses';
import Submissions from './pages/submissions';
import Login from './pages/login';
import Profile from './pages/profile';
import Sidebar from './components/sidebar';
import Community from './pages/community';
import { useAuth } from './hooks/useAuth';
import './App.css';

const App = () => {
  const { currentUser } = useAuth();

  return (
    <Router>
      <div className="container">
        <div className="content">
          {currentUser && <Sidebar />}
          <Routes>
            {/* Redirect to login if not authenticated */}
            <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/dashboard" element={currentUser ? <Dashboard /> : <Navigate to="/" />} />
            <Route path="/courses" element={currentUser ? <Courses /> : <Navigate to="/" />} />
            <Route path="/assignments" element={currentUser ? <Submissions /> : <Navigate to="/" />} />
            <Route path="/community" element={currentUser ? <Community /> : <Navigate to="/" />} />
            <Route path="/profile" element={currentUser ? <Profile /> : <Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
