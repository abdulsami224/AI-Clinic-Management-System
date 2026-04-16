import Appointment from '../models/Appointment.js'

export const createAppointment = async (req, res) => {
  const appointment = await Appointment.create({
    ...req.body,
    bookedBy: req.user._id
  })
  const populated = await appointment.populate(['patientId', 'doctorId'])
  res.status(201).json(populated)
}

export const getAllAppointments = async (req, res) => {
  const appointments = await Appointment.find()
    .populate('patientId', 'name age')
    .populate('doctorId', 'name specialization')
    .sort({ date: -1 })
  res.json(appointments)
}

export const getDoctorAppointments = async (req, res) => {
  const appointments = await Appointment.find({ doctorId: req.user._id })
    .populate('patientId', 'name age gender contact')
    .sort({ date: 1 })
  res.json(appointments)
}

export const updateAppointmentStatus = async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id, { status: req.body.status }, { new: true }
  )
  res.json(appointment)
}