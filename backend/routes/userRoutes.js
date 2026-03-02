import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import {
  getAllDoctors, getAllUsers, createDoctor,
  createReceptionist, toggleUserStatus, updateUserPlan
} from '../controllers/userController.js'

const router = express.Router()

router.get('/doctors', authMiddleware, getAllDoctors)
router.get('/all', authMiddleware, authorizeRoles('admin'), getAllUsers)
router.post('/create-doctor', authMiddleware, authorizeRoles('admin'), createDoctor)
router.post('/create-receptionist', authMiddleware, authorizeRoles('admin'), createReceptionist)
router.patch('/:id/toggle', authMiddleware, authorizeRoles('admin'), toggleUserStatus)
router.patch('/:id/plan', authMiddleware, authorizeRoles('admin'), updateUserPlan)

export default router