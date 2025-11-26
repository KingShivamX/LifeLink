import express from 'express'
import { body, validationResult } from 'express-validator'
import BloodRequest from '../models/BloodRequest.js'
import Donor from '../models/Donor.js'
import { io } from '../server.js'

const router = express.Router()

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

// POST /api/emergency/request - Create emergency blood request
router.post('/request', [
  body('patient.firstName').trim().isLength({ min: 1 }),
  body('patient.lastName').trim().isLength({ min: 1 }),
  body('patient.bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('patient.age').isInt({ min: 0, max: 120 }),
  body('bloodRequirement.unitsNeeded').isInt({ min: 1, max: 10 }),
  body('location.coordinates').isArray({ min: 2, max: 2 }),
  body('medicalInfo.hospital.name').trim().isLength({ min: 1 }),
  body('medicalInfo.diagnosis').trim().isLength({ min: 1 })
], handleValidationErrors, async (req, res) => {
  try {
    // Create emergency request with high priority
    const emergencyData = {
      ...req.body,
      requestType: 'emergency',
      urgencyLevel: 'critical',
      expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hours
    }
    
    const emergencyRequest = new BloodRequest(emergencyData)
    await emergencyRequest.save()
    
    // Find nearby compatible donors urgently
    const compatibleDonors = await Donor.find({
      bloodType: { $in: emergencyRequest.bloodRequirement.compatibleTypes },
      'availability.isAvailable': true,
      isEligible: true,
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: emergencyData.location.coordinates
          },
          $maxDistance: 50000 // 50km for emergencies
        }
      }
    }).select('firstName lastName phone bloodType address')
    
    // Broadcast emergency to all nearby donors
    io.emit('emergency-alert', {
      requestId: emergencyRequest._id,
      patient: {
        bloodType: emergencyData.patient.bloodType,
        age: emergencyData.patient.age
      },
      hospital: emergencyData.medicalInfo.hospital.name,
      unitsNeeded: emergencyData.bloodRequirement.unitsNeeded,
      location: emergencyData.location,
      compatibleDonors: compatibleDonors.length
    })
    
    res.status(201).json({
      success: true,
      message: 'Emergency request created and broadcasted',
      data: {
        request: emergencyRequest,
        compatibleDonorsFound: compatibleDonors.length,
        estimatedResponseTime: '15-30 minutes'
      }
    })
    
  } catch (error) {
    console.error('Emergency request error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create emergency request',
      error: error.message
    })
  }
})

// GET /api/emergency/active - Get active emergency requests
router.get('/active', async (req, res) => {
  try {
    const activeEmergencies = await BloodRequest.find({
      requestType: 'emergency',
      status: { $in: ['pending', 'matched'] },
      expiresAt: { $gt: new Date() }
    })
    .populate('matchedDonors.donor', 'firstName lastName bloodType phone')
    .sort({ createdAt: -1 })
    
    res.json({
      success: true,
      data: { emergencies: activeEmergencies }
    })
    
  } catch (error) {
    console.error('Error fetching emergencies:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching active emergencies',
      error: error.message
    })
  }
})

export default router
