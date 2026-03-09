import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ROLE_ROUTES = {
  admin: '/admin/dashboard',
  doctor: '/doctor/dashboard',
  receptionist: '/receptionist/dashboard',
  patient: '/patient/dashboard',
}

export default function GoogleSuccess() {
  const [searchParams] = useSearchParams()
  const { setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const userParam = searchParams.get('user')
    const error = searchParams.get('error')

    if (error || !userParam) {
      navigate('/login?error=google_failed')
      return
    }

    try {
      const userData = JSON.parse(decodeURIComponent(userParam))
      setUser(userData)
      navigate(ROLE_ROUTES[userData.role] || '/patient/dashboard')
    } catch {
      navigate('/login')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 text-sm">Signing you in with Google...</p>
      </div>
    </div>
  )
}