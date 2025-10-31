import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
// import toast, { Toaster } from "react-hot-toast";

const Login = () => {
  const [role, setRole] = useState("Patient");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const fakeUsers = {
    Patient: [{ id: "athul", password: "12345", name: "Athul" }],
    Doctor: [{ id: "doctor1", password: "doc123", name: "Dr. Aisha Khan" }],
    Admin: [{ id: "admin", password: "admin123", name: "Administrator" }],
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const users = fakeUsers[role] || [];
    const user = users.find(
      (u) => u.id === loginId.trim() && u.password === password.trim()
    );
    if (user) {
      toast.success(`Welcome ${user.name}! Redirecting...`);
      setTimeout(() => navigate("/dashboard"), 900);
    } else {
      toast.error("Invalid Login ID or Password!");
    }
  };

  const bgUrl =
    "https://cdn.dribbble.com/userupload/23002793/file/original-3f028f30f7f023f692a0d341f2ca3741.gif";

  return (
    <div
      className="login-page min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: "#FEF3C7", // warm fallback color
        backgroundImage: `url("${bgUrl}")`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >
      <div className="absolute inset-0 bg-emerald-200/30 backdrop-blur-sm"></div>

      <motion.div
        className="absolute rounded-full bg-emerald-300/30 blur-3xl w-72 h-72 -left-20 -top-20"
        animate={{ x: [0, 40, -20, 0], y: [0, 20, -10, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full bg-cyan-300/30 blur-3xl w-96 h-96 -right-20 -bottom-28"
        animate={{ x: [0, -60, 30, 0], y: [0, -40, 10, 0] }}
        transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 bg-white/85 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-emerald-100"
      >
        <h1 className="text-3xl font-extrabold text-center text-gradient underline mb-2">
          MediConnect
        </h1>
        <p className="text-center text-slate-600 mb-6">
          Smart Hospital Login Portal
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-600 mb-1"
            >
              Select Role
            </label>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="custom-select w-full border border-gray-200 bg-white/60 backdrop-blur-sm rounded-md p-3 text-gray-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 appearance-none"
              >
                <option>Patient</option>
                <option>Doctor</option>
                <option>Admin</option>
              </select>

              {/* Dropdown arrow */}
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-emerald-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </motion.div>
          </div>


          <input
            type="text"
            placeholder="Login ID"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="w-full border border-gray-200 rounded-md p-3 focus:ring-2 focus:ring-emerald-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-200 rounded-md p-3 focus:ring-2 focus:ring-emerald-400"
          />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-emerald-500 text-white font-semibold py-3 rounded-md shadow-lg hover:bg-emerald-600"
          >
            Login
          </motion.button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-emerald-600 font-semibold hover:underline"
          >
            Register here
          </Link>
        </p>
      </motion.div>

      {/* <Toaster position="top-center" /> */}
    </div>
  );
};

export default Login;
