import React from 'react'

function FilterPill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm border transition-colors ${active ? 'bg-[var(--brand-solid)] text-white border-[var(--brand-solid)]' : 'bg-white text-slate-700 border-slate-200 hover:bg-[var(--brand-tint)]'}`}
    >
      {label}
    </button>
  )
}

export default FilterPill


