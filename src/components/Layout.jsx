import React from 'react'
import Header from './Header'
import Footer from './Footer'

function Layout({ children, patientName = 'Athul' }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[var(--brand-grad-from)] to-[var(--brand-grad-to)]">
      <Header patientName={patientName} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}

export default Layout


