import express from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import Donor from '../models/Donor.js'

const router = express.Router()

// JWT Secret - Secure configuration with env vars
const JWT_SECRET = process.env.JWT_SECRET || 'lifelink_secret_key_2025_production_ready'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation errors',
      errors: errors.array()
    })
  }
  next()
}

// POST /api/auth/login - Donor login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body

    // Find donor and include password field
    const donor = await Donor.findOne({ email }).select('+password')
    
    if (!donor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check password
    const isPasswordValid = await donor.comparePassword(password)
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Update last active
    donor.lastActive = new Date()
    await donor.save({ validateBeforeSave: false })

    // Generate JWT token
    const token = jwt.sign(
      { 
        donorId: donor._id, 
        email: donor.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Remove sensitive data
    const donorResponse = donor.toObject()
    delete donorResponse.password
    delete donorResponse.verificationToken

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        donor: donorResponse,
        token
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    })
  }
})

// POST /api/auth/verify-token - Verify JWT token
router.post('/verify-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    
    const donor = await Donor.findById(decoded.donorId)
      .select('-password -verificationToken')
    
    if (!donor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }

    res.json({
      success: true,
      data: { donor }
    })

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    })
  }
})

export default router
