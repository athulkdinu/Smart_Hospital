import React, { useMemo, useState, useEffect } from 'react'
import Layout from '../components/Layout'
import DoctorCard from '../components/DoctorCard'
import FilterPill from '../components/FilterPill'
import { getAllDoctors } from '../services/doctorApi'
import { getAllAppointments } from '../services/appointmentApi'

function Appointments() {
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  }, [])

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

  useEffect(() => {
    let cancelled = false
    const fetchAll = async () => {
      try {
        setLoading(true)
        setError('')
        const [docs, appts] = await Promise.all([
          getAllDoctors(),
          getAllAppointments()
        ])
        if (!cancelled) {
          if (Array.isArray(docs) && docs.length > 0) {
            const mappedDocs = docs.map(d => ({
              id: d.id,
              name: d.name,
              department: d.specialization || 'General Medicine',
              available: true
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
              type: 'Consultation'
            }))
            const upcomingList = normalized.filter(a => {
              const apptDate = new Date(a.date)
              return !isNaN(apptDate.getTime()) && apptDate >= now
            })
            const previousList = normalized.filter(a => {
              const apptDate = new Date(a.date)
              return !isNaN(apptDate.getTime()) && apptDate < now
            })
            setUpcoming(upcomingList)
            setPrevious(previousList)
          } else if (appts === null) {
            setError('Failed to load appointments. Please check if the backend server is running on http://localhost:3000')
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error('Fetch error:', e)
          setError('Failed to load data. Please check if the backend server is running.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
    const onFocus = () => fetchAll()
    window.addEventListener('focus', onFocus)
    return () => { cancelled = true; window.removeEventListener('focus', onFocus) }
  }, [storedUser])

  const selectedDoctor = useMemo(
    () => availableDoctors.find(d => String(d.id) === String(selectedDoctorId)),
    [selectedDoctorId]
  )

  function handleBook(e) {
    e.preventDefault()
    if (!selectedDoctorId || !date || !time) return alert('Please select doctor, date and time')
    const doc = availableDoctors.find(d => String(d.id) === String(selectedDoctorId))
    const newItem = { id: `u${Date.now()}`, date, time, doctor: doc.name, type: 'Consultation' }
    setUpcoming(prev => [newItem, ...prev])
    setDate('')
    setTime('')
    setNote('')
    alert(`Appointment scheduled with ${doc.name} on ${date} at ${time}`)
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
    <Layout>
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-[var(--brand-grad-from)] to-[var(--brand-grad-to)] p-6">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
            <p className="mt-1 text-slate-600">Find a doctor and schedule by date and time.</p>
          </div>
          <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-blue-200/40 blur-3xl" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 rounded-xl bg-white p-5 border border-[var(--brand-border)] shadow-sm">
            <h2 className="text-lg font-semibold">Book an Appointment</h2>
            <form onSubmit={handleBook} className="mt-4 space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Doctor</label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring"
                  required
                >
                  <option value="">Select doctor</option>
                  {availableDoctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} — {d.department}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows="3"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring"
                  placeholder="Reason for visit"
                />
              </div>
              <button type="submit" className="w-full rounded-md bg-[var(--brand-solid)] text-white px-4 py-2 text-sm hover:bg-[var(--brand-solid-hover)]">Schedule</button>
              {selectedDoctor && (
                <p className="text-xs text-slate-500">Selected: {selectedDoctor.name} ({selectedDoctor.department})</p>
              )}
            </form>
          </div>

          <div className="lg:col-span-2 rounded-xl bg-white p-5 border border-[var(--brand-border)] shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--brand-solid)]">Available Doctors</h2>
              <span className="text-sm text-slate-500">{displayedDoctors.length} shown</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <FilterPill key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={availabilityOnly} onChange={(e) => setAvailabilityOnly(e.target.checked)} />
                Show available only
              </label>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {!loading && !error && displayedDoctors.map(doc => (
                <DoctorCard key={doc.id} doctor={doc} onBook={quickBook} />
              ))}
            </div>
            {loading && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">Loading…</div>
            )}
            {error && (
              <div className="rounded-xl border border-dashed border-red-300 bg-red-50 p-6 text-center text-red-700">{error}</div>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Upcoming Appointments</h2>
            <div className="divide-y">
              {upcoming.length === 0 && (
                <p className="text-sm text-slate-500 py-3">No upcoming appointments scheduled.</p>
              )}
              {upcoming.map(a => (
                <div key={a.id} className="py-3 flex items-center justify-between">
                  <div className="text-slate-700">
                    <div className="font-medium">{a.type} with {a.doctor}</div>
                    <div className="text-sm text-slate-500">{a.date} at {a.time}</div>
                  </div>
                  <button className="text-sm rounded-md px-3 py-1 border border-slate-300 hover:bg-slate-50">Reschedule</button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Previous Appointments</h2>
            <div className="divide-y">
              {previous.map(p => (
                <div key={p.id} className="py-3">
                  <div className="text-slate-700 font-medium">{p.type} with {p.doctor}</div>
                  <div className="text-sm text-slate-500">{p.date}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default Appointments


