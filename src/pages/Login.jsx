import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/loginAPI"; // ✅ API import

const Login = () => {
  const [role, setRole] = useState("patient");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedLoginId = loginId.trim();
    const trimmedPassword = password.trim();

    try {
      console.log("Attempting login with:", { loginId: trimmedLoginId, role });
      const user = await loginUser(trimmedLoginId, trimmedPassword, role);
      console.log("Login response:", user);

      if (!user) {
        setError("Invalid Login ID or Password!");
        setLoading(false);
        return;
      }

      // ✅ Save login to localStorage with consistent name field
      const userToStore = {
        ...user,
        role,
        name: user.fullName || user.name || 'User', // Use fullName for patients, name for doctors/admins
        id: user.id || user.id
      };
      localStorage.setItem("user", JSON.stringify(userToStore));
      console.log("User saved to localStorage:", userToStore);

      // Trigger storage event to notify App.jsx
      window.dispatchEvent(new Event('storage'));

      // ✅ Navigate based on role - use window.location for full page reload to ensure App.jsx re-reads localStorage
      const targetPath = role === "doctor" ? "/doctor" : role === "administrator" ? "/admin" : "/dashboard";
      console.log("Navigating to:", targetPath);
      
      // Use window.location for a full reload to ensure App.jsx picks up the new user
      window.location.href = targetPath;
    } catch (err) {
      console.error("Login failed:", err);
      setLoading(false);
      // Show more specific error messages
      if (err.message && err.message.includes('Unable to connect')) {
        setError(err.message);
      } else {
        setError("Unable to connect to backend. Please check your connection and try again.");
      }
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
              disabled={loading}
              className={`w-full text-white font-semibold py-3 rounded-md shadow-lg transition-all ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
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
