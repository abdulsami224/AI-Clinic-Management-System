import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import axios from '../../api/axios'
import { useNavigate } from 'react-router-dom'
import React from 'react'


const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const navigate = useNavigate()

  const fetchAppointments = () => {
    axios.get('/appointments/doctor')
      .then(res => setAppointments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAppointments() }, [])

  const updateStatus = async (id, status) => {
    await axios.patch(`/appointments/${id}/status`, { status })
    fetchAppointments()
  }

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter)

  return (
    <Layout title="My Appointments" subtitle="Manage your patient appointments">
      <div className="space-y-6">

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition
                ${filter === f ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-gray-800/60 text-gray-400 border border-gray-700 hover:border-gray-500'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl py-20 text-center text-gray-600">
            <p className="text-4xl mb-3">📅</p>
            <p>No appointments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(appt => (
              <div key={appt._id} className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-5 hover:border-gray-600 transition">
                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                      {appt.patientId?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{appt.patientId?.name || 'Patient'}</p>
                      <p className="text-gray-400 text-sm">Age: {appt.patientId?.age || '—'} • {appt.patientId?.gender || '—'}</p>
                      <p className="text-gray-500 text-xs mt-0.5">📞 {appt.patientId?.contact || '—'}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-white font-medium">{new Date(appt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <p className="text-gray-400 text-sm">{appt.timeSlot}</p>
                    <span className={`mt-1 inline-block px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${statusColors[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                </div>

                {appt.reason && (
                  <div className="mt-3 pt-3 border-t border-gray-800/60">
                    <p className="text-gray-500 text-xs">Reason: <span className="text-gray-300">{appt.reason}</span></p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {appt.status === 'pending' && (
                    <button onClick={() => updateStatus(appt._id, 'confirmed')}
                      className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition border border-blue-500/20">
                      Confirm
                    </button>
                  )}
                  {appt.status === 'confirmed' && (
                    <button onClick={() => updateStatus(appt._id, 'completed')}
                      className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition border border-emerald-500/20">
                      Mark Complete
                    </button>
                  )}
                  {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                    <button onClick={() => updateStatus(appt._id, 'cancelled')}
                      className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition border border-red-500/20">
                      Cancel
                    </button>
                  )}
                  {(appt.status === 'confirmed' || appt.status === 'completed') && (
                    <button onClick={() => navigate(`/doctor/prescription/${appt.patientId?._id}`)}
                      className="px-3 py-1.5 bg-violet-500/10 text-violet-400 rounded-lg text-xs font-medium hover:bg-violet-500/20 transition border border-violet-500/20">
                      Write Prescription
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}