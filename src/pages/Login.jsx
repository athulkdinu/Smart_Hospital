import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { doctors, administrators, patients } from "../data/fakeData";

const Login = () => {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    let user = null;

    if (role === "doctor") {
      user = doctors.find(
        (doc) => doc.loginId === loginId && doc.password === password
      );
    } else if (role === "administrator") {
      user = administrators.find(
        (admin) => admin.loginId === loginId && admin.password === password
      );
    } else {
      user = patients.find(
        (p) => p.loginId === loginId && p.password === password
      );
    }

    if (user) {
      localStorage.setItem("user", JSON.stringify({ ...user, role }));
      navigate("/dashboard");
    } else {
      setError("Invalid Login ID or Password!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-2xl w-[400px] p-8"
      >
        <h2 className="text-2xl font-bold text-center text-slate-700 mb-4">
          Smart Hospital Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border rounded-md p-2"
          >
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="administrator">Administrator</option>
          </select>

          <input
            type="text"
            placeholder="Login ID"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="w-full border rounded-md p-2"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md p-2"
            required
          />

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {role === "patient" && (
          <p className="text-sm text-center mt-4 text-slate-600">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Register here
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
