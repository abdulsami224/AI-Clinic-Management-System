import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import axios from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import React from 'react'

const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const statusIcons = {
  pending: '⏳',
  confirmed: '✅',
  completed: '🎯',
  cancelled: '❌',
}

export default function MyAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedAppt, setSelectedAppt] = useState(null)

    // useEffect(() => {
    // // First get the patient record linked to this user account
    // axios.get('/patients/me')
    //     .then(res => axios.get(`/patients/${res.data._id}/history`))
    //     .then(res => setAppointments(res.data.appointments || []))  // or setData(res.data)
    //     .catch(() => setAppointments([]))
    //     .finally(() => setLoading(false))
    // }, [])


    useEffect(() => {
      axios.get('/patients/me')
        .then(res => axios.get(`/patients/${res.data._id}/history`))
        .then(res => setAppointments(res.data.appointments || []))
        .catch(() => setAppointments([]))
        .finally(() => setLoading(false))
    }, [])
  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return
    try {
      await axios.patch(`/appointments/${id}/status`, { status: 'cancelled' })
      setAppointments(prev =>
        prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a)
      )
      if (selectedAppt?._id === id) setSelectedAppt({ ...selectedAppt, status: 'cancelled' })
    } catch {}
  }

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter)

  const upcoming = appointments.filter(a =>
    new Date(a.date) >= new Date() && a.status !== 'cancelled'
  ).length

  const completed = appointments.filter(a => a.status === 'completed').length

  return (
    <Layout title="My Appointments" subtitle="Track and manage your clinic appointments">
      <div className="space-y-5 max-w-4xl">

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: appointments.length, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
            { label: 'Upcoming', value: upcoming, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'Completed', value: completed, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-medium capitalize transition border
                ${filter === f
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-gray-800/60 text-gray-400 border-gray-700 hover:border-gray-500'}`}
            >
              {f} {f !== 'all' && `(${appointments.filter(a => a.status === f).length})`}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl py-20 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-white font-medium">No appointments found</p>
            <p className="text-gray-500 text-sm mt-1">
              {filter === 'all' ? 'Your appointments will appear here' : `No ${filter} appointments`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(appt => (
              <div
                key={appt._id}
                className={`bg-gray-900/60 border rounded-2xl p-4 md:p-5 transition cursor-pointer hover:border-gray-600
                  ${selectedAppt?._id === appt._id ? 'border-rose-500/40 bg-rose-500/5' : 'border-gray-800/60'}`}
                onClick={() => setSelectedAppt(selectedAppt?._id === appt._id ? null : appt)}
              >
                {/* Main Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    {/* Date Block */}
                    <div className="bg-gray-800/60 rounded-xl p-3 text-center min-w-[56px] flex-shrink-0">
                      <p className="text-rose-400 text-xs font-semibold uppercase">
                        {new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                      <p className="text-white text-xl font-bold leading-tight">
                        {new Date(appt.date).getDate()}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(appt.date).getFullYear()}
                      </p>
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm">
                          Dr. {appt.doctorId?.name || 'Doctor'}
                        </p>
                        {appt.doctorId?.specialization && (
                          <span className="text-xs text-gray-500 bg-gray-800/60 px-2 py-0.5 rounded-lg">
                            {appt.doctorId.specialization}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-0.5">🕐 {appt.timeSlot}</p>
                      {appt.reason && (
                        <p className="text-gray-500 text-xs mt-1">📋 {appt.reason}</p>
                      )}
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${statusColors[appt.status]}`}>
                      {statusIcons[appt.status]} {appt.status}
                    </span>
                    {/* Cancel button — only for pending/confirmed future appointments */}
                    {(appt.status === 'pending' || appt.status === 'confirmed') &&
                      new Date(appt.date) >= new Date() && (
                      <button
                        onClick={e => { e.stopPropagation(); handleCancel(appt._id) }}
                        className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs hover:bg-red-500/20 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedAppt?._id === appt._id && (
                  <div className="mt-4 pt-4 border-t border-gray-800/60 space-y-3">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Appointment Details</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: 'Date', value: new Date(appt.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
                        { label: 'Time Slot', value: appt.timeSlot },
                        { label: 'Doctor', value: `Dr. ${appt.doctorId?.name || '—'}` },
                        { label: 'Specialization', value: appt.doctorId?.specialization || '—' },
                        { label: 'Status', value: appt.status, capitalize: true },
                        { label: 'Booked On', value: new Date(appt.createdAt).toLocaleDateString() },
                      ].map(item => (
                        <div key={item.label} className="bg-gray-800/40 rounded-xl px-4 py-3">
                          <p className="text-gray-500 text-xs">{item.label}</p>
                          <p className={`text-white text-sm font-medium mt-0.5 ${item.capitalize ? 'capitalize' : ''}`}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {appt.notes && (
                      <div className="bg-gray-800/40 rounded-xl px-4 py-3">
                        <p className="text-gray-500 text-xs">Notes</p>
                        <p className="text-gray-300 text-sm mt-0.5">{appt.notes}</p>
                      </div>
                    )}

                    {/* Status Message */}
                    {appt.status === 'completed' && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                        <p className="text-emerald-400 text-xs font-medium">✅ This appointment has been completed. Check your prescriptions for any medicines prescribed.</p>
                      </div>
                    )}
                    {appt.status === 'pending' && (
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                        <p className="text-amber-400 text-xs font-medium">⏳ Your appointment is pending confirmation from the clinic.</p>
                      </div>
                    )}
                    {appt.status === 'confirmed' && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
                        <p className="text-blue-400 text-xs font-medium">✅ Your appointment is confirmed! Please arrive 10 minutes early.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}