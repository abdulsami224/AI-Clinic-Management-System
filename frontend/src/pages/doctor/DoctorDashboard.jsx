import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { useAuth } from '../../context/AuthContext'
import axios from '../../api/axios'
import { useNavigate } from 'react-router-dom'
import React from 'react'


export default function DoctorDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/analytics/doctor'),
      axios.get('/appointments/doctor')
    ]).then(([statsRes, apptRes]) => {
      setStats(statsRes.data)
      setAppointments(apptRes.data.slice(0, 5))
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    cancelled: 'bg-red-500/20 text-red-400',
  }

  return (
    <Layout title={`Welcome, Dr. ${user?.name}`} subtitle="Your clinic overview for today">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard title="Today's Appointments" value={stats?.todayAppointments ?? 0} icon="📅" color="cyan" subtitle="Scheduled for today" />
            <StatCard title="Total Appointments" value={stats?.totalAppointments ?? 0} icon="📋" color="blue" subtitle="All time" />
            <StatCard title="Completed" value={stats?.completedAppointments ?? 0} icon="✅" color="emerald" subtitle="Finished" />
            <StatCard title="Prescriptions" value={stats?.totalPrescriptions ?? 0} icon="💊" color="violet" subtitle="Written" />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'View Appointments', icon: '📅', desc: 'See your schedule', path: '/doctor/appointments', color: 'from-cyan-600 to-blue-600' },
              { label: 'AI Symptom Checker', icon: '🤖', desc: 'Diagnose with AI', path: '/doctor/ai-checker', color: 'from-violet-600 to-indigo-600' },
              { label: 'View Patients', icon: '🫀', desc: 'Patient records', path: '/doctor/patients', color: 'from-rose-600 to-pink-600' },
            ].map(action => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-5 text-left hover:border-gray-600 transition group"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-xl mb-3 shadow-lg`}>
                  {action.icon}
                </div>
                <p className="text-white font-semibold text-sm">{action.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{action.desc}</p>
              </button>
            ))}
          </div>

          {/* Recent Appointments */}
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold">Recent Appointments</h3>
              <button onClick={() => navigate('/doctor/appointments')} className="text-cyan-400 text-sm hover:underline">View all</button>
            </div>
            {appointments.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                <p className="text-3xl mb-2">📅</p>
                <p className="text-sm">No appointments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map(appt => (
                  <div key={appt._id} className="flex items-center justify-between bg-gray-800/40 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {appt.patientId?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{appt.patientId?.name || 'Patient'}</p>
                        <p className="text-gray-500 text-xs">{new Date(appt.date).toLocaleDateString()} • {appt.timeSlot}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </Layout>
  )
}