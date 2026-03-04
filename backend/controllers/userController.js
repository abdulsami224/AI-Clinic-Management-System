import User from '../models/User.js'
import bcrypt from 'bcryptjs'

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password')
    res.json(doctors)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password')
  res.json(users)
}

export const createDoctor = async (req, res) => {
  const { name, email, password, specialization, phone, subscriptionPlan } = req.body
  const exists = await User.findOne({ email })
  if (exists) return res.status(400).json({ message: 'Email already exists' })
  const user = await User.create({ 
    name, email, password, 
    role: 'doctor', 
    specialization, phone, 
    subscriptionPlan: subscriptionPlan || 'free' })
  res.status(201).json({ message: 'Doctor created', user })
}

export const createReceptionist = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already exists' })
    const user = await User.create({ 
      name, email, password, 
      role: 'receptionist', 
      phone
      // ✅ no subscriptionPlan needed
    })
    res.status(201).json({ message: 'Receptionist created', user })
  } catch (error) {
    console.error('Create receptionist error:', error.message)
    res.status(500).json({ message: error.message })
  }
}

export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // ✅ updateOne bypasses pre-save hook completely
    await User.updateOne(
      { _id: req.params.id },
      { $set: { isActive: !user.isActive } }
    )

    res.json({ message: 'Status updated successfully' })
  } catch (error) {
    console.error('Toggle error:', error.message)
    res.status(500).json({ message: error.message })
  }
}

export const updateUserPlan = async (req, res) => {
  try {
    // ✅ updateOne bypasses pre-save hook completely
    await User.updateOne(
      { _id: req.params.id },
      { $set: { subscriptionPlan: req.body.subscriptionPlan } }
    )

    res.json({ message: 'Plan updated successfully' })
  } catch (error) {
    console.error('Plan update error:', error.message)
    res.status(500).json({ message: error.message })
  }
}