import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import axios from '../../api/axios'
import React from 'react'

export default function ReceptionistPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [history, setHistory] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [activeTab, setActiveTab] = useState('Overview')

  // Edit state
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [editSuccess, setEditSuccess] = useState('')
  const [editErrors, setEditErrors] = useState({})

  const fetchPatients = () => {
    setLoading(true)
    axios.get('/patients')
      .then(res => setPatients(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchPatients() }, [])

  const fetchHistory = async (patient) => {
    setSelectedPatient(patient)
    setEditForm({
      name: patient.name || '',
      age: patient.age || '',
      gender: patient.gender || '',
      contact: patient.contact || '',
      email: patient.email || '',
      bloodGroup: patient.bloodGroup || '',
      address: patient.address || '',
      medicalHistory: patient.medicalHistory || '',
    })
    setEditMode(false)
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
    setEditMode(false)
    setEditErrors({})
  }

  const validateEdit = () => {
    const e = {}
    if (!editForm.name?.trim()) e.name = 'Name is required'
    if (!editForm.age || editForm.age < 0) e.age = 'Valid age required'
    if (!editForm.gender) e.gender = 'Gender is required'
    if (!editForm.contact?.trim()) e.contact = 'Contact is required'
    return e
  }

  const handleEditSubmit = async () => {
    const errs = validateEdit()
    if (Object.keys(errs).length > 0) return setEditErrors(errs)
    setEditErrors({})
    setEditLoading(true)
    try {
      await axios.put(`/patients/${selectedPatient._id}`, editForm)
      setEditSuccess('Patient updated successfully!')
      setEditMode(false)
      fetchPatients()
      // Update selected patient locally
      setSelectedPatient({ ...selectedPatient, ...editForm })
      setTimeout(() => setEditSuccess(''), 3000)
    } catch (err) {
      setEditErrors({ server: err.response?.data?.message || 'Update failed' })
    } finally {
      setEditLoading(false)
    }
  }

  const handleEditChange = (field, value) => {
    setEditForm({ ...editForm, [field]: value })
    if (editErrors[field]) setEditErrors({ ...editErrors, [field]: '' })
  }

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.contact?.includes(search) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  )

  const statusColors = {
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  const tabs = ['Overview', 'Appointments', 'Prescriptions', 'Edit Info']

  return (
    <Layout title="All Patients" subtitle="View, manage and update patient records">
      <div className="space-y-5">

        {/* Search + Stats Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
            <input
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-700 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm outline-none transition"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-gray-400 text-sm">{filtered.length} patients</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-500 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span>
              {patients.length} total
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Patient List */}
          <div className={`${showPanel ? 'lg:w-2/5' : 'w-full'} transition-all duration-300`}>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl py-20 text-center">
                <p className="text-4xl mb-3">🫀</p>
                <p className="text-gray-500 text-sm">No patients found</p>
                <p className="text-gray-600 text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              /* Table on desktop, cards on mobile */
              <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl overflow-hidden">

                {/* Mobile Cards */}
                <div className="sm:hidden divide-y divide-gray-800/40">
                  {filtered.map(p => (
                    <div
                      key={p._id}
                      onClick={() => fetchHistory(p)}
                      className={`p-4 cursor-pointer hover:bg-gray-800/30 transition
                        ${selectedPatient?._id === p._id ? 'bg-emerald-500/5 border-l-2 border-l-emerald-500' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {p.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">{p.name}</p>
                          <p className="text-gray-500 text-xs">{p.age} yrs • {p.gender} • {p.contact}</p>
                        </div>
                        {p.bloodGroup && (
                          <span className="text-rose-400 text-xs bg-rose-500/10 px-2 py-0.5 rounded-lg flex-shrink-0">
                            {p.bloodGroup}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800/60">
                        <th className="text-left text-gray-500 font-medium px-5 py-4">Patient</th>
                        <th className="text-left text-gray-500 font-medium px-5 py-4 hidden md:table-cell">Age / Gender</th>
                        <th className="text-left text-gray-500 font-medium px-5 py-4">Contact</th>
                        <th className="text-left text-gray-500 font-medium px-5 py-4 hidden lg:table-cell">Blood</th>
                        <th className="text-left text-gray-500 font-medium px-5 py-4 hidden xl:table-cell">Registered</th>
                        <th className="text-left text-gray-500 font-medium px-5 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((p, i) => (
                        <tr
                          key={p._id}
                          className={`border-b border-gray-800/40 hover:bg-gray-800/30 transition cursor-pointer
                            ${selectedPatient?._id === p._id ? 'bg-emerald-500/5 border-l-2 border-l-emerald-500' : ''}
                            ${i % 2 === 0 ? '' : 'bg-gray-900/20'}`}
                          onClick={() => fetchHistory(p)}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {p.name?.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-medium text-sm truncate">{p.name}</p>
                                <p className="text-gray-500 text-xs truncate">{p.email || '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 hidden md:table-cell">
                            <p className="text-gray-300 text-sm">{p.age} yrs</p>
                            <p className="text-gray-500 text-xs capitalize">{p.gender}</p>
                          </td>
                          <td className="px-5 py-3.5 text-gray-300 text-sm">{p.contact}</td>
                          <td className="px-5 py-3.5 hidden lg:table-cell">
                            {p.bloodGroup
                              ? <span className="px-2 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-xs">{p.bloodGroup}</span>
                              : <span className="text-gray-600 text-xs">—</span>
                            }
                          </td>
                          <td className="px-5 py-3.5 text-gray-500 text-xs hidden xl:table-cell">
                            {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => fetchHistory(p)}
                              className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium hover:bg-emerald-500/20 transition whitespace-nowrap"
                            >
                              View / Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Detail & Edit Panel */}
          {showPanel && selectedPatient && (
            <div className="lg:w-3/5 bg-gray-900/60 border border-gray-800/60 rounded-2xl overflow-hidden flex flex-col">

              {/* Panel Header */}
              <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-gray-800/60 p-4 md:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {selectedPatient.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base leading-tight">{selectedPatient.name}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-gray-400 text-xs">{selectedPatient.age} yrs</span>
                        <span className="text-gray-600 text-xs">•</span>
                        <span className="text-gray-400 text-xs capitalize">{selectedPatient.gender}</span>
                        {selectedPatient.bloodGroup && (
                          <>
                            <span className="text-gray-600 text-xs">•</span>
                            <span className="text-rose-400 text-xs">🩸 {selectedPatient.bloodGroup}</span>
                          </>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">📞 {selectedPatient.contact}</p>
                    </div>
                  </div>
                  <button
                    onClick={closePanel}
                    className="text-gray-500 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-700 flex-shrink-0"
                  >✕</button>
                </div>

                {/* Success message */}
                {editSuccess && (
                  <div className="mt-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
                    ✅ {editSuccess}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-800/60 px-4 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => { setActiveTab(tab); if (tab !== 'Edit Info') setEditMode(false) }}
                    className={`px-3 md:px-4 py-3.5 text-xs md:text-sm font-medium border-b-2 transition -mb-px whitespace-nowrap
                      ${activeTab === tab
                        ? 'border-emerald-500 text-emerald-400'
                        : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                  >
                    {tab === 'Edit Info' ? '✏️ Edit Info' : tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4 md:p-5 overflow-y-auto flex-1 max-h-[520px]">

                {historyLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    {/* OVERVIEW TAB */}
                    {activeTab === 'Overview' && (
                      <div className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: 'Appointments', value: history?.appointments?.length || 0, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                            { label: 'Prescriptions', value: history?.prescriptions?.length || 0, color: 'text-violet-400', bg: 'bg-violet-500/10' },
                            { label: 'Completed', value: history?.appointments?.filter(a => a.status === 'completed').length || 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                          ].map(s => (
                            <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                              <p className={`text-xl md:text-2xl font-bold ${s.color}`}>{s.value}</p>
                              <p className="text-gray-500 text-xs mt-0.5 leading-tight">{s.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Patient Details */}
                        <div className="bg-gray-800/40 rounded-xl p-4 space-y-2.5">
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Patient Details</p>
                          {[
                            { label: 'Full Name', value: selectedPatient.name },
                            { label: 'Age', value: `${selectedPatient.age} years` },
                            { label: 'Gender', value: selectedPatient.gender, capitalize: true },
                            { label: 'Contact', value: selectedPatient.contact },
                            { label: 'Email', value: selectedPatient.email || '—' },
                            { label: 'Blood Group', value: selectedPatient.bloodGroup || '—' },
                            { label: 'Address', value: selectedPatient.address || '—' },
                          ].map(item => (
                            <div key={item.label} className="flex items-start gap-3">
                              <p className="text-gray-500 text-xs w-24 flex-shrink-0 mt-0.5">{item.label}</p>
                              <p className={`text-gray-200 text-xs flex-1 ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</p>
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

                        {/* Recent activity */}
                        {(history?.appointments?.length > 0 || history?.prescriptions?.length > 0) && (
                          <div>
                            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Recent Activity</p>
                            <div className="space-y-2">
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
                              {history?.prescriptions?.[0] && (
                                <div className="flex items-center gap-3 bg-gray-800/40 rounded-xl p-3">
                                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-sm flex-shrink-0">💊</div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-medium">Last Prescription</p>
                                    <p className="text-gray-500 text-xs truncate">{history.prescriptions[0].diagnosis || 'Prescription'}</p>
                                  </div>
                                  <span className="text-gray-500 text-xs flex-shrink-0">
                                    {new Date(history.prescriptions[0].createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* APPOINTMENTS TAB */}
                    {activeTab === 'Appointments' && (
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
                                  <p className="text-gray-500 text-xs mt-0.5">Dr. {appt.doctorId?.name || '—'}</p>
                                  {appt.reason && <p className="text-gray-500 text-xs mt-1">Reason: {appt.reason}</p>}
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs border capitalize flex-shrink-0 ${statusColors[appt.status]}`}>
                                  {appt.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* PRESCRIPTIONS TAB */}
                    {activeTab === 'Prescriptions' && (
                      <div className="space-y-3">
                        {history?.prescriptions?.length === 0 ? (
                          <div className="text-center py-12 text-gray-600">
                            <p className="text-3xl mb-2">💊</p>
                            <p className="text-sm">No prescriptions yet</p>
                          </div>
                        ) : (
                          history?.prescriptions?.map(presc => (
                            <div key={presc._id} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/40">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-white font-semibold text-sm">{presc.diagnosis || 'Prescription'}</p>
                                  <p className="text-gray-500 text-xs mt-0.5">Dr. {presc.doctorId?.name} • {new Date(presc.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded-lg text-xs">
                                  {presc.medicines?.length} meds
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                {presc.medicines?.map((med, i) => (
                                  <div key={i} className="flex items-center justify-between bg-gray-700/40 rounded-lg px-3 py-2">
                                    <div>
                                      <p className="text-white text-xs font-medium">💊 {med.name}</p>
                                      <p className="text-gray-500 text-xs">{med.dosage} • {med.frequency}</p>
                                    </div>
                                    <span className="text-gray-400 text-xs bg-gray-700/60 px-2 py-0.5 rounded-lg">{med.duration}</span>
                                  </div>
                                ))}
                              </div>
                              {presc.instructions && (
                                <p className="mt-3 text-gray-500 text-xs pt-3 border-t border-gray-700/40">📝 {presc.instructions}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* EDIT INFO TAB */}
                    {activeTab === 'Edit Info' && (
                      <div className="space-y-4">
                        {editErrors.server && (
                          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                            ⚠ {editErrors.server}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Name */}
                          <div className="sm:col-span-2">
                            <label className="block text-gray-400 text-xs mb-1.5">Full Name <span className="text-red-400">*</span></label>
                            <input
                              value={editForm.name || ''}
                              onChange={e => handleEditChange('name', e.target.value)}
                              className={`w-full bg-gray-800/60 border rounded-xl px-4 py-2.5 text-white text-sm outline-none transition
                                ${editErrors.name ? 'border-red-500/50' : 'border-gray-700 focus:border-emerald-500'}`}
                            />
                            <div className="min-h-[16px] mt-1">
                              {editErrors.name && <p className="text-red-400 text-xs">⚠ {editErrors.name}</p>}
                            </div>
                          </div>

                          {/* Age */}
                          <div>
                            <label className="block text-gray-400 text-xs mb-1.5">Age <span className="text-red-400">*</span></label>
                            <input
                              type="number"
                              value={editForm.age || ''}
                              onChange={e => handleEditChange('age', e.target.value)}
                              className={`w-full bg-gray-800/60 border rounded-xl px-4 py-2.5 text-white text-sm outline-none transition
                                ${editErrors.age ? 'border-red-500/50' : 'border-gray-700 focus:border-emerald-500'}`}
                            />
                            <div className="min-h-[16px] mt-1">
                              {editErrors.age && <p className="text-red-400 text-xs">⚠ {editErrors.age}</p>}
                            </div>
                          </div>

                          {/* Gender */}
                          <div>
                            <label className="block text-gray-400 text-xs mb-1.5">Gender <span className="text-red-400">*</span></label>
                            <select
                              value={editForm.gender || ''}
                              onChange={e => handleEditChange('gender', e.target.value)}
                              className={`w-full bg-gray-800/60 border rounded-xl px-4 py-2.5 text-white text-sm outline-none transition
                                ${editErrors.gender ? 'border-red-500/50' : 'border-gray-700 focus:border-emerald-500'}`}
                            >
                              <option value="">Select</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                            <div className="min-h-[16px] mt-1">
                              {editErrors.gender && <p className="text-red-400 text-xs">⚠ {editErrors.gender}</p>}
                            </div>
                          </div>

                          {/* Contact */}
                          <div>
                            <label className="block text-gray-400 text-xs mb-1.5">Contact <span className="text-red-400">*</span></label>
                            <input
                              value={editForm.contact || ''}
                              onChange={e => handleEditChange('contact', e.target.value)}
                              className={`w-full bg-gray-800/60 border rounded-xl px-4 py-2.5 text-white text-sm outline-none transition
                                ${editErrors.contact ? 'border-red-500/50' : 'border-gray-700 focus:border-emerald-500'}`}
                            />
                            <div className="min-h-[16px] mt-1">
                              {editErrors.contact && <p className="text-red-400 text-xs">⚠ {editErrors.contact}</p>}
                            </div>
                          </div>

                          {/* Email */}
                          <div>
                            <label className="block text-gray-400 text-xs mb-1.5">Email</label>
                            <input
                              type="email"
                              value={editForm.email || ''}
                              onChange={e => handleEditChange('email', e.target.value)}
                              className="w-full bg-gray-800/60 border border-gray-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                            />
                          </div>

                          {/* Blood Group */}
                          <div>
                            <label className="block text-gray-400 text-xs mb-1.5">Blood Group</label>
                            <select
                              value={editForm.bloodGroup || ''}
                              onChange={e => handleEditChange('bloodGroup', e.target.value)}
                              className="w-full bg-gray-800/60 border border-gray-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                            >
                              <option value="">Select</option>
                              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => (
                                <option key={bg} value={bg}>{bg}</option>
                              ))}
                            </select>
                          </div>

                          {/* Address */}
                          <div className="sm:col-span-2">
                            <label className="block text-gray-400 text-xs mb-1.5">Address</label>
                            <input
                              value={editForm.address || ''}
                              onChange={e => handleEditChange('address', e.target.value)}
                              placeholder="Patient's address"
                              className="w-full bg-gray-800/60 border border-gray-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                            />
                          </div>

                          {/* Medical History */}
                          <div className="sm:col-span-2">
                            <label className="block text-gray-400 text-xs mb-1.5">Medical History</label>
                            <textarea
                              rows={3}
                              value={editForm.medicalHistory || ''}
                              onChange={e => handleEditChange('medicalHistory', e.target.value)}
                              placeholder="Known conditions, allergies, past surgeries..."
                              className="w-full bg-gray-800/60 border border-gray-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition resize-none"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleEditSubmit}
                          disabled={editLoading}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
                        >
                          {editLoading
                            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
                            : '✅ Save Changes'
                          }
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}