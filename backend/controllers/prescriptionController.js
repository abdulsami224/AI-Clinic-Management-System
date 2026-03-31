import Prescription from '../models/Prescription.js'

export const createPrescription = async (req, res) => {
  const prescription = await Prescription.create({
    ...req.body,
    doctorId: req.user._id
  })
  res.status(201).json(prescription)
}

export const getPatientPrescriptions = async (req, res) => {
  try {
    // ✅ First find the Patient document linked to this user email
    const patient = await Patient.findOne({ email: req.user.email })

    if (!patient) {
      return res.json([]) // no patient profile yet
    }

    // ✅ Now fetch prescriptions using the Patient _id
    const prescriptions = await Prescription.find({ patientId: patient._id })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 })

    res.json(prescriptions)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPrescriptionById = async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patientId').populate('doctorId', 'name specialization')
  res.json(prescription)
}