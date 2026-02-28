import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageDoctors from './pages/admin/ManageDoctors'
import ManageReceptionists from './pages/admin/ManageReceptionists'

import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/Appointments'
import AddPrescription from './pages/doctor/AddPrescription'
import AISymptomChecker from './pages/doctor/AISymptomChecker'

import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard'
import AddPatient from './pages/receptionist/AddPatient'
import BookAppointment from './pages/receptionist/BookAppointment'

import PatientDashboard from './pages/patient/PatientDashboard'
import MyPrescriptions from './pages/patient/MyPrescriptions'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute role="admin"><ManageDoctors /></ProtectedRoute>} />
          <Route path="/admin/receptionists" element={<ProtectedRoute role="admin"><ManageReceptionists /></ProtectedRoute>} />

          {/* Doctor */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/prescription/:patientId" element={<ProtectedRoute role="doctor"><AddPrescription /></ProtectedRoute>} />
          <Route path="/doctor/ai-checker" element={<ProtectedRoute role="doctor"><AISymptomChecker /></ProtectedRoute>} />

          {/* Receptionist */}
          <Route path="/receptionist/dashboard" element={<ProtectedRoute role="receptionist"><ReceptionistDashboard /></ProtectedRoute>} />
          <Route path="/receptionist/add-patient" element={<ProtectedRoute role="receptionist"><AddPatient /></ProtectedRoute>} />
          <Route path="/receptionist/book-appointment" element={<ProtectedRoute role="receptionist"><BookAppointment /></ProtectedRoute>} />

          {/* Patient */}
          <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={<ProtectedRoute role="patient"><MyPrescriptions /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App