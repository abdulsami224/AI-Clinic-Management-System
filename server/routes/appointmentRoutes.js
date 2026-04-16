import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import {
  createAppointment, getAllAppointments,
  getDoctorAppointments, updateAppointmentStatus
} from '../controllers/appointmentController.js'

const router = express.Router()

router.post('/', authMiddleware, authorizeRoles('admin', 'receptionist', 'patient'), createAppointment)
router.get('/', authMiddleware, authorizeRoles('admin'), getAllAppointments)
router.get('/doctor', authMiddleware, authorizeRoles('doctor'), getDoctorAppointments)
router.patch('/:id/status', authMiddleware, updateAppointmentStatus)

export default router