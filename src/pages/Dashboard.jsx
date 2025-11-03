import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import SymptomButton from '../components/SymptomButton'
import DoctorCard from '../components/DoctorCard'
import BotpressChatbot from '../components/BotpressChatbot'
import { Link, useNavigate } from 'react-router-dom'
import StatCard from '../components/StatCard'
import FilterPill from '../components/FilterPill'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClockRotateLeft, faUserDoctor, faBullhorn, faHeartPulse, faBandAid, faMagnifyingGlass, faArrowDownAZ, faCalendarCheck } from '@fortawesome/free-solid-svg-icons'
import { getAllDoctors } from '../services/doctorApi'
import { createToken, getTokensByPatientId } from '../services/tokenApi'
import { getAllAppointments, getAppointmentsByPatientId } from '../services/appointmentApi'
import { getPrescriptionsByPatientId } from '../services/prescriptionApi'

function Dashboard() {
  const navigate = useNavigate()
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
  // Get name from fullName (patients) or name (doctors/admins)
  const patientName = storedUser?.role === 'patient' 
    ? (storedUser.fullName || storedUser.name || 'User') 
    : (storedUser?.name || 'User')
  const symptoms = ['Fever', 'Cough', 'Headache', 'Cold', 'Stomachache']
  const categories = ['All', 'General Medicine', 'Pediatrics', 'Neurology', 'Gastroenterology']
  
  // Map departments to symptoms
  const getSymptomsByDepartment = (department) => {
    const dept = department?.toLowerCase() || ''
    if (dept.includes('general medicine') || dept.includes('general')) {
      return ['Fever', 'Cough']
    } else if (dept.includes('pediatric')) {
      return ['Cold', 'Fever']
    } else if (dept.includes('neurology') || dept.includes('neurolog')) {
      return ['Headache']
    } else if (dept.includes('gastro') || dept.includes('stomach')) {
      return ['Stomachache']
    } else if (dept.includes('cardiology') || dept.includes('cardiac')) {
      return ['Fever', 'Cough']
    }
    // Default symptoms for unknown departments
    return ['Fever', 'Cough', 'Headache']
  }
  
  const [activeSymptom, setActiveSymptom] = useState('')
  const [category, setCategory] = useState('All')
  const [availabilityOnly, setAvailabilityOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('Relevance') // Relevance | Availability | Name

  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingToken, setBookingToken] = useState(false)
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    prescriptions: 0,
    tokensCount: 0
  })
  const [tokenNotification, setTokenNotification] = useState({
    show: false,
    tokenNumber: null,
    doctorName: '',
    tokenId: null
  })
  const [tokenNotificationMinimized, setTokenNotificationMinimized] = useState(false)

  // Get search term from header if available
  useEffect(() => {
    const headerSearch = localStorage.getItem('headerSearch')
    if (headerSearch) {
      setSearch(headerSearch)
      localStorage.removeItem('headerSearch') // Clear after use
    }
  }, [])

  // Fetch doctors only once on mount (no polling)
  useEffect(() => {
    let cancelled = false

    const fetchDoctors = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getAllDoctors()
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(d => {
            const department = d.specialization || 'General Medicine'
            return {
              id: d.id,
              name: d.name,
              department: department,
              available: d.available !== undefined ? d.available : true,
              tags: getSymptomsByDepartment(department)
            }
          })
          if (!cancelled) setDoctors(mapped)
        } else if (data === null || (Array.isArray(data) && data.length === 0)) {
          if (!cancelled) setError('No doctors available. Please check if the backend server is running on http://localhost:3000')
        }
      } catch (e) {
        console.error('Fetch doctors error:', e)
        if (!cancelled) setError('Failed to load doctors. Please check if the backend server is running.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    // Initial fetch only
    fetchDoctors()

    return () => {
      cancelled = true
    }
  }, [])

  // Fetch stats data function (reusable) - only called when needed
  const fetchStats = React.useCallback(async () => {
    if (!storedUser || !storedUser.id) return
    try {
      const [appts, presc, tokens] = await Promise.all([
        getAppointmentsByPatientId(storedUser.id),
        getPrescriptionsByPatientId(storedUser.id),
        getTokensByPatientId(storedUser.id)
      ])
      const now = new Date()
      const upcoming = Array.isArray(appts) ? appts.filter(a => {
        const apptDate = new Date(a.date)
        return !isNaN(apptDate.getTime()) && apptDate >= now
      }).length : 0
      
      const prescriptionCount = Array.isArray(presc) ? presc.length : 0
      
      // Pending appointments are those with status "Pending" (case-insensitive)
      const pendingAppointments = Array.isArray(appts) ? appts.filter(a => {
        const status = (a.status || 'pending').toLowerCase()
        return status === 'pending' || !a.status
      }).length : 0
      
      // Completed appointments count
      const completedAppointments = Array.isArray(appts) ? appts.filter(a => {
        const status = (a.status || '').toLowerCase()
        return status === 'completed'
      }).length : 0
      
      setStats({
        upcomingAppointments: upcoming,
        prescriptions: prescriptionCount,
        tokensCount: completedAppointments // Changed to show completed appointments
      })
    } catch (e) {
      console.error('Fetch stats error:', e)
    }
  }, [storedUser?.id]) // Only depend on user ID

  // Check for pending tokens on mount and whenever stats change
  useEffect(() => {
    const checkPendingTokens = async () => {
      if (!storedUser || !storedUser.id) return
      try {
        const tokens = await getTokensByPatientId(storedUser.id)
        const lower = (s) => (s || '').toLowerCase()
        const pendingToken = tokens.find(t => lower(t.status) === 'pending' || !t.status)
        const skippedToken = tokens.find(t => lower(t.status) === 'skipped')

        // One-time alert if there is a skipped token
        if (skippedToken) {
          const todayKey = `skippedAlertShown-${storedUser.id}-${new Date().toISOString().split('T')[0]}`
          if (!localStorage.getItem(todayKey)) {
            alert('Your previous token was marked as Skipped. You may take the next token.')
            localStorage.setItem(todayKey, '1')
          }
        }

        if (pendingToken) {
          setTokenNotification({
            show: true,
            tokenNumber: pendingToken.tokenNumber,
            doctorName: pendingToken.doctorName || 'Doctor',
            tokenId: pendingToken.id
          })
        } else {
          setTokenNotification({ show: false, tokenNumber: null, doctorName: '', tokenId: null })
          setTokenNotificationMinimized(false)
        }
      } catch (error) {
        console.error('Error checking pending tokens:', error)
      }
    }
    
    if (storedUser && storedUser.id) {
      fetchStats()
      checkPendingTokens()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only runs once on mount

  // Poll token status to detect when consultation is completed
  useEffect(() => {
    if (!storedUser || !storedUser.id) return

    const checkTokenStatus = async () => {
      try {
        const tokens = await getTokensByPatientId(storedUser.id)
        const lower = (s) => (s || '').toLowerCase()
        const pendingToken = tokens.find(t => lower(t.status) === 'pending' || !t.status)
        
        if (pendingToken) {
          // Show notification if pending token exists
          setTokenNotification({
            show: true,
            tokenNumber: pendingToken.tokenNumber,
            doctorName: pendingToken.doctorName || 'Doctor',
            tokenId: pendingToken.id
          })
        } else {
          // Hide notification if no pending tokens
          setTokenNotification({ show: false, tokenNumber: null, doctorName: '', tokenId: null })
          setTokenNotificationMinimized(false)
        }
        
        // Update stats - fetch appointments for completed appointments count
        try {
          const [appts] = await Promise.all([
            getAppointmentsByPatientId(storedUser.id)
          ])
          const completedAppts = Array.isArray(appts) ? appts.filter(a => {
            const status = (a.status || '').toLowerCase()
            return status === 'completed'
          }).length : 0
          setStats(prev => ({ ...prev, tokensCount: completedAppts }))
        } catch (e) {
          console.error('Error updating appointments stats:', e)
        }
      } catch (error) {
        console.error('Error checking token status:', error)
      }
    }

    // Check every 2 seconds for faster updates
    const interval = setInterval(checkTokenStatus, 2000)
    
    return () => clearInterval(interval)
  }, [storedUser?.id])

  const filteredDoctors = useMemo(() => {
    let list = doctors
    if (activeSymptom) {
      list = list.filter(d => d.tags.includes(activeSymptom))
    }
    if (category !== 'All') {
      list = list.filter(d => d.department === category)
    }
    if (availabilityOnly) {
      list = list.filter(d => d.available)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q)
      )
    }

    if (sortBy === 'Availability') {
      list = [...list].sort((a, b) => Number(b.available) - Number(a.available))
    } else if (sortBy === 'Name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    }

    return list
  }, [activeSymptom, category, availabilityOnly, search, sortBy, doctors])

  async function handleBook(doctor) {
    if (!storedUser || !storedUser.id) {
      alert('Please login to book a token')
      return
    }

    // Check if doctor is available
    if (!doctor.available) {
      alert('This doctor is currently unavailable. Please select another doctor.')
      return
    }

    // Check if patient already has a pending token
    try {
      const tokens = await getTokensByPatientId(storedUser.id)
      const lower = (s) => (s || '').toLowerCase()
      const pendingToken = tokens.find(t => lower(t.status) === 'pending' || !t.status)
      
      if (pendingToken) {
        alert(`You already have a pending token (Token #${pendingToken.tokenNumber}) with ${pendingToken.doctorName || 'a doctor'}. Please wait for it to be completed before booking a new token.`)
        return
      }
    } catch (error) {
      console.error('Error checking pending tokens:', error)
    }

    try {
      setBookingToken(true)
      const tokenData = {
        patientId: storedUser.id,
        doctorId: doctor.id,
        doctorName: doctor.name,
        patientName: storedUser.fullName || storedUser.name || patientName,
        status: 'Pending'
      }
      
      const newToken = await createToken(tokenData)
      
      if (newToken) {
        // Refresh stats after successful booking
        await fetchStats()
        // Show notification popup
        setTokenNotification({
          show: true,
          tokenNumber: newToken.tokenNumber,
          doctorName: doctor.name,
          tokenId: newToken.id
        })
        alert(`Token #${newToken.tokenNumber} booked successfully with ${doctor.name}!`)
      } else {
        alert('Failed to book token. Please try again.')
      }
    } catch (error) {
      console.error('Token booking error:', error)
      alert(error.message || 'Failed to book token. Maximum 50 tokens per doctor per day.')
    } finally {
      setBookingToken(false)
    }
  }

  useEffect(() => {
    if (!storedUser || storedUser.role !== 'patient') {
      navigate('/login')
    }
  }, [storedUser, navigate])

  return (
    <Layout patientName={patientName}>
      <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-50">
        {/* Background pattern overlay */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        
        {/* Floating ambient light orbs */}
        <motion.div
          className="absolute rounded-full bg-emerald-300/20 blur-3xl w-96 h-96 -top-32 -left-32"
          animate={{ x: [0, 40, -30, 0], y: [0, 30, -20, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute rounded-full bg-cyan-300/20 blur-3xl w-[32rem] h-[32rem] -bottom-32 -right-32"
          animate={{ x: [0, -50, 35, 0], y: [0, -30, 15, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
        />

        <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-emerald-100/50 bg-white/80 backdrop-blur-2xl p-8 shadow-2xl"
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight mb-2">
                    Welcome back, {patientName} 👋
                  </h2>
                  <p className="mt-2 text-lg text-gray-700">
                    Manage your care, appointments, and records in one place.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link 
                    to="/appointments" 
                    className="inline-flex items-center rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
                  >
                    View Appointments
                  </Link>
                  <Link 
                    to="/profile" 
                    className="inline-flex items-center rounded-xl border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-500 hover:text-white px-6 py-3 font-semibold shadow-md transition-all"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
          </motion.section>

          {/* Stats Cards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="inline-block rounded-xl bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 mb-3">Upcoming</div>
              <div className="text-3xl font-extrabold text-slate-800">
                {stats.upcomingAppointments} {stats.upcomingAppointments === 1 ? 'Appointment' : 'Appointments'}
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="inline-block rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 mb-3">Prescription History</div>
              <div className="text-3xl font-extrabold text-slate-800">
                {stats.prescriptions} {stats.prescriptions === 1 ? 'Prescription' : 'Prescriptions'}
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="inline-block rounded-xl bg-cyan-100 px-3 py-1.5 text-xs font-semibold text-cyan-700 mb-3">Completed Appointments</div>
              <div className="text-3xl font-extrabold text-slate-800">
                {stats.tokensCount} {stats.tokensCount === 1 ? 'Appointment' : 'Appointments'}
              </div>
              {stats.tokensCount > 0 && (
                <p className="text-xs text-gray-500 mt-2">Consultations completed</p>
              )}
            </motion.div>
          </motion.section>

          {/* History Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -3 }}
              className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border-l-emerald-500"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <FontAwesomeIcon icon={faClockRotateLeft} className="text-emerald-600" />
                  Your History
                </h2>
                <Link 
                  to="/patient_history" 
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
                >
                  View
                </Link>
              </div>
              <p className="text-sm text-gray-600">Past appointments, prescriptions and lab reports.</p>
            </motion.div>
          </motion.section>

          {/* Symptoms Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg"
          >
            <h3 className="text-lg font-bold text-emerald-700 flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faBandAid} className="text-emerald-600" />
              Symptoms
            </h3>
            <div className="flex flex-wrap gap-3">
              <SymptomButton label="All" isActive={!activeSymptom} onClick={() => setActiveSymptom('')} />
              {symptoms.map(s => (
                <SymptomButton key={s} label={s} isActive={activeSymptom === s} onClick={() => setActiveSymptom(s)} />
              ))}
            </div>
          </motion.section>

          {/* Filter Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-emerald-700">Filter by Department</h3>
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={availabilityOnly} 
                  onChange={(e) => setAvailabilityOnly(e.target.checked)}
                  className="rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500"
                />
                Show available only
              </label>
            </div>
            <div className="flex flex-wrap gap-3 mb-3">
              {categories.map(c => (
                <FilterPill key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
              ))}
            </div>
            <button
              className="rounded-xl border-2 border-emerald-500 bg-white hover:bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-all"
              onClick={() => { setActiveSymptom(''); setCategory('All'); setAvailabilityOnly(false); setSearch(''); setSortBy('Relevance') }}
            >
              Reset filters
            </button>
          </motion.section>

          {/* Doctors Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg space-y-4"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-bold text-emerald-700 flex items-center gap-2">
                <FontAwesomeIcon icon={faUserDoctor} className="text-emerald-600" />
                Available Doctors
              </h3>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by doctor or department"
                    className="w-full sm:w-72 rounded-xl border-2 border-emerald-100 bg-white/90 backdrop-blur-sm pl-11 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faArrowDownAZ} className="text-emerald-600" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl border-2 border-emerald-100 bg-white/90 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option>Relevance</option>
                    <option>Availability</option>
                    <option>Name</option>
                  </select>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {filteredDoctors.length} results
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {!loading && !error && filteredDoctors.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="transform-gpu transition duration-200"
                >
                  <DoctorCard doctor={doc} onBook={handleBook} />
                </motion.div>
              ))}
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-5 animate-pulse">
                  <div className="h-1 w-full rounded-full bg-emerald-100 mb-4" />
                  <div className="h-6 w-2/3 bg-emerald-100 rounded-lg mb-2" />
                  <div className="h-4 w-1/3 bg-emerald-100 rounded-lg mb-4" />
                  <div className="h-10 w-32 bg-emerald-100 rounded-xl" />
                </div>
              ))}
            </div>
            {error && (
              <div className="rounded-2xl border-2 border-dashed border-red-300 bg-red-50/80 backdrop-blur-sm p-6 text-center text-red-700 font-medium">
                {error}
              </div>
            )}
            {!loading && !error && filteredDoctors.length === 0 && (
              <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/80 backdrop-blur-sm p-8 text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FontAwesomeIcon icon={faUserDoctor} className="text-emerald-600 text-xl" />
                </div>
                <p className="text-gray-600 font-medium">No doctors match your filters. Try adjusting search or filters.</p>
              </div>
            )}

            <div className="pt-4">
              <Link 
                to="/appointments" 
                className="inline-flex items-center rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                Show Appointments Page
              </Link>
            </div>
          </motion.section>

          {/* Helpful Links & Info Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -3 }}
              className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-emerald-700 flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faBullhorn} className="text-emerald-600" />
                Announcements
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>Free health check-up camp scheduled for next week.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>Cardiology department now open on weekends with extended hours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>Blood donation drive organized on campus this Friday.</span>
                </li>
              </ul>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, y: -3 }}
              className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <h3 className="text-lg font-bold text-emerald-700 flex items-center gap-2 mb-4">
                <FontAwesomeIcon icon={faHeartPulse} className="text-emerald-600" />
                Health Tips
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>Stay hydrated and aim for 7–8 hours of quality sleep daily.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>Take at least 30 minutes of walking or light exercise every day for heart health.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>Include more fruits, vegetables, and whole grains in your diet.</span>
                </li>
              </ul>
            </motion.div>
          </motion.section>
        </main>
      </div>
      
      {/* Floating Chat Button */}
      <BotpressChatbot floating={true} />

      {/* Token Notification Popup */}
      {tokenNotification.show && !tokenNotificationMinimized && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 max-w-md"
        >
          <div className="relative rounded-2xl border-2 border-emerald-500 bg-white shadow-2xl p-6">
            <div className="absolute -top-3 -right-3">
              <button
                onClick={() => setTokenNotification({ show: false, tokenNumber: null, doctorName: '', tokenId: null })}
                className="rounded-full bg-red-500 hover:bg-red-600 text-white w-8 h-8 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>
            <div className="absolute -top-3 -left-3">
              <button
                onClick={() => setTokenNotificationMinimized(true)}
                className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white w-8 h-8 flex items-center justify-center transition-colors"
                title="Hide notification"
              >
                −
              </button>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-emerald-100 p-3">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-emerald-600 text-2xl" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-emerald-700 mb-1">Token Booked Successfully!</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Your token <span className="font-bold text-emerald-600">#{tokenNotification.tokenNumber}</span> has been booked with{' '}
                  <span className="font-semibold">{tokenNotification.doctorName}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Waiting for doctor consultation... This notification will automatically disappear once the consultation is completed.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-emerald-100">
              <div className="flex items-center gap-2 text-xs text-emerald-600">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Consultation Status: Pending</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating minimized token icon (bottom-left) */}
      {tokenNotification.show && tokenNotificationMinimized && (
        <button
          onClick={() => setTokenNotificationMinimized(false)}
          className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center"
          title={`Token #${tokenNotification.tokenNumber} — ${tokenNotification.doctorName}`}
        >
          <FontAwesomeIcon icon={faCalendarCheck} />
        </button>
      )}
    </Layout>
  )
}

export default Dashboard