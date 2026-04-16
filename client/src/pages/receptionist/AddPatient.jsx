import { useState } from 'react'
import Layout from '../../components/Layout'
import axios from '../../api/axios'
import React from 'react'


export default function AddPatient() {
  const [form, setForm] = useState({
    name: '', age: '', gender: '', contact: '',
    email: '', bloodGroup: '', address: '', medicalHistory: ''
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.age || form.age < 0 || form.age > 120) e.age = 'Valid age required'
    if (!form.gender) e.gender = 'Gender is required'
    if (!form.contact.trim()) e.contact = 'Contact is required'
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
      await axios.post('/patients', form)
      setSuccess(true)
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Failed to add patient' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setForm({ name: '', age: '', gender: '', contact: '', email: '', bloodGroup: '', address: '', medicalHistory: '' })
    setSuccess(false)
    setErrors({})
  }

  if (success) {
    return (
      <Layout title="Add Patient" subtitle="Register new patients">
        <div className="max-w-lg mx-auto bg-gray-900/60 border border-gray-800/60 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-white font-bold text-xl mb-2">Patient Registered!</h3>
          <p className="text-gray-400 text-sm mb-6">Patient has been added to the system successfully.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleReset} className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition">
              Add Another
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Add Patient" subtitle="Register a new patient in the system">
      <div className="max-w-2xl">
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6 space-y-5">
          <h3 className="text-white font-semibold border-b border-gray-800 pb-4">Patient Information</h3>

          {errors.server && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
              ⚠ {errors.server}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-gray-400 text-sm mb-1.5">Full Name <span className="text-red-400">*</span></label>
              <input placeholder="e.g. Ahmed Khan" value={form.name} onChange={e => handleChange('name', e.target.value)}
                className={`w-full bg-gray-800/60 border rounded-xl px-4 py-2.5 text-white text-sm outline-none transition ${errors.name ? 'border-red-500/50' : 'border-gray-700 focus:border-emerald-500'}`} />
              <div className="min-h-[18px] mt-1">{errors.name && <p className="text-red-400 text-xs">⚠ {errors.name}</p>}</div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Age <span className="text-red-400">*</span></label>
              <input type="number" placeholder="e.g. 35" value={form.age} onChange={e => handleChange('age', e.target.value)}
                className={`w-full bg-gray-800/60 border rounded-xl px-4 py-2.5 text-white text-sm outline-none transition ${errors.age ? 'border-red-500/50' : 'border-gray-700 focus:border-emerald-500'}`} />
              <div className="min-h-[18px] mt-1">{errors.age && <p className="text-red-400 text-xs">⚠ {errors.age}</p>}</div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Gender <span className="text-red-400">*</span></label>
              <select value={form.gender} onChange={e => handleChange('gender', e.target.value)}
                className={`w-full bg-gray-800/60 border rounded-xl px-4 py-2.5 text-white text-sm outline-none transition ${errors.gender ? 'border-red-500/50' : 'border-gray-700 focus:border-emerald-500'}`}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div className="min-h-[18px] mt-1">{errors.gender && <p className="text-red-400 text-xs">⚠ {errors.gender}</p>}</div>
            </div>

            {/* Contact */}
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Contact <span className="text-red-400">*</span></label>
              <input placeholder="+92 300 0000000" value={form.contact} onChange={e => handleChange('contact', e.target.value)}
                className={`w-full bg-gray-800/60 border rounded-xl px-4 py-2.5 text-white text-sm outline-none transition ${errors.contact ? 'border-red-500/50' : 'border-gray-700 focus:border-emerald-500'}`} />
              <div className="min-h-[18px] mt-1">{errors.contact && <p className="text-red-400 text-xs">⚠ {errors.contact}</p>}</div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Email <span className="text-gray-600">(optional)</span></label>
              <input type="email" placeholder="patient@email.com" value={form.email} onChange={e => handleChange('email', e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition" />
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Blood Group</label>
              <select value={form.bloodGroup} onChange={e => handleChange('bloodGroup', e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition">
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-gray-400 text-sm mb-1.5">Address</label>
              <input placeholder="e.g. House 5, Block B, Karachi" value={form.address} onChange={e => handleChange('address', e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition" />
            </div>

            {/* Medical History */}
            <div className="sm:col-span-2">
              <label className="block text-gray-400 text-sm mb-1.5">Medical History</label>
              <textarea rows={3} placeholder="e.g. Diabetic since 2015, hypertensive..." value={form.medicalHistory} onChange={e => handleChange('medicalHistory', e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition resize-none" />
            </div>
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition">
            {submitting ? 'Registering...' : '➕ Register Patient'}
          </button>
        </div>
      </div>
    </Layout>
  )
}