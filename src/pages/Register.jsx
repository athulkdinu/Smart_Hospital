import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const [generatedId, setGeneratedId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🧠 Generate loginId dynamically (like PAT001, PAT002)
  const generateLoginId = async () => {
    try {
      const res = await axios.get("http://localhost:5000/patients");
      const count = res.data.length + 1;
      return `PAT${String(count).padStart(3, "0")}`;
    } catch (err) {
      console.error("Error generating loginId:", err);
      return `PAT${Math.floor(Math.random() * 1000)}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setGeneratedId("");

    try {
      const loginId = await generateLoginId();

      const response = await axios.post("http://localhost:5000/patients", {
        ...formData,
        loginId,
      });

      if (response.status === 201) {
        setGeneratedId(loginId);
        setMessage(" Registration successful! Your login details are below:");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(" Registration failed. Please try again.");
    }
  };

  const bgUrl =
    "https://cdn.dribbble.com/userupload/23002793/file/original-3f028f30f7f023f692a0d341f2ca3741.gif";

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url('${bgUrl}')`,
      }}
    >
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[6px]"></div>

      {/* Animated floating background */}
      <motion.div
        className="absolute rounded-full bg-emerald-300/30 blur-3xl w-72 h-72 -left-16 -top-16"
        animate={{ x: [0, 40, -20, 0], y: [0, 20, -10, 0] }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full bg-cyan-300/30 blur-3xl w-96 h-96 -right-16 -bottom-20"
        animate={{ x: [0, -40, 20, 0], y: [0, -20, 10, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/75 backdrop-blur-2xl border border-emerald-100 p-8 w-full max-w-4xl rounded-3xl shadow-2xl grid md:grid-cols-2 gap-6 items-center"
        style={{ height: "80vh" }}
      >
        {/* Left Side - Branding */}
        <div className="hidden md:flex flex-col justify-center text-center p-4 rounded-2xl bg-emerald-50/60 backdrop-blur-sm h-full">
          <h1 className="text-4xl font-bold text-emerald-700 mb-4">
            MediConnect
          </h1>
          <p className="text-lg text-gray-700 italic leading-relaxed">
            “Where technology meets compassion —
            <br /> your health, our priority.”
          </p>
          <p className="mt-6 text-sm text-gray-500">
            Join our smart healthcare community today.
          </p>
        </div>

        {/* Right Side - Registration form */}
        <div className="h-full flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-3 text-center underline decoration-emerald-400">
            Patient Registration
          </h2>

          {!generatedId ? (
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="col-span-2 p-3 rounded-xl border border-gray-300 bg-white/80 shadow-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                required
              />
              <input
                type="number"
                name="age"
                placeholder="Age"
                value={formData.age}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-300 bg-white/80 shadow-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                required
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-300 bg-white/80 shadow-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                required
              >
                <option value="">Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-300 bg-white/80 shadow-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                className="p-3 rounded-xl border border-gray-300 bg-white/80 shadow-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                required
              />
              <textarea
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="col-span-2 p-3 rounded-xl border border-gray-300 bg-white/80 shadow-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none resize-none"
                required
              ></textarea>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="col-span-2 p-3 rounded-xl border border-gray-300 bg-white/80 shadow-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                required
              />

              {error && (
                <p className="col-span-2 text-center text-red-500 font-medium">
                  {error}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="col-span-2 bg-emerald-500 text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 transition-all shadow-lg"
              >
                Register
              </motion.button>

              <p className="col-span-2 text-center text-gray-700 mt-2">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  Login here
                </Link>
              </p>
            </form>
          ) : (
            // 🎉 Success Message
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <h3 className="text-green-600 text-xl font-semibold">
                {message}
              </h3>
              <div className="bg-green-50 border border-green-300 p-4 rounded-xl w-full shadow-sm">
                <p className="text-gray-700">
                  <strong>Full Name:</strong> {formData.fullName}
                </p>
                <p className="text-gray-700">
                  <strong>Login ID:</strong>{" "}
                  <span className="text-emerald-600 font-semibold">
                    {generatedId}
                  </span>
                </p>
                <p className="text-gray-700">
                  <strong>Email:</strong> {formData.email}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/login")}
                className="mt-3 bg-emerald-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-emerald-600 shadow-lg"
              >
                Go to Login
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
