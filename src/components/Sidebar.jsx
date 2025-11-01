import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faCog,
  faBars,
  faUserDoctor,
} from "@fortawesome/free-solid-svg-icons";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: faHome, path: "/" },
    { name: "Patients", icon: faUser, path: "/patient" },
    { name: "Doctors", icon: faUserDoctor, path: "/doctor" },
  ];

  return (
    <motion.div
      animate={{ width: isOpen ? 220 : 80 }}
      transition={{ duration: 0.4, type: "tween" }}
      className="h-screen bg-linear-to-b from-gray-900 to-gray-800 text-gray-200 flex flex-col shadow-lg"
    >
      {/* Header / Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <AnimatePresence>
          {isOpen && (
            <motion.h1
              key="title"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="text-xl font-semibold tracking-wide"
            >
              My App
            </motion.h1>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-300 hover:text-white focus:outline-none"
        >
          <FontAwesomeIcon icon={faBars} size="lg" />
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 mt-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              to={item.path}
              key={item.name}
              className={`flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <FontAwesomeIcon icon={item.icon} size="lg" />
              </motion.div>

              {/* Animated Text */}
              <AnimatePresence>
                {isOpen && (
                  <motion.span
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                    className="text-sm font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="footer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="p-4 text-xs text-gray-400 border-t border-gray-700"
          >
            © 2025 My App
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Sidebar;
