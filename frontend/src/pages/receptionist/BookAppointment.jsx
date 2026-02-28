import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import axios from '../../api/axios'
import React from 'react'


const TIME_SLOTS = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM']

export default function BookAppointment() {
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState({ patientId: '', doctorId: '', date: '', timeSlot: '', reason: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    Promise.all([axios.get('/patients'), axios.get('/users/doctors')])
      .then(([pRes, dRes]) => {
        setPatients(pRes.data)
        setDoctors(dRes.data)
      }).catch(() => {})
  }, [])

  const validate = () => {
    const e = {}
    if (!form.patientId) e.patientId = 'Select a patient'
    if (!form.doctorId) e.doctorId = 'Select a doctor'
    if (!form.date) e.date = 'Date is required'
    if (!form.timeSlot) e.timeSlot = 'Select a time slot'
    return e
  }

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors)
    setErrors({})
    setSubmitting(true)
    try {
      await axios.post('/appointments', form)
      setSuccess(true)
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Failed to book appointment' })
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <Layout title="Book Appointment" subtitle="Schedule patient appointments">
        <div className="max-w-lg mx-auto bg-gray-900/60 border border-gray-800/60 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-white font-bold text-xl mb-2">Appointment Booked!</h3>
          <p className="text-gray-400 text-sm mb-6">The appointment has been scheduled successfully.</p>
          <button
            onClick={() => { setSuccess(false); setForm({ patientId: '', doctorId: '', date: '', timeSlot: '', reason: '' }) }}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition"
          >
            Book Another
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Book Appointment" subtitle="Schedule a new patient appointment">
      <div className="max-w-2xl">
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6 space-y-5">
          <h3 className="text-white font-semibold border-b border-gray-800 pb-4">Appointment Details</h3>

          {errors.server && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">⚠ {errors.server}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Patient */}
            <div className="sm:col-span-2">
              <label className="block text-gray-400 text-sm mb-1.5">Patient <span className="text-red-400">*</span></label>
              <select value={form.patientId} onChange={e => handleChange('patientId', e.target.value)}
                className={`w-full bg-gray-800/60 border rounded-xl px-4 py-2.5 text-white text-sm outline-none transition ${errors.patientId ? 'border-red-500/50' : 'border-gray-700 focus:border-cyan-500'}`}>
                <option value="">Select patient...</option>
                {patients.map(p => <option key={p._id} value={p._id}>{p.name} — {p.contact}</option>)}
              </select>
              <div className="min-h-[18px] mt-1">{errors.patientId && <p className="text-red-400 text-xs">⚠ {errors.patientId}</p>}</div>
            </div>

            {/* Doctor */}
            <div className="sm:col-span-2">
              <label className="block text-gray-400 text-sm mb-1.5">Doctor <span className="text-red-400">*</span></label>
              <select value={form.doctorId} onChange={e => handleChange('doctorId', e.target.value)}
                className={`w-full bg-gray-800/60 border rounded-xl px-4 py-2.5 text-white text-sm outline-none transition ${errors.doctorId ? 'border-red-500/50' : 'border-gray-700 focus:border-cyan-500'}`}>
                <option value="">Select doctor...</option>
                {doctors.map(d => <option key={d._id} value={d._id}>Dr. {d.name} — {d.specialization || 'General'}</option>)}
              </select>
              <div className="min-h-[18px] mt-1">{errors.doctorId && <p className="text-red-400 text-xs">⚠ {errors.doctorId}</p>}</div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full bg-gray-800/60 border rounded-xl px-4 py-2.5 text-white text-sm outline-none transition ${errors.date ? 'border-red-500/50' : 'border-gray-700 focus:border-cyan-500'}`} />
              <div className="min-h-[18px] mt-1">{errors.date && <p className="text-red-400 text-xs">⚠ {errors.date}</p>}</div>
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Time Slot <span className="text-red-400">*</span></label>
              <select value={form.timeSlot} onChange={e => handleChange('timeSlot', e.target.value)}
                className={`w-full bg-gray-800/60 border rounded-xl px-4 py-2.5 text-white text-sm outline-none transition ${errors.timeSlot ? 'border-red-500/50' : 'border-gray-700 focus:border-cyan-500'}`}>
                <option value="">Select slot...</option>
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="min-h-[18px] mt-1">{errors.timeSlot && <p className="text-red-400 text-xs">⚠ {errors.timeSlot}</p>}</div>
            </div>

            {/* Reason */}
            <div className="sm:col-span-2">
              <label className="block text-gray-400 text-sm mb-1.5">Reason for Visit</label>
              <textarea rows={2} placeholder="e.g. Fever, routine checkup..."
                value={form.reason} onChange={e => handleChange('reason', e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition resize-none" />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition">
            {submitting ? 'Booking...' : '📅 Book Appointment'}
          </button>
        </div>
      </div>
    </Layout>
  )
}