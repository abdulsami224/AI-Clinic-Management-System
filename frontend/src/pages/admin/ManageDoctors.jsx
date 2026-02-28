import { useEffect, useState } from 'react'
import Layout from '../../components/Layout'
import axios from '../../api/axios'
import React from 'react'


export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', specialization: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchDoctors = () => {
    axios.get('/users/doctors')
      .then(res => setDoctors(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchDoctors() }, [])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (form.password.length < 6) e.password = 'Min 6 characters'
    if (!form.specialization.trim()) e.specialization = 'Specialization required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors)
    setErrors({})
    setSubmitting(true)
    try {
      await axios.post('/users/create-doctor', form)
      setSuccessMsg('Doctor created successfully!')
      setForm({ name: '', email: '', password: '', specialization: '', phone: '' })
      setShowForm(false)
      fetchDoctors()
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Failed to create doctor' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: '' })
  }

  const handleToggle = async (id) => {
    await axios.patch(`/users/${id}/toggle`)
    fetchDoctors()
  }

  return (
    <Layout title="Manage Doctors" subtitle="Add and manage your clinic doctors">
      <div className="space-y-6">

        {/* Success */}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm">
            ✅ {successMsg}
          </div>
        )}

        {/* Header Row */}
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">{doctors.length} doctors registered</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition"
          >
            {showForm ? '✕ Cancel' : '+ Add Doctor'}
          </button>
        </div>

        {/* Add Doctor Form */}
        {showForm && (
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-5">New Doctor</h3>
            {errors.server && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                {errors.server}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { field: 'name', label: 'Full Name', placeholder: 'Dr. John Smith' },
                { field: 'email', label: 'Email', placeholder: 'doctor@clinic.com' },
                { field: 'password', label: 'Password', placeholder: 'Min 6 characters', type: 'password' },
                { field: 'specialization', label: 'Specialization', placeholder: 'Cardiologist' },
                { field: 'phone', label: 'Phone', placeholder: '+92 300 0000000' },
              ].map(({ field, label, placeholder, type = 'text' }) => (
                <div key={field}>
                  <label className="block text-gray-400 text-sm mb-1">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={e => handleChange(field, e.target.value)}
                    className={`w-full bg-gray-800/60 border rounded-xl px-4 py-2.5 text-white text-sm outline-none transition
                      ${errors[field] ? 'border-red-500/50 bg-red-500/5' : 'border-gray-700 focus:border-violet-500'}`}
                  />
                  <div className="min-h-[18px] mt-1">
                    {errors[field] && <p className="text-red-400 text-xs">⚠ {errors[field]}</p>}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {submitting ? 'Creating...' : 'Create Doctor'}
            </button>
          </div>
        )}

        {/* Doctors Table */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-16 text-gray-600">
              <p className="text-4xl mb-3">⚕️</p>
              <p>No doctors added yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800/60">
                  <th className="text-left text-gray-500 font-medium px-6 py-4">Doctor</th>
                  <th className="text-left text-gray-500 font-medium px-6 py-4">Specialization</th>
                  <th className="text-left text-gray-500 font-medium px-6 py-4">Phone</th>
                  <th className="text-left text-gray-500 font-medium px-6 py-4">Status</th>
                  <th className="text-left text-gray-500 font-medium px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc, i) => (
                  <tr key={doc._id} className={`border-b border-gray-800/40 hover:bg-gray-800/30 transition ${i % 2 === 0 ? '' : 'bg-gray-900/30'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {doc.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{doc.name}</p>
                          <p className="text-gray-500 text-xs">{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{doc.specialization || '—'}</td>
                    <td className="px-6 py-4 text-gray-300">{doc.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${doc.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {doc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggle(doc._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${doc.isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                      >
                        {doc.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  )
}