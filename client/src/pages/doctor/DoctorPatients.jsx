import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import axios from '../../api/axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import React from 'react'

const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const tabs = ['Overview', 'Appointments', 'Prescriptions']

export default function DoctorPatients() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [history, setHistory] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')
  const [showPanel, setShowPanel] = useState(false)

  useEffect(() => {
    axios.get('/patients')
      .then(res => setPatients(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fetchHistory = async (patient) => {
    setSelectedPatient(patient)
    setActiveTab('Overview')
    setShowPanel(true)
    setHistoryLoading(true)
    setHistory(null)
    try {
      const res = await axios.get(`/patients/${patient._id}/history`)
      setHistory(res.data)
    } catch {
      setHistory({ appointments: [], prescriptions: [] })
    } finally {
      setHistoryLoading(false)
    }
  }

  const closePanel = () => {
    setShowPanel(false)
    setSelectedPatient(null)
    setHistory(null)
  }

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.contact?.includes(search) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  const genderIcon = (gender) => {
    if (gender === 'male') return '♂'
    if (gender === 'female') return '♀'
    return '⚧'
  }

  const genderColor = (gender) => {
    if (gender === 'male') return 'text-blue-400'
    if (gender === 'female') return 'text-pink-400'
    return 'text-purple-400'
  }

  return (
    <Layout title="My Patients" subtitle="View patient records, history and medical timeline">
      <div className="space-y-5">

        {/* Search + Count */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
            <input
              placeholder="Search patients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-700 focus:border-cyan-500 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-gray-400 text-sm">{filtered.length} patients</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Patient Cards Grid */}
          <div className={`${showPanel ? 'lg:w-2/5' : 'w-full'} transition-all duration-300`}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl py-20 text-center">
                <p className="text-4xl mb-3">🫀</p>
                <p className="text-gray-500 text-sm">No patients found</p>
              </div>
            ) : (
              <div className={`grid gap-3 ${showPanel ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'}`}>
                {filtered.map(patient => (
                  <div
                    key={patient._id}
                    onClick={() => fetchHistory(patient)}
                    className={`bg-gray-900/60 border rounded-2xl p-4 cursor-pointer hover:border-cyan-500/50 transition-all duration-200 group
                      ${selectedPatient?._id === patient._id
                        ? 'border-cyan-500/60 bg-cyan-500/5 shadow-lg shadow-cyan-500/10'
                        : 'border-gray-800/60'}`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-lg">
                        {patient.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate group-hover:text-cyan-300 transition">
                          {patient.name}
                        </p>
                        <p className="text-gray-500 text-xs truncate">{patient.email || patient.contact}</p>
                      </div>
                      {selectedPatient?._id === patient._id && (
                        <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0 mt-1"></div>
                      )}
                    </div>

                    {/* Patient Info Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-gray-800/60 rounded-lg text-xs text-gray-400">
                        {patient.age} yrs
                      </span>
                      <span className={`px-2 py-0.5 bg-gray-800/60 rounded-lg text-xs ${genderColor(patient.gender)}`}>
                        {genderIcon(patient.gender)} {patient.gender}
                      </span>
                      {patient.bloodGroup && (
                        <span className="px-2 py-0.5 bg-rose-500/10 rounded-lg text-xs text-rose-400">
                          🩸 {patient.bloodGroup}
                        </span>
                      )}
                    </div>

                    {/* Medical History Preview */}
                    {patient.medicalHistory && (
                      <p className="mt-2.5 text-gray-600 text-xs line-clamp-1 border-t border-gray-800/40 pt-2">
                        {patient.medicalHistory}
                      </p>
                    )}

                    {/* Quick Actions */}
                    <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/doctor/prescription/${patient._id}`)}
                        className="flex-1 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg text-xs font-medium hover:bg-cyan-500/20 transition"
                      >
                        💊 Prescribe
                      </button>
                      <button
                        onClick={() => fetchHistory(patient)}
                        className="flex-1 py-1.5 bg-gray-700/50 text-gray-300 border border-gray-700 rounded-lg text-xs font-medium hover:bg-gray-700 transition"
                      >
                        📋 History
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patient Detail Panel */}
          {showPanel && selectedPatient && (
            <div className="lg:w-3/5 bg-gray-900/60 border border-gray-800/60 rounded-2xl overflow-hidden">

              {/* Panel Header */}
              <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-b border-gray-800/60 p-4 md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                      {selectedPatient.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight">{selectedPatient.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-gray-400 text-sm">{selectedPatient.age} years</span>
                        <span className="text-gray-600">•</span>
                        <span className={`text-sm capitalize ${genderColor(selectedPatient.gender)}`}>
                          {genderIcon(selectedPatient.gender)} {selectedPatient.gender}
                        </span>
                        {selectedPatient.bloodGroup && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-rose-400 text-sm">🩸 {selectedPatient.bloodGroup}</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        {selectedPatient.contact && (
                          <span className="text-gray-500 text-xs">📞 {selectedPatient.contact}</span>
                        )}
                        {selectedPatient.email && (
                          <span className="text-gray-500 text-xs">✉️ {selectedPatient.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closePanel}
                    className="text-gray-500 hover:text-white transition text-xl flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700"
                  >✕</button>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/doctor/prescription/${selectedPatient._id}`)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl text-xs font-semibold hover:opacity-90 transition shadow-lg"
                  >
                    💊 Write Prescription
                  </button>
                  <button
                    onClick={() => navigate(`/doctor/ai-checker`)}
                    className="px-4 py-2 bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-xl text-xs font-semibold hover:bg-violet-500/30 transition"
                  >
                    🤖 AI Diagnosis
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-800/60 px-4 md:px-6">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3.5 text-sm font-medium border-b-2 transition -mb-px
                      ${activeTab === tab
                        ? 'border-cyan-500 text-cyan-400'
                        : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4 md:p-6 overflow-y-auto max-h-[500px]">
                {historyLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-7 h-7 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (

                  // OVERVIEW TAB
                  activeTab === 'Overview' && (
                    <div className="space-y-4">

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Appointments', value: history?.appointments?.length || 0, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                          { label: 'Prescriptions', value: history?.prescriptions?.length || 0, color: 'text-violet-400', bg: 'bg-violet-500/10' },
                          { label: 'Completed', value: history?.appointments?.filter(a => a.status === 'completed').length || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        ].map(s => (
                          <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Medical History */}
                      {selectedPatient.medicalHistory && (
                        <div className="bg-gray-800/40 rounded-xl p-4">
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Medical History</p>
                          <p className="text-gray-300 text-sm leading-relaxed">{selectedPatient.medicalHistory}</p>
                        </div>
                      )}

                      {/* Address */}
                      {selectedPatient.address && (
                        <div className="bg-gray-800/40 rounded-xl p-4">
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Address</p>
                          <p className="text-gray-300 text-sm">{selectedPatient.address}</p>
                        </div>
                      )}

                      {/* Recent Activity */}
                      <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Recent Activity</p>
                        {(history?.appointments?.length === 0 && history?.prescriptions?.length === 0) ? (
                          <div className="text-center py-8 text-gray-600">
                            <p className="text-2xl mb-2">📋</p>
                            <p className="text-sm">No activity yet</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {/* Last appointment */}
                            {history?.appointments?.[0] && (
                              <div className="flex items-center gap-3 bg-gray-800/40 rounded-xl p-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm flex-shrink-0">📅</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-xs font-medium">Last Appointment</p>
                                  <p className="text-gray-500 text-xs">{new Date(history.appointments[0].date).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs border capitalize flex-shrink-0 ${statusColors[history.appointments[0].status]}`}>
                                  {history.appointments[0].status}
                                </span>
                              </div>
                            )}
                            {/* Last prescription */}
                            {history?.prescriptions?.[0] && (
                              <div className="flex items-center gap-3 bg-gray-800/40 rounded-xl p-3">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-sm flex-shrink-0">💊</div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-xs font-medium">Last Prescription</p>
                                  <p className="text-gray-500 text-xs">{history.prescriptions[0].diagnosis || 'Prescription'}</p>
                                </div>
                                <span className="text-gray-500 text-xs flex-shrink-0">
                                  {new Date(history.prescriptions[0].createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}

                {/* APPOINTMENTS TAB */}
                {!historyLoading && activeTab === 'Appointments' && (
                  <div className="space-y-3">
                    {history?.appointments?.length === 0 ? (
                      <div className="text-center py-12 text-gray-600">
                        <p className="text-3xl mb-2">📅</p>
                        <p className="text-sm">No appointments yet</p>
                      </div>
                    ) : (
                      history?.appointments?.map(appt => (
                        <div key={appt._id} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/40">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-white font-medium text-sm">
                                {new Date(appt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                              <p className="text-gray-400 text-xs mt-0.5">🕐 {appt.timeSlot}</p>
                              {appt.reason && <p className="text-gray-500 text-xs mt-1">Reason: {appt.reason}</p>}
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs border capitalize flex-shrink-0 ${statusColors[appt.status]}`}>
                              {appt.status}
                            </span>
                          </div>
                          {appt.notes && (
                            <div className="mt-3 pt-3 border-t border-gray-700/40">
                              <p className="text-gray-500 text-xs">📝 {appt.notes}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* PRESCRIPTIONS TAB */}
                {!historyLoading && activeTab === 'Prescriptions' && (
                  <div className="space-y-3">
                    {history?.prescriptions?.length === 0 ? (
                      <div className="text-center py-12 text-gray-600">
                        <p className="text-3xl mb-2">💊</p>
                        <p className="text-sm">No prescriptions yet</p>
                        <button
                          onClick={() => navigate(`/doctor/prescription/${selectedPatient._id}`)}
                          className="mt-3 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl text-xs font-medium hover:bg-cyan-500/20 transition"
                        >
                          + Write First Prescription
                        </button>
                      </div>
                    ) : (
                      history?.prescriptions?.map(presc => (
                        <div key={presc._id} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/40">
                          {/* Prescription Header */}
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-white font-semibold text-sm">{presc.diagnosis || 'Prescription'}</p>
                              <p className="text-gray-500 text-xs mt-0.5">
                                {new Date(presc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 bg-violet-500/20 text-violet-400 rounded-lg text-xs font-medium">
                              {presc.medicines?.length || 0} medicines
                            </span>
                          </div>

                          {/* Medicines */}
                          <div className="space-y-2">
                            {presc.medicines?.map((med, i) => (
                              <div key={i} className="flex items-center justify-between bg-gray-700/40 rounded-lg px-3 py-2">
                                <div>
                                  <p className="text-white text-xs font-medium">💊 {med.name}</p>
                                  <p className="text-gray-500 text-xs">{med.dosage} • {med.frequency}</p>
                                </div>
                                <span className="text-gray-400 text-xs bg-gray-700/60 px-2 py-0.5 rounded-lg">
                                  {med.duration}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Instructions */}
                          {presc.instructions && (
                            <div className="mt-3 pt-3 border-t border-gray-700/40">
                              <p className="text-gray-500 text-xs">📝 {presc.instructions}</p>
                            </div>
                          )}

                          {/* Follow up */}
                          {presc.followUpDate && (
                            <div className="mt-2">
                              <p className="text-amber-400 text-xs">
                                📅 Follow-up: {new Date(presc.followUpDate).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}