import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStethoscope, faCalendarCheck } from '@fortawesome/free-solid-svg-icons'

function DoctorCard({ doctor, onBook }) {
  const statusColor = doctor.available ? 'text-green-600' : 'text-red-600'
  const statusText = doctor.available ? 'Available' : 'Unavailable'

  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="h-1 w-full rounded bg-[var(--brand-solid)] mb-3" />
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faStethoscope} className="text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-800">{doctor.name}</h3>
          </div>
          <p className="text-sm text-slate-500 mt-1">{doctor.department}</p>
        </div>
        <span className={`text-sm font-medium ${statusColor}`}>{statusText}</span>
      </div>
      <button
        onClick={() => onBook?.(doctor)}
        disabled={!doctor.available}
        className={`mt-4 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white transition-colors ${doctor.available ? 'bg-[var(--brand-solid)] hover:bg-[var(--brand-solid-hover)]' : 'bg-slate-400 cursor-not-allowed'}`}
      >
        <FontAwesomeIcon icon={faCalendarCheck} />
        Book Now
      </button>
    </div>
  )
}

export default DoctorCard


