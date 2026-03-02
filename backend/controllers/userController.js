import User from '../models/User.js'
import bcrypt from 'bcryptjs'

export const getAllDoctors = async (req, res) => {
  const doctors = await User.find({ role: 'doctor', isActive: true }).select('-password')
  res.json(doctors)
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
  const { name, email, password, phone } = req.body
  const exists = await User.findOne({ email })
  if (exists) return res.status(400).json({ message: 'Email already exists' })
  const user = await User.create({ name, email, password, role: 'receptionist', phone })
  res.status(201).json({ message: 'Receptionist created', user })
}

export const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  user.isActive = !user.isActive
  await user.save()
  res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}` })
}

export const updateUserPlan = async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  user.subscriptionPlan = req.body.subscriptionPlan
  await user.save()
  res.json({ message: `Plan updated to ${user.subscriptionPlan}` })
}