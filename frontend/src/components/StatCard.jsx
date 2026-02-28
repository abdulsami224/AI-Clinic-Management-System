import React from 'react'


export default function StatCard({ title, value, icon, color = 'blue', subtitle }) {
  const colors = {
    blue: 'from-blue-600 to-cyan-500',
    violet: 'from-violet-600 to-indigo-500',
    emerald: 'from-emerald-600 to-teal-500',
    rose: 'from-rose-600 to-pink-500',
    amber: 'from-amber-500 to-orange-500',
    cyan: 'from-cyan-500 to-blue-500',
  }
  const bgColors = {
    blue: 'bg-blue-500/10 border-blue-500/20',
    violet: 'bg-violet-500/10 border-violet-500/20',
    emerald: 'bg-emerald-500/10 border-emerald-500/20',
    rose: 'bg-rose-500/10 border-rose-500/20',
    amber: 'bg-amber-500/10 border-amber-500/20',
    cyan: 'bg-cyan-500/10 border-cyan-500/20',
  }

  return (
    <div className={`rounded-2xl border p-5 ${bgColors[color]} bg-gray-900/50 backdrop-blur`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  )
}