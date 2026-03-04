import Patient from '../models/Patient.js'
import Appointment from '../models/Appointment.js'
import Prescription from '../models/Prescription.js'

export const createPatient = async (req, res) => {
  const patient = await Patient.create({ ...req.body, createdBy: req.user._id })
  res.status(201).json(patient)
}

export const getAllPatients = async (req, res) => {
  const patients = await Patient.find().sort({ createdAt: -1 })
  res.json(patients)
}

export const getPatientById = async (req, res) => {
  const patient = await Patient.findById(req.params.id)
  if (!patient) return res.status(404).json({ message: 'Patient not found' })
  res.json(patient)
}

export const updatePatient = async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true })
  res.json(patient)
}

export const getPatientHistory = async (req, res) => {
  const { id } = req.params
  const appointments = await Appointment.find({ patientId: id })
    .populate('doctorId', 'name specialization').sort({ createdAt: -1 })
  const prescriptions = await Prescription.find({ patientId: id })
    .populate('doctorId', 'name').sort({ createdAt: -1 })
  res.json({ appointments, prescriptions })
}

export const getPatientMe = async (req, res) => {
  try {
    const patient = await Patient.findOne({ email: req.user.email })
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' })
    res.json(patient)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}