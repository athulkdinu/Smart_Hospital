import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
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
      {/* Overlay with blur */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[6px]"></div>

      {/* Floating background lights */}
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

      {/* Glass card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/75 backdrop-blur-2xl border border-emerald-100 p-8 w-full max-w-4xl rounded-3xl shadow-2xl grid md:grid-cols-2 gap-6 items-center"
        style={{ height: "80vh" }}
      >
        {/* Left: Heading and quote */}
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

        {/* Right: Registration form */}
        <div className="h-full flex flex-col justify-center">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-3 text-center underline decoration-emerald-400">
            Patient Registration
          </h2>

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
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
