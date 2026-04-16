import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import { authorizeRoles } from '../middleware/roleMiddleware.js'
import { symptomChecker, prescriptionExplanation } from '../controllers/aiController.js'

const router = express.Router()

router.post('/symptom-check', authMiddleware, authorizeRoles('doctor'), symptomChecker)
router.post('/explain-prescription', authMiddleware, prescriptionExplanation)

export default router