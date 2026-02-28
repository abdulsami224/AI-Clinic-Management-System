import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import { validationResult } from 'express-validator'

// Register 
export const register = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }

  const { name, email, password } = req.body
  const userExists = await User.findOne({ email })
  if (userExists) return res.status(400).json({ message: 'User already exists' })

  const user = await User.create({ name, email, password })
  generateToken(res, user._id)
  res.status(201).json({ 
    _id: user._id, 
    name: user.name, 
    email: user.email, 
    role: user.role,             // ✅ add this
    subscriptionPlan: user.subscriptionPlan  // ✅ add this too
  })
}
// Login
export const login = async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }

  const { email, password } = req.body
  const user = await User.findOne({ email })

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id)
    res.json({ 
      _id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role,           // ✅ add this
      subscriptionPlan: user.subscriptionPlan  // ✅ add this too
    })
  } else {
    res.status(401).json({ message: 'Invalid email or password' })
  }
}

// Logout
export const logout = (req, res) => {
    res.clearCookie('jwt', '', { maxAge: 0 })
    res.json({ message: "Logged out successfully" })
}

// Get user profile
export const getProfile = async (req, res) => {
    const user = await User.findById(req.user._id).select('-password')
    res.json(user)
}