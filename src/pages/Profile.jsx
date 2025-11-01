import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import { getPatientById } from '../services/patientApi'
import { getAllAppointments } from '../services/appointmentApi'
import { getAllDoctors } from '../services/doctorApi'

function Profile() {
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  }, [])

  const [user, setUser] = useState(storedUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [appointments, setAppointments] = useState([])
  const [apptLoading, setApptLoading] = useState(false)
  const [apptError, setApptError] = useState('')

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
            setUser(prev => ({ ...prev, ...data }))
          }
        } catch (e) {
          if (!cancelled) setError('Failed to load profile details')
        } finally {
          if (!cancelled) setLoading(false)
        }
      }
    }
    enrichFromApi()
    return () => { cancelled = true }
  }, [storedUser])

  // Load recent appointments for this patient
  useEffect(() => {
    let cancelled = false
    const loadAppointments = async () => {
      if (!storedUser?.id) return
      try {
        setApptLoading(true)
        setApptError('')
        const [appts, docs] = await Promise.all([
          getAllAppointments(),
          getAllDoctors()
        ])
        if (!cancelled && Array.isArray(appts)) {
          const doctorMap = new Map((docs || []).map(d => [String(d.id), d.name]))
          const myAppts = appts
            .filter(a => String(a.patientId) === String(storedUser.id))
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(a => ({
              id: a.id,
              date: a.date,
              time: a.time,
              doctor: doctorMap.get(String(a.doctorId)) || `Doctor #${a.doctorId}`
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
  }, [storedUser])

  return (
    <Layout>
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-[var(--brand-grad-from)] to-[var(--brand-grad-to)] p-6 shadow-sm">
          <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Profile</h1>
              <p className="mt-1 text-slate-700">Manage your personal details and preferences.</p>
            </div>
            {user && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs text-slate-700 border border-slate-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {user.role ? String(user.role).toUpperCase() : 'USER'}
              </span>
            )}
          </div>
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
            <div className="h-20 w-20 rounded-full bg-[var(--brand-solid)]/10 border border-[var(--brand-border)] flex items-center justify-center text-[var(--brand-solid)] font-semibold text-xl">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="mt-4">
              <div className="text-slate-900 font-semibold">{user?.name || 'Unknown User'}</div>
              <div className="text-sm text-slate-500">{user?.email || 'No email set'}</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-slate-500">Role</div>
                <div className="font-medium text-slate-800">{user?.role || '—'}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3">
                <div className="text-slate-500">User ID</div>
                <div className="font-medium text-slate-800">{user?.id ?? '—'}</div>
              </div>
            </div>
            <button className="mt-4 w-full rounded-md bg-[var(--brand-solid)] text-white px-4 py-2 text-sm hover:bg-[var(--brand-solid-hover)]">Edit Profile</button>
          </div>

          <div className="md:col-span-2 rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">Personal Information</h2>
            {loading && (
              <div className="mt-4 space-y-2 animate-pulse">
                <div className="h-4 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-56 bg-slate-200 rounded" />
                <div className="h-4 w-44 bg-slate-200 rounded" />
              </div>
            )}
            {error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            {!loading && !error && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-slate-500">Full Name</div>
                  <div className="font-medium text-slate-800">{user?.name || '—'}</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-slate-500">Email</div>
                  <div className="font-medium text-slate-800">{user?.email || '—'}</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-slate-500">Gender</div>
                  <div className="font-medium text-slate-800">{user?.gender || '—'}</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <div className="text-slate-500">Age</div>
                  <div className="font-medium text-slate-800">{user?.age ?? '—'}</div>
                </div>
                <div className="rounded-lg border border-slate-200 p-4 sm:col-span-2">
                  <div className="text-slate-500">Primary Doctor</div>
                  <div className="font-medium text-slate-800">{user?.doctor || '—'}</div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Contact & Preferences</h2>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-slate-500">Phone</div>
              <div className="font-medium text-slate-800">{user?.phone || '—'}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="text-slate-500">Preferred Contact</div>
              <div className="font-medium text-slate-800">{user?.preferredContact || 'Email'}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4 sm:col-span-2">
              <div className="text-slate-500">Address</div>
              <div className="font-medium text-slate-800">{user?.address || '—'}</div>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Recent Appointments</h2>
            {appointments.length > 0 && (
              <span className="text-xs text-slate-500">Showing {appointments.length} most recent</span>
            )}
          </div>
          {apptLoading && (
            <div className="mt-4 space-y-2 animate-pulse">
              <div className="h-4 w-64 bg-slate-200 rounded" />
              <div className="h-4 w-56 bg-slate-200 rounded" />
              <div className="h-4 w-48 bg-slate-200 rounded" />
            </div>
          )}
          {apptError && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{apptError}</div>
          )}
          {!apptLoading && !apptError && (
            <div className="mt-3 divide-y">
              {appointments.length === 0 && (
                <div className="text-sm text-slate-500 py-3">No recent appointments.</div>
              )}
              {appointments.map(a => (
                <div key={a.id} className="py-3 flex items-center justify-between">
                  <div className="text-slate-700">
                    <div className="font-medium">{a.date} at {a.time}</div>
                    <div className="text-sm text-slate-500">with {a.doctor}</div>
                  </div>
                  <button className="text-sm rounded-md px-3 py-1 border border-slate-300 hover:bg-slate-50">View</button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  )
}

export default Profile