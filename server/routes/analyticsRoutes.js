import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import { getAdminAnalytics, getDoctorAnalytics } from '../controllers/analyticsController.js'

const router = express.Router()

router.get('/admin', authMiddleware, authorizeRoles('admin'), getAdminAnalytics)
router.get('/doctor', authMiddleware, authorizeRoles('doctor'), getDoctorAnalytics)

export default router