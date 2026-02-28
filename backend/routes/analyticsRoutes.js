import express from 'express'
import protect from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import { getAdminAnalytics, getDoctorAnalytics } from '../controllers/analyticsController.js'

const router = express.Router()

router.get('/admin', protect, authorizeRoles('admin'), getAdminAnalytics)
router.get('/doctor', protect, authorizeRoles('doctor'), getDoctorAnalytics)

export default router