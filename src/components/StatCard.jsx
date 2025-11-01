import React from 'react'

function StatCard({ label, value, accent = 'theme' }) {
  const accentMap = {
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    violet: 'bg-violet-100 text-violet-700',
    theme: 'bg-[var(--brand-tint)] text-[var(--brand-solid)]'
  }
  const badgeClass = accentMap[accent] || accentMap.theme

  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-white p-4 shadow-sm">
      <div className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${badgeClass}`}>{label}</div>
      <div className="mt-3 text-2xl font-bold text-slate-800">{value}</div>
    </div>
  )
}

export default StatCard


