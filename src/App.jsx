import React, { useState, useEffect } from 'react'
import {  Route, Routes, Navigate } from "react-router-dom";
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Appointments from './pages/Appointments'
import Login from './pages/Login'
import Register from './pages/Register'
import DoctorDashboard from './pages/Doctor_Dashboard'
import MyPatientsPage from './pages/MyPatientsPage'
import PatientHistory from './pages/PatientHistory'
import DrProfilePage from './pages/Dr_Profile_Page'
import Landing from "./pages/Landing"; 
import AdminDashboard from './components/AdminDashboard'

function App() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });

  // Listen for storage changes (when login happens)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        setUser(null);
      }
    };

    // Listen for storage events (when localStorage is updated from another tab/window)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check localStorage periodically (for same-tab updates)
    // Check every 500ms - not too frequent but responsive enough
    const interval = setInterval(handleStorageChange, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<Landing />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected user routes */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/appointments"
          element={user ? <Appointments /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/doctor"
          element={user ? <DoctorDashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/patient_history"
          element={user ? <PatientHistory /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/dr_profile"
          element={user ? <DrProfilePage /> : <Navigate to="/login" replace />}
        />

        {/* ✅ Admin dashboard */}
        <Route
          path="/admin/"
          element={<AdminDashboard />}
        />

        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

export default App;
