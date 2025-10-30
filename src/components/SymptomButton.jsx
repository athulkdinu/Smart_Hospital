import React from 'react'

function SymptomButton({ label, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm border transition-colors ${isActive ? 'bg-[var(--brand-solid)] text-white border-[var(--brand-solid)]' : 'bg-white text-slate-700 border-slate-200 hover:bg-[var(--brand-tint)]'}`}
    >
      {label}
    </button>
  )
}

export default SymptomButton


