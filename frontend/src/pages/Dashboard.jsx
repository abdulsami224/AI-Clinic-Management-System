import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import React from 'react'


export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}! 👋</h1>
        <p className="text-gray-500 mb-6">{user?.email}</p>
        <button onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </div>
  )
}