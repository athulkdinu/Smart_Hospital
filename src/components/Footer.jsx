import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons'

function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white shadow-inner">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Left: Copyright */}
        <span className="text-sm text-white/90">
          © {new Date().getFullYear()} MediConnect. All rights reserved.
        </span>

        {/* Center: Links */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <a href="#" className="hover:text-teal-200 transition-colors duration-200">Terms</a>
          <a href="#" className="hover:text-teal-200 transition-colors duration-200">Privacy</a>
          <a href="#" className="hover:text-teal-200 transition-colors duration-200">Support</a>
        </div>

        {/* Right: Social Icons */}
        <div className="flex items-center gap-4">
          <a href="#" className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition">
            <FontAwesomeIcon icon={faFacebookF} className="text-white" />
          </a>
          <a href="#" className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition">
            <FontAwesomeIcon icon={faTwitter} className="text-white" />
          </a>
          <a href="#" className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition">
            <FontAwesomeIcon icon={faInstagram} className="text-white" />
          </a>
        </div>

      </div>
    </footer>
  )
}

export default Footer
