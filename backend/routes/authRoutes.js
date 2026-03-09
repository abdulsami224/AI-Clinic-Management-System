import express from 'express'
import { body } from 'express-validator'
import { register, login, logout, getProfile } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import passport from 'passport'
import '../config/passport.js'

const router = express.Router()

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], register)

router.post('/login', [
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
], login)

router.post('/logout', logout)

// Google OAuth — redirects to Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

// Google callback — after Google redirects back
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
    session: false
  }),
  async (req, res) => {
    try {
      // Generate JWT cookie same as normal login
      generateToken(res, req.user._id)

      // Send user data to frontend via URL params
      const userData = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        subscriptionPlan: req.user.subscriptionPlan,
        avatar: req.user.avatar || '',
      }

      // Redirect to frontend with user data
      const encoded = encodeURIComponent(JSON.stringify(userData))
      res.redirect(`${process.env.CLIENT_URL}/auth/google/success?user=${encoded}`)

    } catch (error) {
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`)
    }
  }
)

export default router