import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'

function Header({ patientName }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Store search term in localStorage and navigate to dashboard
      localStorage.setItem('headerSearch', searchTerm.trim())
      navigate('/dashboard')
      setSearchTerm('') // Clear search after navigation
    }
  }

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
        <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-2.5 text-white/70 z-10" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search doctors, departments..."
            className="pl-10 pr-4 py-2 w-80 rounded-full border border-white/30 bg-white/20 text-white placeholder-white/70 focus:bg-white focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-white transition duration-200"
          />
        </form>

        {/* Profile & Logout */}
        <div className="flex items-center gap-3">
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
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/40 text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition backdrop-blur-sm"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  )
}

export default Header
