import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import axios from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import jsPDF from 'jspdf'
import React from 'react'

const statusColors = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function MedicalHistory() {
  const { user } = useAuth()
  const [data, setData] = useState({ appointments: [], prescriptions: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('timeline')
  const [expandedPrescription, setExpandedPrescription] = useState(null)

    useEffect(() => {
    // First get the patient record linked to this user account
    axios.get('/patients/me')
        .then(res => axios.get(`/patients/${res.data._id}/history`))
        .then(res => setAppointments(res.data.appointments || []))  // or setData(res.data)
        .catch(() => setAppointments([]))
        .finally(() => setLoading(false))
    }, [])

  // Build unified timeline sorted by date
  const timeline = [
    ...data.appointments.map(a => ({ ...a, type: 'appointment', sortDate: new Date(a.date) })),
    ...data.prescriptions.map(p => ({ ...p, type: 'prescription', sortDate: new Date(p.createdAt) })),
  ].sort((a, b) => b.sortDate - a.sortDate)

  const downloadPrescriptionPDF = (presc) => {
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.setTextColor(30, 64, 175)
    doc.text('MediSaaS Clinic', 105, 20, { align: 'center' })
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text('PRESCRIPTION', 105, 30, { align: 'center' })
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 35, 190, 35)

    doc.setFontSize(10)
    doc.text(`Patient: ${user?.name}`, 20, 44)
    doc.text(`Doctor: Dr. ${presc.doctorId?.name || '—'}`, 20, 52)
    doc.text(`Date: ${new Date(presc.createdAt).toLocaleDateString()}`, 150, 44)
    if (presc.diagnosis) doc.text(`Diagnosis: ${presc.diagnosis}`, 20, 60)

    doc.line(20, 65, 190, 65)
    doc.setFontSize(11)
    doc.text('Medicines:', 20, 73)

    let y = 83
    presc.medicines?.forEach((m, i) => {
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text(`${i + 1}. ${m.name}`, 25, y)
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text(`   Dosage: ${m.dosage}  |  Frequency: ${m.frequency}  |  Duration: ${m.duration}`, 25, y + 6)
      doc.setTextColor(0, 0, 0)
      y += 16
    })

    if (presc.instructions) {
      y += 4
      doc.line(20, y, 190, y)
      y += 8
      doc.setFontSize(10)
      doc.text('Instructions:', 20, y)
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      const lines = doc.splitTextToSize(presc.instructions, 160)
      doc.text(lines, 20, y + 7)
    }

    if (presc.followUpDate) {
      y += 20
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text(`Follow-up Date: ${new Date(presc.followUpDate).toLocaleDateString()}`, 20, y)
    }

    doc.save(`prescription-${new Date(presc.createdAt).toLocaleDateString('en-US').replace(/\//g, '-')}.pdf`)
  }

  const tabs = [
    { key: 'timeline', label: '📋 Timeline' },
    { key: 'appointments', label: '📅 Appointments' },
    { key: 'prescriptions', label: '💊 Prescriptions' },
  ]

  return (
    <Layout title="Medical History" subtitle="Your complete health journey and records">
      <div className="space-y-5 max-w-4xl">

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Visits', value: data.appointments.length, icon: '📅', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
            { label: 'Completed', value: data.appointments.filter(a => a.status === 'completed').length, icon: '✅', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Prescriptions', value: data.prescriptions.length, icon: '💊', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
            { label: 'Doctors Seen', value: [...new Set(data.appointments.map(a => a.doctorId?._id).filter(Boolean))].length, icon: '⚕️', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-2xl p-4`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg">{s.icon}</span>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900/60 border border-gray-800/60 rounded-2xl p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-medium transition
                ${activeTab === tab.key
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* ── TIMELINE TAB ── */}
            {activeTab === 'timeline' && (
              <div>
                {timeline.length === 0 ? (
                  <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl py-20 text-center">
                    <p className="text-4xl mb-3">📋</p>
                    <p className="text-white font-medium">No medical history yet</p>
                    <p className="text-gray-500 text-sm mt-1">Your health timeline will appear here</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-500/50 via-gray-700 to-transparent"></div>

                    <div className="space-y-4 pl-14 md:pl-20">
                      {timeline.map((item, idx) => (
                        <div key={item._id} className="relative">
                          {/* Timeline dot */}
                          <div className={`absolute -left-10 md:-left-12 top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center
                            ${item.type === 'appointment'
                              ? 'bg-blue-500/20 border-blue-500'
                              : 'bg-violet-500/20 border-violet-500'}`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${item.type === 'appointment' ? 'bg-blue-400' : 'bg-violet-400'}`}></div>
                          </div>

                          {/* Timestamp */}
                          <p className="text-gray-600 text-xs mb-1.5 font-medium">
                            {item.sortDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>

                          {/* Appointment Card */}
                          {item.type === 'appointment' && (
                            <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4 hover:border-gray-700 transition">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-base flex-shrink-0">📅</div>
                                  <div>
                                    <p className="text-white font-semibold text-sm">Appointment</p>
                                    <p className="text-gray-400 text-xs">Dr. {item.doctorId?.name || '—'}
                                      {item.doctorId?.specialization && (
                                        <span className="ml-1 text-gray-600">• {item.doctorId.specialization}</span>
                                      )}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-0.5">🕐 {item.timeSlot}</p>
                                  </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize flex-shrink-0 ${statusColors[item.status]}`}>
                                  {item.status}
                                </span>
                              </div>
                              {item.reason && (
                                <div className="mt-3 pt-3 border-t border-gray-800/60">
                                  <p className="text-gray-500 text-xs">Reason: <span className="text-gray-300">{item.reason}</span></p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Prescription Card */}
                          {item.type === 'prescription' && (
                            <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4 hover:border-gray-700 transition">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center text-base flex-shrink-0">💊</div>
                                  <div>
                                    <p className="text-white font-semibold text-sm">{item.diagnosis || 'Prescription'}</p>
                                    <p className="text-gray-400 text-xs">Dr. {item.doctorId?.name || '—'}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">{item.medicines?.length || 0} medicines prescribed</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => downloadPrescriptionPDF(item)}
                                  className="px-3 py-1.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg text-xs hover:bg-violet-500/20 transition flex-shrink-0"
                                >
                                  📄 PDF
                                </button>
                              </div>

                              {/* Medicine pills */}
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {item.medicines?.map((m, i) => (
                                  <span key={i} className="px-2.5 py-1 bg-gray-800/60 text-gray-300 rounded-lg text-xs">
                                    {m.name}
                                  </span>
                                ))}
                              </div>

                              {item.instructions && (
                                <p className="mt-3 text-gray-500 text-xs pt-3 border-t border-gray-800/60">
                                  📝 {item.instructions}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── APPOINTMENTS TAB ── */}
            {activeTab === 'appointments' && (
              <div className="space-y-3">
                {data.appointments.length === 0 ? (
                  <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl py-20 text-center">
                    <p className="text-4xl mb-3">📅</p>
                    <p className="text-white font-medium">No appointments yet</p>
                  </div>
                ) : (
                  data.appointments.map(appt => (
                    <div key={appt._id} className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-4 md:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                          {/* Date block */}
                          <div className="bg-gray-800/60 rounded-xl p-3 text-center min-w-[52px] flex-shrink-0">
                            <p className="text-rose-400 text-xs font-semibold uppercase">
                              {new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}
                            </p>
                            <p className="text-white text-xl font-bold leading-tight">{new Date(appt.date).getDate()}</p>
                            <p className="text-gray-500 text-xs">{new Date(appt.date).getFullYear()}</p>
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">Dr. {appt.doctorId?.name || '—'}</p>
                            {appt.doctorId?.specialization && (
                              <p className="text-gray-500 text-xs">{appt.doctorId.specialization}</p>
                            )}
                            <p className="text-gray-400 text-xs mt-0.5">🕐 {appt.timeSlot}</p>
                            {appt.reason && <p className="text-gray-500 text-xs mt-0.5">📋 {appt.reason}</p>}
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium border capitalize self-start sm:self-auto ${statusColors[appt.status]}`}>
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── PRESCRIPTIONS TAB ── */}
            {activeTab === 'prescriptions' && (
              <div className="space-y-3">
                {data.prescriptions.length === 0 ? (
                  <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl py-20 text-center">
                    <p className="text-4xl mb-3">💊</p>
                    <p className="text-white font-medium">No prescriptions yet</p>
                    <p className="text-gray-500 text-sm mt-1">Prescriptions from your doctor will appear here</p>
                  </div>
                ) : (
                  data.prescriptions.map(presc => (
                    <div key={presc._id} className="bg-gray-900/60 border border-gray-800/60 rounded-2xl overflow-hidden">
                      {/* Prescription Header */}
                      <div
                        className="p-4 md:p-5 cursor-pointer hover:bg-gray-800/20 transition"
                        onClick={() => setExpandedPrescription(expandedPrescription === presc._id ? null : presc._id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-lg flex-shrink-0">💊</div>
                            <div>
                              <p className="text-white font-semibold text-sm">{presc.diagnosis || 'Prescription'}</p>
                              <p className="text-gray-400 text-xs">Dr. {presc.doctorId?.name || '—'}</p>
                              <p className="text-gray-500 text-xs mt-0.5">
                                {new Date(presc.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                {' • '}{presc.medicines?.length} medicines
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={e => { e.stopPropagation(); downloadPrescriptionPDF(presc) }}
                              className="px-3 py-1.5 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-lg text-xs hover:bg-violet-500/20 transition"
                            >
                              📄 Download
                            </button>
                            <span className="text-gray-500 text-lg">
                              {expandedPrescription === presc._id ? '▲' : '▼'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Medicine Details */}
                      {expandedPrescription === presc._id && (
                        <div className="border-t border-gray-800/60 p-4 md:p-5 space-y-3 bg-gray-800/20">
                          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Medicines</p>
                          <div className="space-y-2">
                            {presc.medicines?.map((med, i) => (
                              <div key={i} className="flex items-center justify-between bg-gray-800/60 rounded-xl px-4 py-3">
                                <div>
                                  <p className="text-white text-sm font-medium">💊 {med.name}</p>
                                  <p className="text-gray-500 text-xs mt-0.5">{med.dosage} • {med.frequency}</p>
                                </div>
                                <span className="text-gray-400 text-xs bg-gray-700/60 px-2.5 py-1 rounded-lg flex-shrink-0 ml-3">
                                  {med.duration}
                                </span>
                              </div>
                            ))}
                          </div>

                          {presc.instructions && (
                            <div className="bg-gray-800/40 rounded-xl p-4">
                              <p className="text-gray-400 text-xs font-medium mb-1">Instructions</p>
                              <p className="text-gray-300 text-sm leading-relaxed">{presc.instructions}</p>
                            </div>
                          )}

                          {presc.followUpDate && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                              <p className="text-amber-400 text-xs font-medium">
                                📅 Follow-up: {new Date(presc.followUpDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}