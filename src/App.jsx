import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Appointments from './pages/Appointments'
import Login from './pages/Login'
import Register from './pages/Register'
import DoctorDashboard from './pages/Doctor_Dashboard'
import MyPatientsPage from './pages/MyPatientsPage'
import DrProfilePage from './pages/Dr_Profile_Page'

function App() {
  const user = JSON.parse(localStorage.getItem('user'))

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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
        element={user ? <MyPatientsPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/dr_profile"
        element={user ? <DrProfilePage /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
