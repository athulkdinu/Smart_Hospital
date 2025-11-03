import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons'

function Footer() {
  return (
    <footer className="w-full relative mt-8">
      {/* Top glow divider */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-emerald-300/40 to-transparent" />
      {/* Gradient background */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-xl bg-white/90 flex items-center justify-center shadow-inner">
                  <span className="text-emerald-700 font-extrabold">M</span>
                </div>
                <div className="text-xl font-extrabold tracking-tight">MediConnect</div>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                Manage your care, appointments, and records seamlessly with a modern, patient‑first experience.
              </p>
            </div>

            {/* Links */}
            <div>
              <div className="text-sm font-bold uppercase tracking-wide text-white/90 mb-3">Links</div>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-white">Dashboard</a></li>
                <li><a href="#" className="hover:text-white">Appointments</a></li>
                <li><a href="#" className="hover:text-white">Profile</a></li>
              </ul>
            </div>

            {/* Policies */}
            <div>
              <div className="text-sm font-bold uppercase tracking-wide text-white/90 mb-3">Policies</div>
              <ul className="space-y-2 text-sm text-white/80">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <div className="text-sm font-bold uppercase tracking-wide text-white/90 mb-3">Follow</div>
              <div className="flex items-center gap-3">
                <a href="#" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/20">
                  <FontAwesomeIcon icon={faFacebookF} className="text-white" />
                </a>
                <a href="#" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/20">
                  <FontAwesomeIcon icon={faTwitter} className="text-white" />
                </a>
                <a href="#" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/20">
                  <FontAwesomeIcon icon={faInstagram} className="text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/80">
            <span>© {new Date().getFullYear()} MediConnect. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white">Status</a>
              <a href="#" className="hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
