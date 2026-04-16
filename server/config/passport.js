import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this google id
    let user = await User.findOne({ googleId: profile.id })

    if (user) {
      // ✅ Block deactivated google users too
      if (!user.isActive) {
        return done(null, false, { message: 'Account deactivated' })
      }
      return done(null, user)
    }


    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value })

    if (user) {
      // ✅ Block deactivated accounts found by email
      if (!user.isActive) {
        return done(null, false, { message: 'Account deactivated' })
      }
      user.googleId = profile.id
      await user.save()
      return done(null, user)
    }

    // Create brand new user
    user = await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      googleId: profile.id,
      password: Math.random().toString(36).slice(-10) + 'Aa1!', // random password
      role: 'patient', // google signup always patient
      avatar: profile.photos[0]?.value || '',
    })

    done(null, user)
  } catch (error) {
    done(error, null)
  }
}))

passport.serializeUser((user, done) => done(null, user._id))
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id)
  done(null, user)
})

export default passport