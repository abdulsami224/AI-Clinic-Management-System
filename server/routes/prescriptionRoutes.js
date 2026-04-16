import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import { createPrescription, getPatientPrescriptions, getPrescriptionById } from '../controllers/prescriptionController.js'

const router = express.Router()

router.post('/', authMiddleware, authorizeRoles('doctor'), createPrescription)
router.get('/patient/:patientId', authMiddleware, getPatientPrescriptions)
router.get('/:id', authMiddleware, getPrescriptionById)

export default router