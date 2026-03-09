import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import axios from '../api/axios'
import React from 'react'

export default function Register() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.includes('@')) newErrors.email = 'Enter a valid email'
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
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
        navigate('/patient/dashboard')
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creating...</> : 'Create Account'}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-800"></div>
          <span className="text-gray-600 text-xs">or continue with</span>
          <div className="flex-1 h-px bg-gray-800"></div>
        </div>

        {/* Google Button */}
        <a
          href="http://localhost:5000/api/auth/google"
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 text-white rounded-xl font-medium text-sm transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </a>

        <p className="text-center mt-5 text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-violet-400 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  )
}