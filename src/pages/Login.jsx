import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/loginAPI"; // ✅ API import

const Login = () => {
  const [role, setRole] = useState("patient");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedLoginId = loginId.trim();
    const trimmedPassword = password.trim();

    try {
      const user = await loginUser(trimmedLoginId, trimmedPassword, role);

      if (!user) {
        setError("Invalid Login ID or Password!");
        return;
      }

      // ✅ Save login to localStorage
      localStorage.setItem("user", JSON.stringify({ ...user, role }));

      // ✅ Navigate based on role
      setTimeout(() => {
        if (role === "doctor") navigate("/doctor");
        else if (role === "administrator") navigate("/admin");
        else navigate("/dashboard");
      }, 800);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Unable to connect to backend. Please try again.");
    }
  };

  const bgUrl =
    "https://cdn.dribbble.com/userupload/23002793/file/original-3f028f30f7f023f692a0d341f2ca3741.gif";

  return (
    <div className="auth-page min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* LEFT SIDE */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex flex-col justify-center items-center text-white px-10 py-20 
                   bg-gradient-to-br from-emerald-600 to-emerald-500 lg:rounded-r-[120px]"
      >
        <div className="max-w-lg text-center">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
            “Every heartbeat matters. <br /> Every login connects care.”
          </h1>
          <p className="text-lg opacity-90 leading-relaxed">
            Empowering hospitals with smart connectivity — <br />
            welcome to <span className="font-semibold">MediConnect</span>.
          </p>
        </div>
      </motion.div>

      {/* RIGHT SIDE */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex items-center justify-center relative bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url("${bgUrl}")` }}
      >
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[10px]"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl 
                     w-full max-w-md border border-emerald-100"
        >
          <h1 className="text-3xl font-extrabold text-center text-emerald-700 underline mb-2">
            MediConnect
          </h1>
          <p className="text-center text-slate-600 mb-6">
            Smart Hospital Login Portal
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Select Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-gray-200 bg-white rounded-md p-3 text-gray-700 
                           font-medium shadow-sm focus:outline-none focus:ring-2 
                           focus:ring-emerald-400 focus:border-emerald-400"
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>

            {/* Login ID */}
            <input
              type="text"
              placeholder="Login ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full border border-gray-200 rounded-md p-3 shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              required
            />

            {/* Password */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-md p-3 shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
              required
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-emerald-500 text-white font-semibold py-3 rounded-md shadow-lg 
                         hover:bg-emerald-600"
            >
              Login
            </motion.button>
          </form>

          {/* Register link for patients only */}
          {role === "patient" && (
            <p className="text-center text-gray-600 mt-4">
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-emerald-600 font-semibold hover:underline transition"
              >
                Register here
              </Link>
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
