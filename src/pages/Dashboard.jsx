import React, { useMemo, useState } from 'react'
import Layout from '../components/Layout'
import SymptomButton from '../components/SymptomButton'
import DoctorCard from '../components/DoctorCard'
import ChatBotPlaceholder from '../components/ChatBotPlaceholder'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import FilterPill from '../components/FilterPill'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClockRotateLeft, faUserDoctor, faBullhorn, faHeartPulse, faBandAid } from '@fortawesome/free-solid-svg-icons'

function Dashboard() {
  const patient = { name: 'Athul' }
  const symptoms = ['Fever', 'Cough', 'Headache', 'Cold', 'Stomachache']
  const categories = ['All', 'General Medicine', 'Pediatrics', 'Neurology', 'Gastroenterology']
  const [activeSymptom, setActiveSymptom] = useState('')
  const [category, setCategory] = useState('All')
  const [availabilityOnly, setAvailabilityOnly] = useState(false)

  const doctors = [
    { id: 1, name: 'Dr. Aisha Khan', department: 'General Medicine', available: true, tags: ['Fever', 'Cough'] },
    { id: 2, name: 'Dr. Rohit Menon', department: 'Pediatrics', available: false, tags: ['Cold'] },
    { id: 3, name: 'Dr. Neha Verma', department: 'Neurology', available: true, tags: ['Headache'] },
    { id: 4, name: 'Dr. Arjun Iyer', department: 'Gastroenterology', available: true, tags: ['Stomachache'] }
  ]

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
    return list
  }, [activeSymptom, category, availabilityOnly])

  function handleBook(doctor) {
    alert(`Booked consultation with ${doctor.name}`)
  }

  return (
    <Layout patientName={patient.name}>
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-[var(--brand-grad-from)] to-[var(--brand-grad-to)] p-6">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-slate-800">Welcome back, {patient.name}</h2>
            <p className="mt-1 text-slate-600">Manage your care, appointments, and records in one place.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/appointments" className="rounded-md bg-[var(--brand-solid)] px-4 py-2 text-white text-sm hover:bg-[var(--brand-solid-hover)]">View Appointments</Link>
              <Link to="/profile" className="rounded-md bg-white px-4 py-2 text-slate-700 text-sm border border-slate-200 hover:bg-slate-50">View Profile</Link>
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
              <button className="rounded-md bg-[var(--brand-solid)] px-3 py-2 text-sm text-white hover:bg-[var(--brand-solid-hover)]">View</button>
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
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <FontAwesomeIcon icon={faUserDoctor} className="text-slate-500" />
              Available Doctors
            </h3>
            <span className="text-sm text-slate-500">{filteredDoctors.length} results</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map(doc => (
              <DoctorCard key={doc.id} doctor={doc} onBook={handleBook} />
            ))}
          </div>

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
              <li>COVID-19 Guidelines and Vaccination</li>
              <li>Diet and Nutrition Plans</li>
              <li>Mental Wellness Resources</li>
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
              <li>Seasonal flu vaccines available this month.</li>
              <li>Cardiology department extended hours on weekends.</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <FontAwesomeIcon icon={faHeartPulse} className="text-slate-500" />
              Health Tips
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc list-inside">
              <li>Stay hydrated and get 7-8 hours of sleep.</li>
              <li>30 minutes of daily walking improves cardiovascular health.</li>
            </ul>
          </div>
        </section>
      </main>
    </Layout>
  )
}

export default Dashboard


