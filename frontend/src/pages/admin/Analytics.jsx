import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import axios from '../../api/axios'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts'
import React from 'react'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-white text-sm font-semibold">{p.value} {p.name}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/analytics/admin'),
      axios.get('/patients'),
      axios.get('/users/doctors'),
    ]).then(([statsRes, patientsRes, doctorsRes]) => {
      setStats(statsRes.data)
      setPatients(patientsRes.data)
      setDoctors(doctorsRes.data)
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Gender breakdown from patients
  const genderData = [
    { name: 'Male', value: patients.filter(p => p.gender === 'male').length },
    { name: 'Female', value: patients.filter(p => p.gender === 'female').length },
    { name: 'Other', value: patients.filter(p => p.gender === 'other').length },
  ].filter(d => d.value > 0)

  // Blood group breakdown
  const bloodData = patients.reduce((acc, p) => {
    if (p.bloodGroup) {
      const existing = acc.find(a => a.name === p.bloodGroup)
      if (existing) existing.value++
      else acc.push({ name: p.bloodGroup, value: 1 })
    }
    return acc
  }, [])

  // Doctor plan breakdown
  const planData = [
    { name: 'Pro', value: doctors.filter(d => d.subscriptionPlan === 'pro').length },
    { name: 'Free', value: doctors.filter(d => d.subscriptionPlan === 'free').length },
  ].filter(d => d.value > 0)

  // Status breakdown
  const statusData = [
    { name: 'Pending', value: stats?.pendingAppointments || 0, color: '#f59e0b' },
    { name: 'Completed', value: stats?.completedAppointments || 0, color: '#10b981' },
    { name: 'Other', value: (stats?.totalAppointments || 0) - (stats?.pendingAppointments || 0) - (stats?.completedAppointments || 0), color: '#6b7280' },
  ].filter(d => d.value > 0)

  if (loading) return (
    <Layout title="Analytics" subtitle="Clinic performance overview">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </Layout>
  )

  return (
    <Layout title="Analytics" subtitle="Full clinic performance & insights">
      <div className="space-y-6">

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          <StatCard title="Total Patients" value={stats?.totalPatients ?? 0} icon="🙍🏻‍♂️" color="rose" subtitle="Registered" />
          <StatCard title="Total Doctors" value={stats?.totalDoctors ?? 0} icon="⚕️" color="cyan" subtitle="Active" />
          <StatCard title="Appointments" value={stats?.totalAppointments ?? 0} icon="📅" color="violet" subtitle="All time" />
          <StatCard title="Completed" value={stats?.completedAppointments ?? 0} icon="✅" color="emerald" subtitle="Finished" />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">

          {/* Gender Pie */}
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4 md:p-6">
            <h3 className="text-white font-semibold mb-1">Patient Gender</h3>
            <p className="text-gray-500 text-xs mb-4">Distribution breakdown</p>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No patient data yet</div>
            )}
          </div>

          {/* Appointment Status Pie */}
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4 md:p-6">
            <h3 className="text-white font-semibold mb-1">Appointment Status</h3>
            <p className="text-gray-500 text-xs mb-4">Current status breakdown</p>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No appointment data yet</div>
            )}
          </div>

          {/* Doctor Plan Pie */}
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4 md:p-6 sm:col-span-2 xl:col-span-1">
            <h3 className="text-white font-semibold mb-1">Doctor Plans</h3>
            <p className="text-gray-500 text-xs mb-4">Free vs Pro subscription</p>
            {planData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={planData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    <Cell fill="#f59e0b" />
                    <Cell fill="#374151" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-600 text-sm">No doctor data yet</div>
            )}
          </div>
        </div>

        {/* Blood Group + Summary */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Blood Group Bar Chart */}
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4 md:p-6">
            <h3 className="text-white font-semibold mb-1">Blood Group Distribution</h3>
            <p className="text-gray-500 text-xs mb-5">Patients by blood type</p>
            {bloodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={bloodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="url(#roseGrad)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-600 text-sm">No blood group data yet</div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4 md:p-6">
            <h3 className="text-white font-semibold mb-4">Quick Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Active Doctors', value: doctors.filter(d => d.isActive).length, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                { label: 'Pro Doctors', value: doctors.filter(d => d.subscriptionPlan === 'pro').length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Pending Appointments', value: stats?.pendingAppointments ?? 0, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Completed Appointments', value: stats?.completedAppointments ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Male Patients', value: patients.filter(p => p.gender === 'male').length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { label: 'Female Patients', value: patients.filter(p => p.gender === 'female').length, color: 'text-rose-400', bg: 'bg-rose-500/10' },
              ].map(item => (
                <div key={item.label} className={`${item.bg} rounded-xl p-3`}>
                  <p className="text-gray-500 text-xs leading-tight">{item.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}