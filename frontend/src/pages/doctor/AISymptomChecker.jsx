import { useState } from 'react'
import Layout from '../../components/Layout'
import axios from '../../api/axios'
import React from 'react'


const riskColors = {
  low: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
  medium: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
  high: 'text-red-400 bg-red-500/20 border-red-500/30',
}

export default function AISymptomChecker() {
  const [form, setForm] = useState({ symptoms: '', age: '', gender: '', history: '', patientId: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field, value) => setForm({ ...form, [field]: value })

  const handleSubmit = async () => {
    if (!form.symptoms.trim() || !form.age || !form.gender) {
      setError('Symptoms, age and gender are required')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await axios.post('/ai/symptom-check', form)
      if (res.data.success) {
        setResult(res.data.data)
      } else {
        setError(res.data.message || 'AI unavailable, please diagnose manually')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setForm({ symptoms: '', age: '', gender: '', history: '', patientId: '' })
    setResult(null)
    setError('')
  }

  return (
    <Layout title="AI Symptom Checker" subtitle="Powered by Gemini AI — enter patient info for analysis">
      <div className="max-w-3xl space-y-6">

        {/* AI Info Banner */}
        <div className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <p className="text-violet-300 font-semibold text-sm">Gemini AI Assistant</p>
            <p className="text-violet-400/70 text-xs mt-0.5">AI provides suggestions only. Final diagnosis is the doctor's responsibility. System works even if AI is unavailable.</p>
          </div>
        </div>

        {/* Input Form */}
        <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-semibold">Patient Information</h3>

          {/* Symptoms */}
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Symptoms <span className="text-red-400">*</span></label>
            <textarea
              rows={3}
              placeholder="e.g. Fever, headache, sore throat for 3 days..."
              value={form.symptoms}
              onChange={e => handleChange('symptoms', e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 focus:border-violet-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition resize-none"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Age <span className="text-red-400">*</span></label>
              <input
                type="number"
                placeholder="e.g. 35"
                value={form.age}
                onChange={e => handleChange('age', e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 focus:border-violet-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1.5">Gender <span className="text-red-400">*</span></label>
              <select
                value={form.gender}
                onChange={e => handleChange('gender', e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 focus:border-violet-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* History */}
          <div>
            <label className="block text-gray-400 text-sm mb-1.5">Medical History <span className="text-gray-600">(optional)</span></label>
            <textarea
              rows={2}
              placeholder="e.g. Diabetic, hypertensive, previous surgeries..."
              value={form.history}
              onChange={e => handleChange('history', e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 focus:border-violet-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition resize-none"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              ⚠ {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing with AI...
                </>
              ) : '🤖 Analyze Symptoms'}
            </button>
            {result && (
              <button onClick={handleReset} className="px-5 py-3 bg-gray-700 text-gray-300 rounded-xl text-sm hover:bg-gray-600 transition">
                Reset
              </button>
            )}
          </div>
        </div>

        {/* AI Result */}
        {result && (
          <div className="bg-gray-900/60 border border-gray-800/60 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold">AI Analysis Result</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${riskColors[result.riskLevel] || riskColors.medium}`}>
                {result.riskLevel} Risk
              </span>
            </div>

            {/* Possible Conditions */}
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Possible Conditions</p>
              <div className="flex flex-wrap gap-2">
                {result.possibleConditions?.map((c, i) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-lg text-sm">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Suggested Tests */}
            {result.suggestedTests?.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm font-medium mb-2">Suggested Tests</p>
                <div className="flex flex-wrap gap-2">
                  {result.suggestedTests.map((t, i) => (
                    <span key={i} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg text-sm">
                      🔬 {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Advice */}
            {result.advice && (
              <div className="bg-gray-800/60 rounded-xl p-4">
                <p className="text-gray-400 text-sm font-medium mb-1">Doctor's Notes from AI</p>
                <p className="text-gray-300 text-sm leading-relaxed">{result.advice}</p>
              </div>
            )}

            <p className="text-gray-600 text-xs">⚠ This is AI-generated information for reference only. Clinical judgment takes precedence.</p>
          </div>
        )}

      </div>
    </Layout>
  )
}