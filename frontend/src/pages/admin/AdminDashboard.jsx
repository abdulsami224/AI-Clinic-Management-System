import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import StatCard from '../../components/StatCard'
import axios from '../../api/axios'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts'
import React from 'react'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/analytics/admin')
      .then(res => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const chartData = stats?.monthlyData?.map(d => ({
    month: MONTHS[(d._id.month || 1) - 1],
    appointments: d.count
  })) || []

  return (
    <Layout title="Admin Dashboard" subtitle="Overview of your clinic system">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <StatCard title="Total Patients" value={stats?.totalPatients ?? 0} icon="🫀" color="rose" subtitle="Registered patients" />
            <StatCard title="Total Doctors" value={stats?.totalDoctors ?? 0} icon="⚕️" color="cyan" subtitle="Active doctors" />
            <StatCard title="Total Appointments" value={stats?.totalAppointments ?? 0} icon="📅" color="violet" subtitle="All time" />
            <StatCard title="Completed" value={stats?.completedAppointments ?? 0} icon="✅" color="emerald" subtitle="Finished appointments" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Bar Chart */}
            <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-1">Monthly Appointments</h3>
              <p className="text-gray-500 text-sm mb-6">Last 6 months overview</p>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }}
                    />
                    <Bar dataKey="appointments" fill="url(#violetGrad)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#4f46e5" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-600">No data yet</div>
              )}
            </div>

            {/* Line Chart */}
            <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-1">Appointment Trend</h3>
              <p className="text-gray-500 text-sm mb-6">Growth over time</p>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }}
                    />
                    <Line type="monotone" dataKey="appointments" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-600">No data yet</div>
              )}
            </div>
          </div>

          {/* Status Summary */}
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Appointment Status Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Pending', value: stats?.pendingAppointments ?? 0, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Completed', value: stats?.completedAppointments ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Total', value: stats?.totalAppointments ?? 0, color: 'text-violet-400', bg: 'bg-violet-500/10' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                  <p className="text-gray-400 text-sm">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </Layout>
  )
}