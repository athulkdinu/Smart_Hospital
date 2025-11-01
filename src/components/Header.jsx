import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faUser } from '@fortawesome/free-solid-svg-icons'

function Header({ patientName }) {
  return (
    <header className="w-full bg-gradient-to-r from-blue-600 to-teal-500 shadow-lg sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-white hover:scale-105 transition-transform duration-200">
            MediConnect
          </h1>
          <span className="text-sm text-white/80 hidden sm:inline">Patient</span>
        </Link>

        {/* Search */}
        <div className="hidden md:flex items-center relative">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-2.5 text-white/70" />
          <input
            type="text"
            placeholder="Search doctors, departments..."
            className="pl-10 pr-4 py-2 w-80 rounded-full border border-white/30 bg-white/20 text-white placeholder-white/70 focus:bg-white focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-white transition duration-200"
          />
        </div>

        {/* Profile */}
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-white/90 font-medium">
            Hi, {patientName}
          </span>
          <Link
            to="/profile"
            className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition"
          >
            <FontAwesomeIcon icon={faUser} />
            Profile
          </Link>
        </div>

      </div>
    </header>
  )
}

export default Header
