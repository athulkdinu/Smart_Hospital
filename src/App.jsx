import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Appointments from "./pages/Appointments";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
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

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
