import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  const bgUrl =
    "https://cdn.dribbble.com/userupload/23002793/file/original-3f028f30f7f023f692a0d341f2ca3741.gif";

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url('${bgUrl}')` }}
    >
      {/* 🌫️ Background blur layer */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[6px]" />

      {/* 🩺 Floating ambient light orbs */}
      <motion.div
        className="absolute rounded-full bg-emerald-300/25 blur-3xl w-80 h-80 -top-20 -left-20"
        animate={{ x: [0, 30, -20, 0], y: [0, 20, -15, 0] }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full bg-cyan-300/25 blur-3xl w-[28rem] h-[28rem] -bottom-20 -right-20"
        animate={{ x: [0, -40, 25, 0], y: [0, -20, 10, 0] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
      />

      {/* 🧊 Glassmorphic main content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 bg-white/80 backdrop-blur-2xl border border-emerald-100 
                   rounded-3xl shadow-2xl text-center p-12 md:p-16 w-[90%] max-w-3xl"
      >
        {/* 🌿 Logo / Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-extrabold text-emerald-700 mb-4 drop-shadow-md"
        >
          MediConnect
        </motion.h1>

        {/* ✨ Subtitle / Quote */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed max-w-2xl mx-auto mb-10 italic"
        >
          “Where technology meets care — <br />
          connecting hearts, healing minds, empowering hospitals.”
        </motion.p>

        {/* 🌈 Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-center gap-5 mt-6"
        >
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white 
                       text-lg font-semibold rounded-xl shadow-lg transition-all"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-3 border-2 border-emerald-500 text-emerald-700 
                       hover:bg-emerald-500 hover:text-white text-lg font-semibold 
                       rounded-xl shadow-md transition-all"
          >
            Register as Patient
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Landing;
