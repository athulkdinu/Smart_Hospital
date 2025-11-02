import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faSearch,
  faCaretDown,
  faBars,
} from "@fortawesome/free-solid-svg-icons";

const DashboardHeader = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-lg border-b border-gray-700 text-gray-100 flex items-center justify-between px-6 shadow-lg z-50">
      {/* Left section (Logo / App name) */}
      <div className="flex items-center gap-3">
        <FontAwesomeIcon icon={faBars} className="text-gray-300 text-lg cursor-pointer hover:text-blue-400 transition" />
        <h1 className="text-xl font-semibold tracking-wide text-white">
          Smart<span className="text-blue-400">Hospital</span>
        </h1>
      </div>

      {/* Center (Search bar) */}
      <div className="hidden md:flex items-center bg-gray-700/60 rounded-full px-3 py-2 w-80 focus-within:ring-2 focus-within:ring-blue-500 transition">
        <FontAwesomeIcon icon={faSearch} className="text-gray-400 mr-2 text-sm" />
        <input
          type="text"
          placeholder="Search patients, doctors, tokens..."
          className="bg-transparent outline-none text-sm w-full text-gray-200 placeholder-gray-400"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-6 relative">

        {/* Profile Section */}
        <div
          className="flex items-center gap-2 cursor-pointer hover:text-blue-400 transition relative"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
        >
          <img
            src="https://i.pravatar.cc/40"
            alt="User"
            className="w-9 h-9 rounded-full border border-gray-600"
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-medium">Suryajith</span>
            <span className="text-xs text-gray-400">Admin</span>
          </div>
          <FontAwesomeIcon icon={faCaretDown} className="text-sm" />

          {/* Profile dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-44 text-sm">
              <ul>
                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">My Profile</li>
                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer">Settings</li>
                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-red-400">
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
