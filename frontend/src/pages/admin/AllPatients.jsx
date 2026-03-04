import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import axios from '../../api/axios'
import React from 'react'

export default function AllPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [history, setHistory] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    axios.get('/patients')
      .then(res => setPatients(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fetchHistory = async (patient) => {
    setSelectedPatient(patient)
    setHistoryLoading(true)
    try {
      const res = await axios.get(`/patients/${patient._id}/history`)
      setHistory(res.data)
    } catch {
      setHistory(null)
    } finally {
      setHistoryLoading(false)
    }
  }

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.contact?.includes(search) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    cancelled: 'bg-red-500/20 text-red-400',
  }

  return (
    <Layout title="All Patients" subtitle="View and manage all registered patients">
      <div className="space-y-6">

        {/* Search + Stats Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
            <input
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-700 focus:border-violet-500 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            {filtered.length} patients found
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Patients Table */}
          <div className={`bg-gray-900/60 border border-gray-800/60 rounded-2xl overflow-hidden ${selectedPatient ? 'lg:w-1/2' : 'w-full'}`}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <p className="text-4xl mb-3">🫀</p>
                <p className="text-sm">No patients found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-800/60">
                      <th className="text-left text-gray-500 font-medium px-4 md:px-6 py-4">Patient</th>
                      <th className="text-left text-gray-500 font-medium px-4 md:px-6 py-4 hidden md:table-cell">Age/Gender</th>
                      <th className="text-left text-gray-500 font-medium px-4 md:px-6 py-4 hidden sm:table-cell">Contact</th>
                      <th className="text-left text-gray-500 font-medium px-4 md:px-6 py-4 hidden lg:table-cell">Blood</th>
                      <th className="text-left text-gray-500 font-medium px-4 md:px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p, i) => (
                      <tr
                        key={p._id}
                        className={`border-b border-gray-800/40 hover:bg-gray-800/30 transition cursor-pointer
                          ${selectedPatient?._id === p._id ? 'bg-violet-500/5 border-l-2 border-l-violet-500' : ''}
                          ${i % 2 === 0 ? '' : 'bg-gray-900/20'}`}
                      >
                        <td className="px-4 md:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs md:text-sm flex-shrink-0">
                              {p.name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-white font-medium text-xs md:text-sm truncate">{p.name}</p>
                              <p className="text-gray-500 text-xs truncate hidden sm:block">{p.email || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 hidden md:table-cell">
                          <p className="text-gray-300 text-sm">{p.age} yrs</p>
                          <p className="text-gray-500 text-xs capitalize">{p.gender}</p>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-gray-300 text-sm hidden sm:table-cell">{p.contact}</td>
                        <td className="px-4 md:px-6 py-4 hidden lg:table-cell">
                          {p.bloodGroup ? (
                            <span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded-lg text-xs font-medium">
                              {p.bloodGroup}
                            </span>
                          ) : <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <button
                            onClick={() => fetchHistory(p)}
                            className="px-2.5 md:px-3 py-1.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg text-xs font-medium hover:bg-violet-500/20 transition whitespace-nowrap"
                          >
                            View History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Patient History Panel */}
          {selectedPatient && (
            <div className="lg:w-1/2 bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4 md:p-6 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {selectedPatient.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-bold">{selectedPatient.name}</p>
                    <p className="text-gray-400 text-sm">{selectedPatient.age} yrs • {selectedPatient.gender} • {selectedPatient.bloodGroup || 'Blood N/A'}</p>
                    <p className="text-gray-500 text-xs">{selectedPatient.contact}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedPatient(null); setHistory(null) }}
                  className="text-gray-500 hover:text-white transition text-lg"
                >✕</button>
              </div>

              {/* Medical History Note */}
              {selectedPatient.medicalHistory && (
                <div className="bg-gray-800/40 rounded-xl p-4">
                  <p className="text-gray-400 text-xs font-medium mb-1">Medical History</p>
                  <p className="text-gray-300 text-sm">{selectedPatient.medicalHistory}</p>
                </div>
              )}

              {historyLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-7 h-7 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : history ? (
                <div className="space-y-4">

                  {/* Appointments Timeline */}
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      Appointments ({history.appointments?.length || 0})
                    </p>
                    {history.appointments?.length === 0 ? (
                      <p className="text-gray-600 text-sm">No appointments yet</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {history.appointments?.map(appt => (
                          <div key={appt._id} className="flex items-center justify-between bg-gray-800/40 rounded-xl px-4 py-3">
                            <div>
                              <p className="text-white text-sm font-medium">Dr. {appt.doctorId?.name}</p>
                              <p className="text-gray-500 text-xs">{new Date(appt.date).toLocaleDateString()} • {appt.timeSlot}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusColors[appt.status]}`}>
                              {appt.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prescriptions */}
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      Prescriptions ({history.prescriptions?.length || 0})
                    </p>
                    {history.prescriptions?.length === 0 ? (
                      <p className="text-gray-600 text-sm">No prescriptions yet</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {history.prescriptions?.map(presc => (
                          <div key={presc._id} className="bg-gray-800/40 rounded-xl px-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-white text-sm font-medium">{presc.diagnosis || 'Prescription'}</p>
                              <p className="text-gray-500 text-xs">{new Date(presc.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {presc.medicines?.map((m, i) => (
                                <span key={i} className="px-2 py-0.5 bg-violet-500/10 text-violet-300 rounded-lg text-xs">
                                  💊 {m.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}