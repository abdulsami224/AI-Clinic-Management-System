import { useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import axios from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import jsPDF from 'jspdf'
import React from 'react'


const emptyMedicine = { name: '', dosage: '', frequency: '', duration: '' }

export default function AddPrescription() {
  const { patientId } = useParams()
  const { user } = useAuth()
  const [medicines, setMedicines] = useState([{ ...emptyMedicine }])
  const [form, setForm] = useState({ diagnosis: '', instructions: '', followUpDate: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')

  const addMedicine = () => setMedicines([...medicines, { ...emptyMedicine }])
  const removeMedicine = (i) => setMedicines(medicines.filter((_, idx) => idx !== i))

  const updateMedicine = (i, field, value) => {
    const updated = [...medicines]
    updated[i][field] = value
    setMedicines(updated)
  }

  const handleSubmit = async () => {
    if (!form.diagnosis.trim()) return setError('Diagnosis is required')
    if (medicines.some(m => !m.name.trim())) return setError('All medicine names are required')
    setError('')
    setSubmitting(true)
    try {
      const res = await axios.post('/prescriptions', {
        patientId,
        medicines,
        ...form
      })
      setSuccess(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save prescription')
    } finally {
      setSubmitting(false)
    }
  }

  const generatePDF = () => {
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
    doc.text(`Doctor: Dr. ${user?.name}`, 20, 45)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 45)
    doc.text(`Diagnosis: ${form.diagnosis}`, 20, 55)

    doc.line(20, 60, 190, 60)
    doc.setFontSize(11)
    doc.text('Medicines:', 20, 68)

    let y = 78
    medicines.forEach((m, i) => {
      doc.setFontSize(10)
      doc.text(`${i + 1}. ${m.name}`, 25, y)
      doc.setFontSize(9)
      doc.setTextColor(100, 100, 100)
      doc.text(`   Dosage: ${m.dosage} | ${m.frequency} | Duration: ${m.duration}`, 25, y + 6)
      doc.setTextColor(0, 0, 0)
      y += 16
    })

    if (form.instructions) {
      y += 5
      doc.line(20, y, 190, y)
      y += 8
      doc.setFontSize(10)
      doc.text('Instructions:', 20, y)
      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      const lines = doc.splitTextToSize(form.instructions, 160)
      doc.text(lines, 20, y + 7)
    }

    doc.save('prescription.pdf')
  }

  return (
    <Layout title="Write Prescription" subtitle="Create prescription for your patient">
      <div className="max-w-3xl space-y-6">

        {success ? (
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-white font-bold text-xl mb-2">Prescription Saved!</h3>
            <p className="text-gray-400 text-sm mb-6">The prescription has been created successfully.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={generatePDF}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition"
              >
                📄 Download PDF
              </button>
              <button
                onClick={() => { setSuccess(null); setMedicines([{ ...emptyMedicine }]); setForm({ diagnosis: '', instructions: '', followUpDate: '' }) }}
                className="bg-gray-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-600 transition"
              >
                Write Another
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Diagnosis */}
            <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6 space-y-4">
              <h3 className="text-white font-semibold">Diagnosis</h3>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Diagnosis <span className="text-red-400">*</span></label>
                <input
                  placeholder="e.g. Acute Pharyngitis"
                  value={form.diagnosis}
                  onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1.5">Follow-up Date</label>
                <input
                  type="date"
                  value={form.followUpDate}
                  onChange={e => setForm({ ...form, followUpDate: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700 focus:border-cyan-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                />
              </div>
            </div>

            {/* Medicines */}
            <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Medicines</h3>
                <button onClick={addMedicine} className="text-cyan-400 text-sm hover:underline">+ Add Medicine</button>
              </div>

              {medicines.map((med, i) => (
                <div key={i} className="bg-gray-800/40 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-gray-400 text-xs font-medium">Medicine #{i + 1}</p>
                    {medicines.length > 1 && (
                      <button onClick={() => removeMedicine(i)} className="text-red-400 text-xs hover:underline">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { field: 'name', label: 'Medicine Name', placeholder: 'e.g. Paracetamol' },
                      { field: 'dosage', label: 'Dosage', placeholder: 'e.g. 500mg' },
                      { field: 'frequency', label: 'Frequency', placeholder: 'e.g. 3 times a day' },
                      { field: 'duration', label: 'Duration', placeholder: 'e.g. 5 days' },
                    ].map(({ field, label, placeholder }) => (
                      <div key={field}>
                        <label className="block text-gray-500 text-xs mb-1">{label}</label>
                        <input
                          placeholder={placeholder}
                          value={med[field]}
                          onChange={e => updateMedicine(i, field, e.target.value)}
                          className="w-full bg-gray-700/60 border border-gray-600 focus:border-cyan-500 rounded-lg px-3 py-2 text-white text-sm outline-none transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6">
              <h3 className="text-white font-semibold mb-4">Additional Instructions</h3>
              <textarea
                rows={3}
                placeholder="e.g. Rest for 2 days, drink plenty of water, avoid cold food..."
                value={form.instructions}
                onChange={e => setForm({ ...form, instructions: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
                ⚠ {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {submitting ? 'Saving...' : '💊 Save Prescription'}
            </button>
          </>
        )}
      </div>
    </Layout>
  )
}