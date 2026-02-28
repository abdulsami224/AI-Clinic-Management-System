import Sidebar from './Sidebar'
import React from 'react'


export default function Layout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/60 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              {title && <h1 className="text-white font-bold text-xl tracking-tight">{title}</h1>}
              {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-gray-500 text-xs">System Online</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}