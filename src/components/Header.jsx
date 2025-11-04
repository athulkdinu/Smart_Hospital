import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faUser, faRightFromBracket } from '@fortawesome/free-solid-svg-icons'

function Header({ patientName }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isDoctor = user?.role === 'doctor'
  const showSearch = location.pathname.startsWith('/dashboard')

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      localStorage.setItem('headerSearch', searchTerm.trim())
      navigate('/dashboard')
      setSearchTerm('')
    }
  }

  return (
    <header className="w-full sticky top-0 z-50 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">

        {/* Left: Brand */}
        <Link to={isDoctor ? "/doctor" : "/dashboard"} className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-white/30 flex items-center justify-center shadow-inner">
            <span className="text-emerald-900 font-extrabold">M</span>
          </div>
          <div className="leading-tight">
            <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight group-hover:opacity-90">MediConnect</div>
            <div className="text-[10px] font-semibold text-white/80 hidden sm:block">{isDoctor ? "Doctor Portal" : "Patient Portal"}</div>
          </div>
        </Link>

        {/* Middle: Search */}
        {showSearch && (
          <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-2.5 text-white/80 z-10" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctors, departments..."
              className="pl-10 pr-4 py-2 w-80 rounded-xl border border-white/20 bg-white/20 text-white placeholder-white/70 focus:bg-white focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
            />
          </form>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:inline text-white/95 font-semibold">
            Hi, {patientName}
          </span>
          <Link
            to={isDoctor ? "/dr_profile" : "/profile"}
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-4 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition hover:-translate-y-0.5"
          >
            <FontAwesomeIcon icon={faUser} />
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 border border-white/30 text-white/95 px-4 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg transition hover:-translate-y-0.5 bg-white/10 hover:bg-white/20 backdrop-blur"
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
