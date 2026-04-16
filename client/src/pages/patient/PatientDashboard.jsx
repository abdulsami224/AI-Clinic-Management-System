import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { useAuth } from '../../context/AuthContext'
import axios from '../../api/axios'
import { useNavigate } from 'react-router-dom'
import React from 'react'


const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400',
  confirmed: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  cancelled: 'bg-red-500/20 text-red-400',
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({ appointments: [], prescriptions: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Patients view their own data — assuming patientId matches user._id for simplicity
    // In a full app you'd link the Patient document to the User account
    setLoading(false)
  }, [])

  return (
    <Layout title={`Hello, ${user?.name}`} subtitle="Your health dashboard">
      <div className="space-y-8">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard title="Appointments" value={data.appointments.length} icon="📅" color="rose" subtitle="Scheduled" />
          <StatCard title="Prescriptions" value={data.prescriptions.length} icon="💊" color="violet" subtitle="Issued" />
          <StatCard title="My Plan" value={user?.subscriptionPlan === 'pro' ? 'Pro ⭐' : 'Free'} icon="🏥" color="amber" subtitle="Subscription" />
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'My Appointments', icon: '📅', desc: 'View all your appointments', path: '/patient/appointments', color: 'from-rose-600 to-pink-600' },
            { label: 'My Prescriptions', icon: '💊', desc: 'View & download prescriptions', path: '/patient/prescriptions', color: 'from-violet-600 to-indigo-600' },
            { label: 'Medical History', icon: '📋', desc: 'Full health timeline', path: '/patient/history', color: 'from-cyan-600 to-blue-600' },
          ].map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-5 text-left hover:border-gray-600 transition"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-xl mb-3 shadow-lg`}>
                {action.icon}
              </div>
              <p className="text-white font-semibold text-sm">{action.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{action.desc}</p>
            </button>
          ))}
        </div>

        {/* Profile Card */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">My Profile</h3>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white font-bold text-2xl">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-white font-bold text-lg">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.subscriptionPlan === 'pro' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-700 text-gray-400'}`}>
                {user?.subscriptionPlan === 'pro' ? '⭐ Pro Plan' : 'Free Plan'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Role', value: 'Patient' },
              { label: 'Member Since', value: new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
            ].map(item => (
              <div key={item.label} className="bg-gray-800/40 rounded-xl px-4 py-3">
                <p className="text-gray-500 text-xs">{item.label}</p>
                <p className="text-white text-sm font-medium mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  )
}