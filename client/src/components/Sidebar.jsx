import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import React from 'react'

const roleNav = {
  admin: [
    { label: 'Dashboard', icon: '▦', path: '/admin/dashboard' },
    { label: 'Doctors', icon: '⚕', path: '/admin/doctors' },
    { label: 'Receptionists', icon: '👤', path: '/admin/receptionists' },
    { label: 'All Patients', icon: '🙍🏻‍♂️', path: '/admin/patients' },
    { label: 'Analytics', icon: '📊', path: '/admin/analytics' },
  ],
  doctor: [
    { label: 'Dashboard', icon: '▦', path: '/doctor/dashboard' },
    { label: 'Appointments', icon: '📅', path: '/doctor/appointments' },
    { label: 'AI Symptom Checker', icon: '🤖', path: '/doctor/ai-checker' },
    { label: 'Patients', icon: '🙍🏻‍♂️', path: '/doctor/patients' },
  ],
  receptionist: [
    { label: 'Dashboard', icon: '▦', path: '/receptionist/dashboard' },
    { label: 'Add Patient', icon: '➕', path: '/receptionist/add-patient' },
    { label: 'Book Appointment', icon: '📅', path: '/receptionist/book-appointment' },
    { label: 'All Patients', icon: '🙍🏻‍♂️', path: '/receptionist/patients' },
  ],
  patient: [
    { label: 'Dashboard', icon: '▦', path: '/patient/dashboard' },
    { label: 'My Appointments', icon: '📅', path: '/patient/appointments' },
    { label: 'Prescriptions', icon: '💊', path: '/patient/prescriptions' },
    { label: 'Medical History', icon: '📋', path: '/patient/history' },
  ],
}

const roleColors = {
  admin: 'from-violet-600 to-indigo-600',
  doctor: 'from-cyan-500 to-blue-600',
  receptionist: 'from-emerald-500 to-teal-600',
  patient: 'from-rose-500 to-pink-600',
}

const roleBadgeColors = {
  admin: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  doctor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  receptionist: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  patient: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return null

  const navItems = roleNav[user.role] || []
  const gradientClass = roleColors[user.role] || 'from-blue-600 to-indigo-600'
  const badgeClass = roleBadgeColors[user.role] || 'bg-blue-500/20 text-blue-300'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleNavClick = () => setMobileOpen(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0`}>
            ✚
          </div>
          <div>
            <p className="text-white font-bold text-sm tracking-wide">MediSaaS</p>
            <p className="text-gray-500 text-xs">Clinic Management</p>
          </div>
        </div>
        {/* Close btn mobile only */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-gray-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition"
        >
          ✕
        </button>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-gray-800/60">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${badgeClass} capitalize`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-3 px-3">
          Navigation
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? `bg-gradient-to-r ${gradientClass} text-white shadow-lg`
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800/60">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-gray-950 border-r border-gray-800/60 flex-col z-50">
        <SidebarContent />
      </aside>

      {/* ── MOBILE TOP NAVBAR ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-950 border-b border-gray-800/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold text-base shadow-lg`}>
            ✚
          </div>
          <p className="text-white font-bold text-sm">MediSaaS</p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white font-bold text-xs`}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-gray-800/60 hover:bg-gray-700 transition"
            aria-label="Open menu"
          >
            <span className="block h-0.5 bg-white rounded-full w-[18px]"></span>
            <span className="block h-0.5 bg-white rounded-full w-[13px]"></span>
            <span className="block h-0.5 bg-white rounded-full w-[18px]"></span>
          </button>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div
            className="relative w-72 max-w-[85vw] h-full bg-gray-950 border-r border-gray-800/60 z-10"
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}