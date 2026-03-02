import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import axios from '../api/axios'
import React from 'react'

export default function Register() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.includes('@')) newErrors.email = 'Enter a valid email'
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!form.role) newErrors.role = 'Please select a role'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) return setErrors(validationErrors)
    setErrors({})
    setLoading(true)
    
    try {
        const res = await axios.post('/auth/register', form)
        const userData = res.data
        setUser(userData)
        const ROLE_ROUTES = {
            admin: '/admin/dashboard',
            doctor: '/doctor/dashboard',
            receptionist: '/receptionist/dashboard',
            patient: '/patient/dashboard',
        }

        navigate(ROLE_ROUTES[userData.role] || '/patient/dashboard')
    }   catch (err) {
            setServerError(err.response?.data?.message || 'Registration failed')
    }   finally {
            setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: '' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">✚</div>
          <div>
            <p className="text-white font-bold">MediSaaS</p>
            <p className="text-gray-500 text-xs">Clinic Management</p>
          </div>
        </div>

        <h2 className="text-white text-2xl font-bold mb-1">Create Account</h2>
        <p className="text-gray-500 text-sm mb-6">Create your clinic account</p>

        {serverError && (
          <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
            {serverError}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1.5">Full Name <span className="text-red-400">*</span></label>
          <input
            placeholder="Full name"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-sm outline-none transition
              ${errors.name ? 'border-red-500/50 bg-red-500/5' : 'border-gray-700 focus:border-violet-500'}`}
          />
          <div className="min-h-[20px] mt-1">
            {errors.name && <p className="text-red-400 text-xs">⚠ {errors.name}</p>}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-1.5">Email <span className="text-red-400">*</span></label>
          <input
            placeholder="example@email.com"
            value={form.email}
            onChange={e => handleChange('email', e.target.value)}
            className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-sm outline-none transition
              ${errors.email ? 'border-red-500/50 bg-red-500/5' : 'border-gray-700 focus:border-violet-500'}`}
          />
          <div className="min-h-[20px] mt-1">
            {errors.email && <p className="text-red-400 text-xs">⚠ {errors.email}</p>}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-1.5">Password <span className="text-red-400">*</span></label>
          <input
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={e => handleChange('password', e.target.value)}
            className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-sm outline-none transition
              ${errors.password ? 'border-red-500/50 bg-red-500/5' : 'border-gray-700 focus:border-violet-500'}`}
          />
          <div className="min-h-[20px] mt-1">
            {errors.password && <p className="text-red-400 text-xs">⚠ {errors.password}</p>}
          </div>
        </div>

        <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-1.5">Role <span className="text-red-400">*</span></label>
                <select
                    value={form.role}
                    onChange={e => handleChange('role', e.target.value)}
                    className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-sm outline-none transition
                    ${errors.role ? 'border-red-500/50 bg-red-500/5' : 'border-gray-700 focus:border-violet-500'}`}
                >
                    <option value="">Select your role...</option>
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Admin</option>
                </select>
            <div className="min-h-[20px] mt-1">
                {errors.role && <p className="text-red-400 text-xs">⚠ {errors.role}</p>}
            </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creating...</> : 'Create Account'}
        </button>

        <p className="text-center mt-5 text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-violet-400 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  )
}