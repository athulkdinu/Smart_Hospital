import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import SymptomButton from '../components/SymptomButton'
import DoctorCard from '../components/DoctorCard'
import ChatBotPlaceholder from '../components/ChatBotPlaceholder'
import { Link, useNavigate } from 'react-router-dom'
import StatCard from '../components/StatCard'
import FilterPill from '../components/FilterPill'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClockRotateLeft, faUserDoctor, faBullhorn, faHeartPulse, faBandAid, faMagnifyingGlass, faArrowDownAZ } from '@fortawesome/free-solid-svg-icons'
import { getAllDoctors } from '../services/doctorApi'

function Dashboard() {
  const navigate = useNavigate()
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null')
  const patientName = storedUser?.role === 'patient' ? storedUser.name : 'Athul'
  const symptoms = ['Fever', 'Cough', 'Headache', 'Cold', 'Stomachache']
  const categories = ['All', 'General Medicine', 'Pediatrics', 'Neurology', 'Gastroenterology']
  const [activeSymptom, setActiveSymptom] = useState('')
  const [category, setCategory] = useState('All')
  const [availabilityOnly, setAvailabilityOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('Relevance') // Relevance | Availability | Name

  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getAllDoctors()
        if (!cancelled) {
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map(d => ({
              id: d.id,
              name: d.name,
              department: d.specialization || 'General Medicine',
              available: true,
              tags: []
            }))
            setDoctors(mapped)
          } else if (data === null || (Array.isArray(data) && data.length === 0)) {
            setError('No doctors available. Please check if the backend server is running on http://localhost:3000')
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error('Fetch doctors error:', e)
          setError('Failed to load doctors. Please check if the backend server is running.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchDoctors()
    const onFocus = () => fetchDoctors()
    window.addEventListener('focus', onFocus)
    return () => { cancelled = true; window.removeEventListener('focus', onFocus) }
  }, [])

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

  function handleBook(doctor) {
    alert(`Booked consultation with ${doctor.name}`)
  }

  useEffect(() => {
    if (!storedUser || storedUser.role !== 'patient') {
      navigate('/login')
    }
  }, [storedUser, navigate])

  return (
    <Layout patientName={patientName}>
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-[var(--brand-grad-from)] to-[var(--brand-grad-to)] p-6 shadow-sm">
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {patientName}</h2>
                <p className="mt-1 text-slate-700">Manage your care, appointments, and records in one place.</p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/appointments" className="inline-flex items-center rounded-md bg-[var(--brand-solid)] px-4 py-2 text-white text-sm shadow hover:shadow-md transition hover:bg-[var(--brand-solid-hover)]">View Appointments</Link>
                <Link to="/profile" className="inline-flex items-center rounded-md bg-white px-4 py-2 text-slate-700 text-sm border border-slate-200 hover:bg-slate-50">View Profile</Link>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-teal-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Upcoming" value="1 Appointment" accent="blue" />
          <StatCard label="Prescriptions" value="3 Active" accent="emerald" />
          <StatCard label="Lab Reports" value="2 New" accent="amber" />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl bg-white p-5 shadow-sm hover:shadow-md transition-shadow border border-[var(--brand-border)] border-l-4 border-l-[var(--brand-solid)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FontAwesomeIcon icon={faClockRotateLeft} className="text-slate-500" />
                Your History
              </h2>
              <Link to="/patient_history" className="rounded-md bg-[var(--brand-solid)] px-3 py-2 text-sm text-white hover:bg-[var(--brand-solid-hover)]">View</Link>
            </div>
            <p className="text-sm text-slate-500 mt-2">Past appointments, prescriptions and lab reports.</p>
          </div>

          <div className="md:col-span-2">
            <ChatBotPlaceholder />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <FontAwesomeIcon icon={faBandAid} className="text-slate-500" />
            Symptoms
          </h3>
          <div className="flex flex-wrap gap-2">
            <SymptomButton label="All" isActive={!activeSymptom} onClick={() => setActiveSymptom('')} />
            {symptoms.map(s => (
              <SymptomButton key={s} label={s} isActive={activeSymptom === s} onClick={() => setActiveSymptom(s)} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">Filter by Department</h3>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={availabilityOnly} onChange={(e) => setAvailabilityOnly(e.target.checked)} />
              Show available only
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <FilterPill key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => { setActiveSymptom(''); setCategory('All'); setAvailabilityOnly(false); setSearch(''); setSortBy('Relevance') }}
            >
              Reset filters
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <FontAwesomeIcon icon={faUserDoctor} className="text-slate-500" />
              Available Doctors
            </h3>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by doctor or department"
                  className="w-full sm:w-64 rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-solid)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faArrowDownAZ} className="text-slate-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--brand-solid)]"
                >
                  <option>Relevance</option>
                  <option>Availability</option>
                  <option>Name</option>
                </select>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 sm:ml-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {filteredDoctors.length} results
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {!loading && !error && filteredDoctors.map(doc => (
              <div key={doc.id} className="transform-gpu transition duration-200 hover:-translate-y-0.5 hover:shadow">
                <DoctorCard doctor={doc} onBook={handleBook} />
              </div>
            ))}
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
                <div className="h-1 w-full rounded bg-slate-200 mb-3" />
                <div className="h-5 w-2/3 bg-slate-200 rounded" />
                <div className="h-4 w-1/3 bg-slate-200 rounded mt-2" />
                <div className="h-9 w-28 bg-slate-200 rounded mt-4" />
              </div>
            ))}
          </div>
          {error && (
            <div className="rounded-xl border border-dashed border-red-300 bg-red-50 p-6 text-center text-red-700">{error}</div>
          )}
          {!loading && !error && filteredDoctors.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">
              <div className="mx-auto mb-2 h-8 w-8 rounded-full bg-slate-200" />
              No doctors match your filters. Try adjusting search or filters.
            </div>
          )}

          <div className="pt-2">
            <Link to="/appointments" className="inline-block rounded-md bg-emerald-600 px-4 py-2 text-white text-sm hover:bg-emerald-700">
              Show Appointments & Prescriptions
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4">
          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800">Helpful Links</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc list-inside">
              <li>Nutrition & Diet Plans</li>
              <li>Mental Health Support</li>
              <li>Fitness & Lifestyle Tips</li>
            </ul>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <FontAwesomeIcon icon={faBullhorn} className="text-slate-500" />
              Announcements
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc list-inside">
              <li>Free health check-up camp scheduled for next week..</li>
              <li>Cardiology department now open on weekends with extended hours.</li>
              <li>Blood donation drive organized on campus this Friday.</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <FontAwesomeIcon icon={faHeartPulse} className="text-slate-500" />
              Health Tips
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc list-inside">
              <li>Stay hydrated and aim for 7–8 hours of quality sleep daily.</li>
              <li>Take at least 30 minutes of walking or light exercise every day for heart health.</li>
              <li>Include more fruits, vegetables, and whole grains in your diet.</li> 
            </ul>
          </div>
        </section>
      </main>
    </Layout>
  )
}

export default Dashboard