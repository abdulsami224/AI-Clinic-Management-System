import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'doctor', 'receptionist', 'patient'], 
    default: 'patient' 
  },
  subscriptionPlan: { type: String, enum: ['free', 'pro'], default: 'free' },
  specialization: { type: String },
  phone: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// ✅ No next() used at all — returns a promise instead
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.model('User', userSchema)