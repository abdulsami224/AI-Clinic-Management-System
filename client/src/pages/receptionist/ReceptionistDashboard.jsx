import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import { useAuth } from '../../context/AuthContext'
import axios from '../../api/axios'
import { useNavigate } from 'react-router-dom'
import React from 'react'


export default function ReceptionistDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/patients')
      .then(res => setPatients(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const recent = patients.slice(0, 5)

  return (
    <Layout title={`Hello, ${user?.name}`} subtitle="Manage patients and appointments">
      <div className="space-y-8">

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard title="Total Patients" value={patients.length} icon="🫀" color="emerald" subtitle="Registered" />
          <StatCard title="Today's Date" value={new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} icon="📅" color="cyan" subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long' })} />
          <StatCard title="Quick Actions" value="2" icon="⚡" color="amber" subtitle="Available tasks" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Register New Patient', icon: '➕', desc: 'Add a new patient to the system', path: '/receptionist/add-patient', color: 'from-emerald-600 to-teal-600' },
            { label: 'Book Appointment', icon: '📅', desc: 'Schedule a patient appointment', path: '/receptionist/book-appointment', color: 'from-cyan-600 to-blue-600' },
          ].map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6 text-left hover:border-gray-600 transition group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                {action.icon}
              </div>
              <p className="text-white font-semibold">{action.label}</p>
              <p className="text-gray-500 text-sm mt-1">{action.desc}</p>
            </button>
          ))}
        </div>

        {/* Recent Patients */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Recent Patients</h3>
            <button onClick={() => navigate('/receptionist/patients')} className="text-emerald-400 text-sm hover:underline">View all</button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              <p className="text-3xl mb-2">🫀</p>
              <p className="text-sm">No patients yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map(p => (
                <div key={p._id} className="flex items-center justify-between bg-gray-800/40 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                      {p.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{p.name}</p>
                      <p className="text-gray-500 text-xs">{p.age} yrs • {p.gender} • {p.contact}</p>
                    </div>
                  </div>
                  <span className="text-gray-600 text-xs">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  )
}