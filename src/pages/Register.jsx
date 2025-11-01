import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("registeredUser", JSON.stringify(form));
    navigate("/login");
  };

  // Background (same as Login)
  const bgUrl =
    "https://cdn.dribbble.com/userupload/23002793/file/original-3f028f30f7f023f692a0d341f2ca3741.gif";

  return (
    <div
      className="h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: `url("${bgUrl}")` }}
    >
      {/* Background blur overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[10px]"></div>

      {/* Floating animation */}
      <motion.div
        className="absolute rounded-full bg-emerald-300/20 blur-3xl w-96 h-96 -left-24 -top-24"
        animate={{ x: [0, 40, -20, 0], y: [0, 20, -10, 0] }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full bg-cyan-300/20 blur-3xl w-[28rem] h-[28rem] -right-24 -bottom-24"
        animate={{ x: [0, -40, 20, 0], y: [0, -20, 10, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />

      {/* Registration Form Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-emerald-100"
      >
        <h1 className="text-3xl font-extrabold text-center text-emerald-700 underline mb-2">
          MediConnect
        </h1>
        <p className="text-center text-slate-600 mb-6">
          Smart Hospital Patient Registration
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1 font-medium">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
              required
              className="styled-input"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Age</label>
            <input
              type="number"
              name="age"
              placeholder="Enter your age"
              value={form.age}
              onChange={handleChange}
              required
              className="styled-input"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">
              Gender
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="styled-input custom-select"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
              className="styled-input"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 mb-1 font-medium">Phone</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={handleChange}
              required
              className="styled-input"
            />
          </div>

          {/* Address */}
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1 font-medium">
              Address
            </label>
            <textarea
              name="address"
              placeholder="Enter your address"
              value={form.address}
              onChange={handleChange}
              rows="2"
              required
              className="styled-input resize-none"
            ></textarea>
          </div>

          {/* Password */}
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1 font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
              className="styled-input"
            />
          </div>

          {/* Submit */}
          <div className="col-span-2 text-center mt-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-emerald-500 text-white font-semibold py-3 rounded-xl hover:bg-emerald-600 transition-all shadow-md"
            >
              Register
            </motion.button>

            <p className="mt-3 text-gray-700">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-600 font-semibold hover:underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
