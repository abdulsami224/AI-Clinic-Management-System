import User from '../models/User.js'
import Patient from '../models/Patient.js'
import Appointment from '../models/Appointment.js'
import Prescription from '../models/Prescription.js'

export const getAdminAnalytics = async (req, res) => {
  const totalPatients = await Patient.countDocuments()
  const totalDoctors = await User.countDocuments({ role: 'doctor' })
  const totalAppointments = await Appointment.countDocuments()
  const pendingAppointments = await Appointment.countDocuments({ status: 'pending' })
  const completedAppointments = await Appointment.countDocuments({ status: 'completed' })

  // Monthly appointments (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const monthlyData = await Appointment.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: {
      _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
      count: { $sum: 1 }
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ])

  res.json({
    totalPatients, totalDoctors, totalAppointments,
    pendingAppointments, completedAppointments, monthlyData
  })
}

export const getDoctorAnalytics = async (req, res) => {
  const doctorId = req.user._id
  const totalAppointments = await Appointment.countDocuments({ doctorId })
  const completedAppointments = await Appointment.countDocuments({ doctorId, status: 'completed' })
  const totalPrescriptions = await Prescription.countDocuments({ doctorId })
  const todayStart = new Date(); todayStart.setHours(0,0,0,0)
  const todayEnd = new Date(); todayEnd.setHours(23,59,59,999)
  const todayAppointments = await Appointment.countDocuments({
    doctorId, date: { $gte: todayStart, $lte: todayEnd }
  })

  res.json({ totalAppointments, completedAppointments, totalPrescriptions, todayAppointments })
}