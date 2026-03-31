import express from 'express'
import { body } from 'express-validator'
import { register, login, logout, getProfile } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'
import passport from 'passport'
import '../config/passport.js'
import generateToken from '../utils/generateToken.js'

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

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=deactivated`,
    session: false
  }),
  async (req, res) => {
    try {
      console.log('Google user:', req.user) // ✅ add this

      const userData = {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        subscriptionPlan: req.user.subscriptionPlan,
        avatar: req.user.avatar || '',
      }

      generateToken(res, req.user._id)

      const encoded = encodeURIComponent(JSON.stringify(userData))
      res.redirect(`${process.env.CLIENT_URL}/auth/google/success?user=${encoded}`)

    } catch (error) {
      console.log('Google callback error:', error.message) // ✅ add this
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`)
    }
  }
)

export default router