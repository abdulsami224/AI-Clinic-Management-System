import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import {
  createPatient, getAllPatients, getPatientById,
  updatePatient, getPatientHistory
} from '../controllers/patientController.js'

const router = express.Router()

router.post('/', authMiddleware, authorizeRoles('admin', 'receptionist'), createPatient)
router.get('/', authMiddleware, authorizeRoles('admin', 'doctor', 'receptionist'), getAllPatients)
router.get('/:id', authMiddleware, getPatientById)
router.put('/:id', authMiddleware, authorizeRoles('admin', 'receptionist'), updatePatient)
router.get('/:id/history', authMiddleware, getPatientHistory)

export default router