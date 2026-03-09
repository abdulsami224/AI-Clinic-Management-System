import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import GoogleSuccess from './pages/auth/GoogleSuccess'

import AdminDashboard from './pages/admin/AdminDashboard'
import ManageDoctors from './pages/admin/ManageDoctors'
import ManageReceptionists from './pages/admin/ManageReceptionists'
import AllPatients from './pages/admin/AllPatients'
import Analytics from './pages/admin/Analytics'

import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/Appointments'
import AddPrescription from './pages/doctor/AddPrescription'
import AISymptomChecker from './pages/doctor/AISymptomChecker'
import DoctorPatients from './pages/doctor/DoctorPatients'

import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard'
import AddPatient from './pages/receptionist/AddPatient'
import BookAppointment from './pages/receptionist/BookAppointment'
import ReceptionistPatients from './pages/receptionist/ReceptionistPatients'

import PatientDashboard from './pages/patient/PatientDashboard'
import MyPrescriptions from './pages/patient/MyPrescriptions'
import MyAppointments from './pages/patient/MyAppointments'
import MedicalHistory from './pages/patient/MedicalHistory'


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute role="admin"><ManageDoctors /></ProtectedRoute>} />
          <Route path="/admin/receptionists" element={<ProtectedRoute role="admin"><ManageReceptionists /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute role="admin"><AllPatients /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>} />
          
          {/* Doctor */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/prescription/:patientId" element={<ProtectedRoute role="doctor"><AddPrescription /></ProtectedRoute>} />
          <Route path="/doctor/ai-checker" element={<ProtectedRoute role="doctor"><AISymptomChecker /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute role="doctor"><DoctorPatients /></ProtectedRoute>} />
          
          {/* Receptionist */}
          <Route path="/receptionist/dashboard" element={<ProtectedRoute role="receptionist"><ReceptionistDashboard /></ProtectedRoute>} />
          <Route path="/receptionist/add-patient" element={<ProtectedRoute role="receptionist"><AddPatient /></ProtectedRoute>} />
          <Route path="/receptionist/book-appointment" element={<ProtectedRoute role="receptionist"><BookAppointment /></ProtectedRoute>} />
          <Route path="/receptionist/patients" element={<ProtectedRoute role="receptionist"><ReceptionistPatients /></ProtectedRoute>} />

          {/* Patient */}
          <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={<ProtectedRoute role="patient"><MyPrescriptions /></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute role="patient"><MyAppointments /></ProtectedRoute>} />
          <Route path="/patient/history" element={<ProtectedRoute role="patient"><MedicalHistory /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App