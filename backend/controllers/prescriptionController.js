import Prescription from '../models/Prescription.js'

export const createPrescription = async (req, res) => {
  const prescription = await Prescription.create({
    ...req.body,
    doctorId: req.user._id
  })
  res.status(201).json(prescription)
}

export const getPatientPrescriptions = async (req, res) => {
  const prescriptions = await Prescription.find({ patientId: req.params.patientId })
    .populate('doctorId', 'name specialization').sort({ createdAt: -1 })
  res.json(prescriptions)
}

export const getPrescriptionById = async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patientId').populate('doctorId', 'name specialization')
  res.json(prescription)
}