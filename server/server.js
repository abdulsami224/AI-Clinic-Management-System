import './config/env.js' 

// ✅ Now everything else can import
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import passport from 'passport'
import connectDB from './config/db.js'
import './config/passport.js'

import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import patientRoutes from './routes/patientRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import prescriptionRoutes from './routes/prescriptionRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'

connectDB()

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/patients', patientRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/prescriptions', prescriptionRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/analytics', analyticsRoutes)

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
)