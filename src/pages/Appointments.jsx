import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import DoctorCard from '../components/DoctorCard'
import FilterPill from '../components/FilterPill'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarCheck, faClock, faCalendarDays, faUserDoctor, faClockRotateLeft, faXmark } from '@fortawesome/free-solid-svg-icons'
import { getAllDoctors } from '../services/doctorApi'
import { getAllAppointments, createAppointment } from '../services/appointmentApi'

function Appointments() {
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
  const [availableDoctors, setAvailableDoctors] = useState([])

  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const categories = ['All', ...Array.from(new Set(availableDoctors.map(d => d.department)))]
  const [category, setCategory] = useState('All')
  const [availabilityOnly, setAvailabilityOnly] = useState(false)
  const [upcoming, setUpcoming] = useState([])
  const [previous, setPrevious] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [appointmentNotification, setAppointmentNotification] = useState({
    show: false,
    pendingAppointments: [] // Array of all pending appointments
  })
  const [appointmentNotificationMinimized, setAppointmentNotificationMinimized] = useState(false)

  // Fetch appointments and doctors (reusable function)
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const [docs, appts] = await Promise.all([
        getAllDoctors(),
        getAllAppointments()
      ])
      if (Array.isArray(docs) && docs.length > 0) {
        const mappedDocs = docs.map(d => ({
          id: d.id,
          name: d.name,
          department: d.specialization || 'General Medicine',
          available: d.available !== undefined ? d.available : true
        }))
        setAvailableDoctors(mappedDocs)
      } else if (docs === null || (Array.isArray(docs) && docs.length === 0)) {
        setError('No doctors available. Please check if the backend server is running.')
      }
      
      if (Array.isArray(appts)) {
        const doctorIdToName = new Map((docs || []).map(d => [String(d.id), d.name]))
        const now = new Date()
        // Filter appointments by logged-in patient if user is a patient
        let filteredAppts = appts
        if (storedUser?.role === 'patient' && storedUser?.id) {
          filteredAppts = appts.filter(a => String(a.patientId) === String(storedUser.id))
        }
        const normalized = filteredAppts.map(a => ({
          id: a.id,
          date: a.date,
          time: a.time,
          doctor: doctorIdToName.get(String(a.doctorId)) || `Doctor #${a.doctorId}`,
          type: 'Consultation',
          status: (a.status || 'Pending').toLowerCase() // Normalize to lowercase for comparison
        }))
        
        // Categorize by status: Pending = Upcoming, Completed = Previous
        const upcomingList = normalized.filter(a => {
          const status = (a.status || 'pending').toLowerCase()
          return status === 'pending' || !a.status
        })
        const previousList = normalized.filter(a => {
          const status = (a.status || 'pending').toLowerCase()
          return status === 'completed'
        })
        
        setUpcoming(upcomingList)
        setPrevious(previousList)
      } else if (appts === null) {
        setError('Failed to load appointments. Please check if the backend server is running on http://localhost:3000')
      }

    } catch (e) {
      console.error('Fetch error:', e)
      setError('Failed to load data. Please check if the backend server is running.')
    } finally {
      setLoading(false)
    }
  }, [storedUser])

  // Fetch appointments ONLY on initial mount
  useEffect(() => {
    if (storedUser && storedUser.id) {
      fetchAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only runs once on mount


  // Check for pending appointments on mount and show notification
  useEffect(() => {
    const checkPendingAppointments = async () => {
      if (!storedUser || !storedUser.id || storedUser.role !== 'patient') return
      try {
        const appts = await getAllAppointments()
        if (Array.isArray(appts)) {
          const patientAppts = appts.filter(a => String(a.patientId) === String(storedUser.id))
          const pendingAppts = patientAppts.filter(a => {
            const status = (a.status || 'pending').toLowerCase()
            return status === 'pending' || !a.status
          })
          
          if (pendingAppts.length > 0) {
            // Show all pending appointments
            const formattedPending = pendingAppts.map(apt => ({
              id: apt.id,
              doctorName: apt.doctorName || `Doctor #${apt.doctorId}`,
              date: apt.date,
              time: apt.time
            }))
            setAppointmentNotification({
              show: true,
              pendingAppointments: formattedPending
            })
          }
        }
      } catch (error) {
        console.error('Error checking pending appointments:', error)
      }
    }
    
    if (storedUser && storedUser.id) {
      checkPendingAppointments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll appointment status to detect when consultation is completed and update notification + lists
  useEffect(() => {
    if (!storedUser || !storedUser.id || storedUser.role !== 'patient') return

    const checkAppointmentStatus = async () => {
      try {
        const [docs, appts] = await Promise.all([
          getAllDoctors(),
          getAllAppointments()
        ])
        
        if (Array.isArray(appts)) {
          const doctorIdToName = new Map((docs || []).map(d => [String(d.id), d.name]))
          const now = new Date()
          
          // Filter appointments by logged-in patient
          const patientAppts = appts.filter(a => String(a.patientId) === String(storedUser.id))
          
          // Update appointment lists with status
          const normalized = patientAppts.map(a => ({
            id: a.id,
            date: a.date,
            time: a.time,
            doctor: doctorIdToName.get(String(a.doctorId)) || `Doctor #${a.doctorId}`,
            type: 'Consultation',
            status: (a.status || 'Pending').toLowerCase() // Normalize to lowercase
          }))
          
          // Categorize by status: Pending = Upcoming, Completed = Previous
          const upcomingList = normalized.filter(a => {
            const status = (a.status || 'pending').toLowerCase()
            return status === 'pending' || !a.status
          })
          const previousList = normalized.filter(a => {
            const status = (a.status || 'pending').toLowerCase()
            return status === 'completed'
          })
          
          setUpcoming(upcomingList)
          setPrevious(previousList)
          
          // Update notification based on pending appointments
          const pendingAppts = patientAppts.filter(a => {
            const status = (a.status || 'pending').toLowerCase()
            return status === 'pending' || !a.status
          })
          
          if (pendingAppts.length > 0) {
            // Show all pending appointments
            const formattedPending = pendingAppts.map(apt => ({
              id: apt.id,
              doctorName: apt.doctorName || `Doctor #${apt.doctorId}`,
              date: apt.date,
              time: apt.time
            }))
            setAppointmentNotification({
              show: true,
              pendingAppointments: formattedPending
            })
            // Keep minimized state as-is
          } else {
            // No pending appointments, hide notification
            setAppointmentNotification({ show: false, pendingAppointments: [] })
            setAppointmentNotificationMinimized(false)
          }
        }
      } catch (error) {
        console.error('Error checking appointment status:', error)
      }
    }

    // Initial check
    checkAppointmentStatus()
    
    // Check every 2 seconds for faster updates
    const interval = setInterval(checkAppointmentStatus, 2000)
    
    return () => clearInterval(interval)
  }, [storedUser?.id, storedUser?.role])

  const selectedDoctor = useMemo(
    () => availableDoctors.find(d => String(d.id) === String(selectedDoctorId)),
    [selectedDoctorId]
  )

  async function handleBook(e) {
    e.preventDefault()
    if (!selectedDoctorId || !date || !time) {
      return alert('Please select doctor, date and time')
    }
    
    if (!storedUser || !storedUser.id) {
      return alert('Please login to book an appointment')
    }

    // Validate date - prevent past dates
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to compare dates only
    selectedDate.setHours(0, 0, 0, 0)
    
    if (selectedDate < today) {
      return alert('Cannot book appointments for past dates. Please select today or a future date.')
    }

    try {
      const doc = availableDoctors.find(d => String(d.id) === String(selectedDoctorId))
      if (!doc) {
        alert('Doctor not found')
        return
      }

      const appointmentData = {
        patientId: storedUser.id,
        patientName: storedUser.fullName || storedUser.name || storedUser.email,
        patientEmail: storedUser.email,
        doctorId: parseInt(selectedDoctorId),
        doctorName: doc.name,
        date: date,
        time: time,
        issue: note || 'General consultation',
        status: 'Pending'
      }

      const newAppointment = await createAppointment(appointmentData)
      
      if (newAppointment) {
        // Reset form first
        setDate('')
        setTime('')
        setNote('')
        setSelectedDoctorId('')
        
        // Refresh appointments list from backend
        await fetchAll()
        
          // Refresh pending appointments and show notification
        const appts = await getAllAppointments()
        if (Array.isArray(appts)) {
          const patientAppts = appts.filter(a => String(a.patientId) === String(storedUser.id))
          const pendingAppts = patientAppts.filter(a => {
            const status = (a.status || 'pending').toLowerCase()
            return status === 'pending' || !a.status
          })
          
          if (pendingAppts.length > 0) {
            const formattedPending = pendingAppts.map(apt => ({
              id: apt.id,
              doctorName: apt.doctorName || `Doctor #${apt.doctorId}`,
              date: apt.date,
              time: apt.time
            }))
            setAppointmentNotification({
              show: true,
              pendingAppointments: formattedPending
            })
          }
        }
      } else {
        alert('Failed to book appointment. Please try again.')
      }
    } catch (error) {
      console.error('Appointment booking error:', error)
      alert(error.message || 'Failed to book appointment. Please try again.')
    }
  }

  function quickBook(doctor) {
    setSelectedDoctorId(String(doctor.id))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const displayedDoctors = useMemo(() => {
    let list = availableDoctors
    if (category !== 'All') list = list.filter(d => d.department === category)
    if (availabilityOnly) list = list.filter(d => d.available)
    return list
  }, [availableDoctors, category, availabilityOnly])

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

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-emerald-100/50 bg-white/80 backdrop-blur-2xl p-8 shadow-2xl"
          >
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight mb-2 flex items-center gap-3">
                <FontAwesomeIcon icon={faCalendarCheck} className="text-emerald-600" />
                Appointments
              </h1>
              <p className="mt-2 text-lg text-gray-700">Find a doctor and schedule by date and time.</p>
            </div>
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
          </motion.section>

          {/* Booking Form & Doctors Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Booking Form */}
            <motion.div
              whileHover={{ scale: 1.02, y: -3 }}
              className="lg:col-span-1 rounded-2xl border-2 border-emerald-200/50 bg-gradient-to-br from-white via-emerald-50/30 to-white backdrop-blur-xl p-8 shadow-xl hover:shadow-2xl transition-all sticky top-6 h-fit"
            >
              <div className="mb-6 pb-4 border-b border-emerald-200">
                <h2 className="text-2xl font-bold text-emerald-700 mb-2 flex items-center gap-3">
                  <div className="rounded-full bg-emerald-100 p-2">
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-emerald-600 text-lg" />
                  </div>
                  Book an Appointment
                </h2>
                <p className="text-sm text-gray-600 ml-12">Schedule your consultation with a doctor</p>
              </div>
              <form onSubmit={handleBook} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserDoctor} className="text-emerald-500 text-xs" />
                    Select Doctor
                  </label>
                  <select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full rounded-xl border-2 border-emerald-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-300"
                    required
                  >
                    <option value="">Choose a doctor...</option>
                    {availableDoctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} — {d.department}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendarDays} className="text-emerald-500 text-xs" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl border-2 border-emerald-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-emerald-700 mb-2 flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} className="text-emerald-500 text-xs" />
                      Time
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full rounded-xl border-2 border-emerald-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all hover:border-emerald-300"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-emerald-700 mb-2">Note (optional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows="3"
                    className="w-full rounded-xl border-2 border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none hover:border-emerald-300"
                    placeholder="Reason for visit or special requests..."
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3.5 font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faCalendarCheck} />
                  Schedule Appointment
                </button>
                {selectedDoctor && (
                  <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 border-2 border-emerald-200 p-4 mt-4">
                    <p className="text-xs font-bold text-emerald-700 mb-1">Selected Doctor:</p>
                    <p className="text-sm font-bold text-emerald-800">{selectedDoctor.name}</p>
                    <p className="text-xs text-emerald-600">{selectedDoctor.department}</p>
                  </div>
                )}
              </form>
            </motion.div>

            {/* Available Doctors */}
            <div className="lg:col-span-2 rounded-2xl border-2 border-emerald-200/50 bg-gradient-to-br from-white via-emerald-50/20 to-white backdrop-blur-xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-emerald-700 flex items-center gap-2">
                  <FontAwesomeIcon icon={faUserDoctor} className="text-emerald-600" />
                  Available Doctors
                </h2>
                <span className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {displayedDoctors.length} shown
                </span>
              </div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3">
                  {categories.map(c => (
                    <FilterPill key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={availabilityOnly} 
                    onChange={(e) => setAvailabilityOnly(e.target.checked)}
                    className="rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500"
                  />
                  Show available only
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {!loading && !error && displayedDoctors.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <DoctorCard doctor={doc} onBook={quickBook} />
                  </motion.div>
                ))}
              </div>
              {loading && (
                <div className="rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/80 backdrop-blur-sm p-8 text-center text-emerald-700 font-medium">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
                  <p>Loading doctors…</p>
                </div>
              )}
              {error && (
                <div className="rounded-2xl border-2 border-dashed border-red-300 bg-red-50/80 backdrop-blur-sm p-6 text-center text-red-700 font-medium">
                  {error}
                </div>
              )}
            </div>
          </motion.section>

          {/* Appointments History */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Upcoming Appointments */}
            <motion.div
              whileHover={{ scale: 1.02, y: -3 }}
              className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <h2 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-emerald-600" />
                Pending Appointments
              </h2>
              <div className="divide-y divide-emerald-100">
                {upcoming.length === 0 && (
                  <div className="py-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-3">
                      <FontAwesomeIcon icon={faCalendarDays} className="text-emerald-600 text-2xl" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">No pending appointments.</p>
                  </div>
                )}
                {upcoming.map(a => (
                  <motion.div
                    key={a.id}
                    whileHover={{ x: 5 }}
                    className="py-4 flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                        <span>{a.type} with {a.doctor}</span>
                        {((a.status || 'pending').toLowerCase() === 'pending' || !a.status) && (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                            Pending
                          </span>
                        )}
                        {(a.status || '').toLowerCase() === 'completed' && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarDays} className="text-emerald-500" />
                        {a.date} at {a.time}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Previous Appointments */}
            <motion.div
              whileHover={{ scale: 1.02, y: -3 }}
              className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <h2 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faClockRotateLeft} className="text-emerald-600" />
                Completed Appointments
              </h2>
              <div className="divide-y divide-emerald-100">
                {previous.length === 0 && (
                  <div className="py-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-3">
                      <FontAwesomeIcon icon={faCalendarDays} className="text-emerald-600 text-2xl" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">No completed appointments.</p>
                  </div>
                )}
                {previous.map(p => (
                  <motion.div
                    key={p.id}
                    whileHover={{ x: 5 }}
                    className="py-4 group"
                  >
                    <div className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                      <span>{p.type} with {p.doctor}</span>
                      {((p.status || 'pending').toLowerCase() === 'pending' || !p.status) && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800">
                          Pending
                        </span>
                      )}
                      {(p.status || '').toLowerCase() === 'completed' && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendarDays} className="text-emerald-500" />
                      {p.date} at {p.time}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.section>

        </div>
      </div>

      {/* Appointment Notification Popup - Shows All Pending Appointments */}
      {appointmentNotification.show && appointmentNotification.pendingAppointments.length > 0 && !appointmentNotificationMinimized && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full sm:max-w-md"
        >
          <div className="relative rounded-3xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 shadow-2xl overflow-hidden backdrop-blur-lg max-h-[85vh] flex flex-col">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-cyan-400"></div>
            
            {/* Close button */}
            <button
              onClick={() => setAppointmentNotification({ show: false, pendingAppointments: [] })}
              className="absolute top-4 right-4 rounded-full bg-white/80 hover:bg-red-100 text-gray-600 hover:text-red-600 w-7 h-7 flex items-center justify-center transition-all shadow-sm hover:shadow-md z-10"
            >
              <FontAwesomeIcon icon={faXmark} className="text-xs" />
            </button>

            {/* Hide button */}
            <button
              onClick={() => setAppointmentNotificationMinimized(true)}
              className="absolute top-4 left-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white w-7 h-7 flex items-center justify-center transition-all shadow-sm hover:shadow-md z-10"
              title="Hide notification"
            >
              −
            </button>

            <div className="p-6 pt-8 flex-1 flex flex-col">
              {/* Header with icon */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 p-4 shadow-lg">
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-white text-2xl" />
                  </div>
                  <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white animate-pulse flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{appointmentNotification.pendingAppointments.length}</span>
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-extrabold text-emerald-800 mb-1">
                    Pending Appointments
                  </h3>
                  <p className="text-xs text-gray-600">
                    {appointmentNotification.pendingAppointments.length} {appointmentNotification.pendingAppointments.length === 1 ? 'appointment' : 'appointments'} waiting
                  </p>
                </div>
              </div>

              {/* Scrollable list of pending appointments */}
              <div className="flex-1 overflow-y-auto pr-2 mb-4 space-y-3 max-h-[50vh]">
                {appointmentNotification.pendingAppointments.map((apt, index) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-emerald-200/50 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-emerald-100 p-2 flex-shrink-0">
                        <FontAwesomeIcon icon={faCalendarCheck} className="text-emerald-600 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-bold text-gray-800 truncate">{apt.doctorName}</p>
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-800 flex-shrink-0">
                            Pending
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <FontAwesomeIcon icon={faCalendarDays} className="text-emerald-500 text-xs" />
                            <span className="font-medium">{apt.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <FontAwesomeIcon icon={faClock} className="text-emerald-500 text-xs" />
                            <span className="font-medium">{apt.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Status indicator */}
              <div className="flex items-center justify-between bg-emerald-100/50 rounded-xl p-3 border border-emerald-200 mt-auto">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-emerald-700">
                    {appointmentNotification.pendingAppointments.length} Pending
                  </span>
                </div>
                <span className="text-xs text-emerald-600 font-medium">Auto-updates</span>
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                Notifications disappear when appointments are completed
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating minimized appointment icon (bottom-left) */}
      {appointmentNotification.show && appointmentNotification.pendingAppointments.length > 0 && appointmentNotificationMinimized && (
        <button
          onClick={() => setAppointmentNotificationMinimized(false)}
          className="fixed bottom-6 left-6 z-50 h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center"
          title={`${appointmentNotification.pendingAppointments.length} pending appointment(s)`}
        >
          <FontAwesomeIcon icon={faCalendarCheck} />
        </button>
      )}
    </Layout>
  )
}

export default Appointments


