import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faSearch,
  faUserCircle,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";

const DashboardHeader = () => {
    const handleInput=(e)=>{
        console.log(e.target.value)
    }
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-linear-to-r from-gray-900 to-gray-800 text-gray-100 flex items-center justify-between px-6 shadow-md z-20">
      {/* Left section (Logo / App name) */}
      <div className="flex items-center gap-3">
        <FontAwesomeIcon icon={faUserCircle} className="text-blue-400 text-2xl" />
        <h1 className="text-lg font-semibold tracking-wide">My Health Portal</h1>
      </div>

      {/* Center (Search bar) */}
      <div className="hidden md:flex items-center bg-gray-700 rounded-full px-3 py-2 w-72">
        <FontAwesomeIcon icon={faSearch} className="text-gray-400 mr-2 text-sm" />
        <input
          type="text"
          placeholder="Search..."
          onChange={(e)=>handleInput(e)}
          className="bg-transparent outline-none text-sm w-full text-gray-200 placeholder-gray-400"
        />
      </div>

      {/* Profile section */}
      <div className="flex items-center gap-6">
        {/* Notification Bell
        <button className="relative hover:text-blue-400 transition-colors">
          <FontAwesomeIcon icon={faBell} className="text-lg" />
        </button> */}

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer hover:text-blue-400 transition">
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
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
