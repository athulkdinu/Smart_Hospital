import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faEnvelope, faPhone, faMapMarkerAlt, faCalendarCheck, faTicketAlt, faClock } from '@fortawesome/free-solid-svg-icons'
import { getPatientById } from '../services/patientApi'
import { getAllAppointments, getAppointmentsByPatientId } from '../services/appointmentApi'
import { getAllDoctors } from '../services/doctorApi'
import { getTokensByPatientId } from '../services/tokenApi'

function Profile() {
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  }, [])

  // Get name from fullName (patients) or name (doctors/admins)
  const patientName = storedUser?.role === 'patient' 
    ? (storedUser.fullName || storedUser.name || 'User') 
    : (storedUser?.name || 'User')
  const [user, setUser] = useState(storedUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [appointments, setAppointments] = useState([])
  const [apptLoading, setApptLoading] = useState(false)
  const [apptError, setApptError] = useState('')
  const [tokens, setTokens] = useState([])
  const [tokenLoading, setTokenLoading] = useState(false)
  const [tokenError, setTokenError] = useState('')

  useEffect(() => {
    let cancelled = false
    const enrichFromApi = async () => {
      if (!storedUser) return
      if (storedUser.role === 'patient' && storedUser.id) {
        try {
          setLoading(true)
          setError('')
          const data = await getPatientById(storedUser.id)
          if (!cancelled && data && typeof data === 'object') {
            // Merge API data with stored user data, ensuring name is set correctly
            setUser(prev => ({ 
              ...prev, 
              ...data,
              fullName: data.fullName || prev?.fullName || storedUser.fullName,
              name: data.fullName || data.name || prev?.name || storedUser.fullName || storedUser.name || 'Unknown User'
            }))
          } else if (!cancelled) {
            // If API call fails or returns nothing, use stored user data
            setUser(prev => ({
              ...prev,
              fullName: prev?.fullName || storedUser.fullName,
              name: prev?.fullName || prev?.name || storedUser.fullName || storedUser.name || 'Unknown User'
            }))
          }
        } catch (e) {
          if (!cancelled) {
            setError('Failed to load profile details')
            // Fallback to stored user data
            setUser(prev => ({
              ...prev,
              fullName: prev?.fullName || storedUser.fullName,
              name: prev?.fullName || prev?.name || storedUser.fullName || storedUser.name || 'Unknown User'
            }))
          }
        } finally {
          if (!cancelled) setLoading(false)
        }
      }
    }
    enrichFromApi()
    return () => { cancelled = true }
  }, [storedUser])

  // Load recent appointments for this patient - ONLY on mount
  useEffect(() => {
    let cancelled = false
    const loadAppointments = async () => {
      if (!storedUser?.id) return
      try {
        setApptLoading(true)
        setApptError('')
        const [appts, docs] = await Promise.all([
          getAppointmentsByPatientId(storedUser.id),
          getAllDoctors()
        ])
        if (!cancelled && Array.isArray(appts)) {
          const doctorMap = new Map((docs || []).map(d => [String(d.id), d.name]))
          const myAppts = appts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(a => ({
              id: a.id,
              date: a.date,
              time: a.time,
              doctor: doctorMap.get(String(a.doctorId)) || `Doctor #${a.doctorId}`,
              issue: a.issue || 'General consultation'
            }))
          setAppointments(myAppts)
        }
      } catch (e) {
        if (!cancelled) setApptError('Failed to load recent appointments')
      } finally {
        if (!cancelled) setApptLoading(false)
      }
    }
    loadAppointments()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Load tokens for this patient - ONLY on mount
  useEffect(() => {
    let cancelled = false
    const loadTokens = async () => {
      if (!storedUser?.id) return
      try {
        setTokenLoading(true)
        setTokenError('')
        const patientTokens = await getTokensByPatientId(storedUser.id)
        if (!cancelled && Array.isArray(patientTokens)) {
          // Sort by date (newest first) and show most recent 10
          const sortedTokens = patientTokens
            .sort((a, b) => {
              const dateA = a.date ? new Date(a.date) : new Date(0)
              const dateB = b.date ? new Date(b.date) : new Date(0)
              return dateB - dateA
            })
            .slice(0, 10)
          setTokens(sortedTokens)
        }
      } catch (e) {
        if (!cancelled) setTokenError('Failed to load tokens')
      } finally {
        if (!cancelled) setTokenLoading(false)
      }
    }
    loadTokens()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  return (
    <Layout patientName={user?.fullName || user?.name || patientName}>
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

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-emerald-100/50 bg-white/80 backdrop-blur-2xl p-8 shadow-2xl"
          >
            <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight mb-2">
                  Profile
                </h1>
                <p className="mt-2 text-lg text-gray-700">Manage your personal details and preferences.</p>
              </div>
              {user && (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100/80 backdrop-blur-sm px-4 py-2 text-xs font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {user.role ? String(user.role).toUpperCase() : 'USER'}
                </span>
              )}
            </div>
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
          </motion.section>

          {/* Profile Info Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Profile Avatar Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -3 }}
              className="md:col-span-1 rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 border-4 border-emerald-100 flex items-center justify-center text-white font-bold text-3xl shadow-lg mb-4">
                  {(user?.fullName || user?.name) ? (user.fullName || user.name).charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="mb-4">
                    <div className="text-xl font-bold text-gray-800 mb-1">{user?.fullName || user?.name || 'Unknown User'}</div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <FontAwesomeIcon icon={faEnvelope} className="text-emerald-500" />
                    {user?.email || 'No email set'}
                  </div>
                </div>
                <div className="w-full grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/50 p-3">
                    <div className="text-xs text-gray-600 font-medium mb-1">Role</div>
                    <div className="font-bold text-emerald-700">{user?.role || '—'}</div>
                  </div>
                  <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/50 p-3">
                    <div className="text-xs text-gray-600 font-medium mb-1">ID</div>
                    <div className="font-bold text-emerald-700">{user?.id ?? '—'}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="md:col-span-2 rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg"
            >
              <h2 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-emerald-600" />
                Personal Information
              </h2>
              {loading && (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 w-48 bg-emerald-100 rounded-lg" />
                  <div className="h-4 w-56 bg-emerald-100 rounded-lg" />
                  <div className="h-4 w-44 bg-emerald-100 rounded-lg" />
                </div>
              )}
              {error && (
                <div className="rounded-xl border-2 border-red-300 bg-red-50/80 backdrop-blur-sm px-4 py-3 text-sm text-red-700 font-medium">
                  {error}
                </div>
              )}
              {!loading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/30 p-4">
                    <div className="text-xs text-gray-600 font-semibold mb-1 flex items-center gap-1">
                      <FontAwesomeIcon icon={faUser} className="text-emerald-500" />
                      Full Name
                    </div>
                    <div className="font-bold text-gray-800">{user?.fullName || user?.name || '—'}</div>
                  </div>
                  <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/30 p-4">
                    <div className="text-xs text-gray-600 font-semibold mb-1 flex items-center gap-1">
                      <FontAwesomeIcon icon={faEnvelope} className="text-emerald-500" />
                      Email
                    </div>
                    <div className="font-bold text-gray-800">{user?.email || '—'}</div>
                  </div>
                  <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/30 p-4">
                    <div className="text-xs text-gray-600 font-semibold mb-1">Gender</div>
                    <div className="font-bold text-gray-800">{user?.gender || '—'}</div>
                  </div>
                  <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/30 p-4">
                    <div className="text-xs text-gray-600 font-semibold mb-1">Age</div>
                    <div className="font-bold text-gray-800">{user?.age ?? '—'}</div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.section>

          {/* Contact & Preferences */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faPhone} className="text-emerald-600" />
              Contact & Preferences
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/30 p-4">
                <div className="text-xs text-gray-600 font-semibold mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faPhone} className="text-emerald-500" />
                  Phone
                </div>
                <div className="font-bold text-gray-800">{user?.phone || '—'}</div>
              </div>
              <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/30 p-4">
                <div className="text-xs text-gray-600 font-semibold mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faEnvelope} className="text-emerald-500" />
                  Preferred Contact
                </div>
                <div className="font-bold text-gray-800">{user?.preferredContact || 'Email'}</div>
              </div>
              <div className="rounded-xl border-2 border-emerald-100 bg-emerald-50/30 p-4 sm:col-span-2">
                <div className="text-xs text-gray-600 font-semibold mb-1 flex items-center gap-1">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="text-emerald-500" />
                  Address
                </div>
                <div className="font-bold text-gray-800">{user?.address || '—'}</div>
              </div>
            </div>
          </motion.section>

          {/* Recent Appointments */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-emerald-700 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-emerald-600" />
                Recent Appointments
              </h2>
              {appointments.length > 0 && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Showing {appointments.length} most recent
                </span>
              )}
            </div>
            {apptLoading && (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-emerald-100 rounded-xl" />
                <div className="h-16 bg-emerald-100 rounded-xl" />
                <div className="h-16 bg-emerald-100 rounded-xl" />
              </div>
            )}
            {apptError && (
              <div className="rounded-xl border-2 border-red-300 bg-red-50/80 backdrop-blur-sm px-4 py-3 text-sm text-red-700 font-medium">
                {apptError}
              </div>
            )}
            {!apptLoading && !apptError && (
              <div className="divide-y divide-emerald-100">
                {appointments.length === 0 && (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-3">
                      <FontAwesomeIcon icon={faCalendarCheck} className="text-emerald-600 text-2xl" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">No recent appointments.</p>
                  </div>
                )}
                {appointments.map(a => (
                  <motion.div
                    key={a.id}
                    whileHover={{ x: 5 }}
                    className="py-4 flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} className="text-emerald-500" />
                        {a.date} at {a.time}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">with {a.doctor}</div>
                      {a.issue && (
                        <div className="text-xs text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-full mt-1">
                          {a.issue}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Booked Tokens */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-emerald-700 flex items-center gap-2">
                <FontAwesomeIcon icon={faTicketAlt} className="text-emerald-600" />
                Booked Tokens
              </h2>
              {tokens.length > 0 && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Showing {tokens.length} most recent
                </span>
              )}
            </div>
            {tokenLoading && (
              <div className="space-y-3 animate-pulse">
                <div className="h-16 bg-emerald-100 rounded-xl" />
                <div className="h-16 bg-emerald-100 rounded-xl" />
                <div className="h-16 bg-emerald-100 rounded-xl" />
              </div>
            )}
            {tokenError && (
              <div className="rounded-xl border-2 border-red-300 bg-red-50/80 backdrop-blur-sm px-4 py-3 text-sm text-red-700 font-medium">
                {tokenError}
              </div>
            )}
            {!tokenLoading && !tokenError && (
              <div className="divide-y divide-emerald-100">
                {tokens.length === 0 && (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-3">
                      <FontAwesomeIcon icon={faTicketAlt} className="text-emerald-600 text-2xl" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">No tokens booked yet.</p>
                  </div>
                )}
                {tokens.map((token, index) => (
                  <motion.div
                    key={token.id || index}
                    whileHover={{ x: 5 }}
                    className="py-4 flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 mb-2 flex items-center gap-2 flex-wrap">
                        <span className="text-emerald-600">Token #{token.tokenNumber || 'N/A'}</span>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                          {token.doctorName || `Doctor #${token.doctorId}`}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                        <FontAwesomeIcon icon={faClock} className="text-emerald-500" />
                        Date: {token.date ? new Date(token.date).toLocaleDateString() : 'N/A'}
                      </div>
                      {token.createdAt && (
                        <div className="text-xs text-gray-500">
                          Booked: {new Date(token.createdAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </Layout>
  )
}

export default Profile