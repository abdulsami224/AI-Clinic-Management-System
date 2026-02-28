import express from 'express'
import protect from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import { symptomChecker, prescriptionExplanation } from '../controllers/aiController.js'

const router = express.Router()

router.post('/symptom-check', protect, authorizeRoles('doctor'), symptomChecker)
router.post('/explain-prescription', protect, prescriptionExplanation)

export default router