import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import axios from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import jsPDF from 'jspdf'
import React from 'react'


export default function MyPrescriptions() {
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/patients/me')
      .then(res => axios.get(`/patients/${res.data._id}/history`))
      .then(res => setPrescriptions(res.data.prescriptions || []))
      .catch(() => setPrescriptions([]))
      .finally(() => setLoading(false))
  }, [])
  const downloadPDF = (prescription) => {
    const doc = new jsPDF()

    doc.setFontSize(20)
    doc.setTextColor(30, 64, 175)
    doc.text('MediSaaS Clinic', 105, 20, { align: 'center' })

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('PRESCRIPTION', 105, 30, { align: 'center' })

    doc.setDrawColor(200, 200, 200)
    doc.line(20, 35, 190, 35)

    doc.setFontSize(10)
    doc.text(`Doctor: Dr. ${prescription.doctorId?.name || 'Doctor'}`, 20, 45)
    doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`, 150, 45)
    doc.text(`Patient: ${user?.name}`, 20, 53)
    doc.text(`Diagnosis: ${prescription.diagnosis || 'N/A'}`, 20, 61)

    doc.line(20, 66, 190, 66)
    doc.setFontSize(11)
    doc.text('Medicines:', 20, 74)

    let y = 84
    prescription.medicines?.forEach((m, i) => {
      doc.setFontSize(10)
      doc.setTextColor(0,0,0)
      doc.text(`${i + 1}. ${m.name}`, 25, y)
      doc.setFontSize(9)
      doc.setTextColor(100,100,100)
      doc.text(`   Dosage: ${m.dosage} | ${m.frequency} | Duration: ${m.duration}`, 25, y + 6)
      y += 16
    })

    if (prescription.instructions) {
      y += 5
      doc.line(20, y, 190, y)
      y += 8
      doc.setFontSize(10)
      doc.setTextColor(0,0,0)
      doc.text('Instructions:', 20, y)
      doc.setFontSize(9)
      doc.setTextColor(80,80,80)
      const lines = doc.splitTextToSize(prescription.instructions, 160)
      doc.text(lines, 20, y + 7)
    }

    doc.save(`prescription-${new Date(prescription.createdAt).toLocaleDateString().replace(/\//g,'-')}.pdf`)
  }

  return (
    <Layout title="My Prescriptions" subtitle="View and download your prescriptions">
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl py-20 text-center">
            <p className="text-5xl mb-4">💊</p>
            <p className="text-white font-semibold">No prescriptions yet</p>
            <p className="text-gray-500 text-sm mt-2">Your prescriptions will appear here after your doctor visits</p>
          </div>
        ) : (
          prescriptions.map(p => (
            <div key={p._id} className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-semibold">{p.diagnosis || 'Prescription'}</p>
                  <p className="text-gray-400 text-sm mt-0.5">Dr. {p.doctorId?.name} • {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => downloadPDF(p)}
                  className="px-4 py-2 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-xl text-xs font-medium hover:bg-violet-500/20 transition"
                >
                  📄 Download PDF
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {p.medicines?.map((m, i) => (
                  <div key={i} className="bg-gray-800/40 rounded-lg px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{m.name}</p>
                      <p className="text-gray-500 text-xs">{m.dosage} • {m.frequency}</p>
                    </div>
                    <span className="text-gray-400 text-xs bg-gray-700/60 px-2 py-1 rounded-lg">{m.duration}</span>
                  </div>
                ))}
              </div>

              {p.instructions && (
                <div className="mt-3 pt-3 border-t border-gray-800/60">
                  <p className="text-gray-500 text-xs">📝 {p.instructions}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Layout>
  )
}