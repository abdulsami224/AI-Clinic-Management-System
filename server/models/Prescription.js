import mongoose from 'mongoose'

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
})

const prescriptionSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  medicines: [medicineSchema],
  instructions: { type: String },
  diagnosis: { type: String },
  aiExplanation: { type: String }, // AI generated
  followUpDate: { type: Date },
}, { timestamps: true })

export default mongoose.model('Prescription', prescriptionSchema)