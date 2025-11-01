import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const bgUrl =
  "https://cdn.dribbble.com/userupload/23002793/file/original-3f028f30f7f023f692a0d341f2ca3741.gif";

export default function LandingHero() {
  return (
    <div
      className="relative h-screen flex flex-col justify-center items-center text-center bg-cover bg-center"
      style={{ backgroundImage: `url('${bgUrl}')` }}
    >
      <div className="absolute inset-0 bg-emerald-900/50 backdrop-blur-sm"></div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 text-white px-6"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
          Welcome to <span className="text-emerald-300">MediConnect</span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto text-emerald-100 mb-8">
          Smart Hospital — Where technology meets compassionate care.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-white text-emerald-600 hover:bg-emerald-100 px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
          >
            Register
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
