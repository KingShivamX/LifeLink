import express from 'express'
import { body, validationResult, query } from 'express-validator'
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

// GET /api/requests - Get all blood requests (READ)
router.get('/', [
  query('status').optional().isIn(['pending', 'matched', 'fulfilled', 'expired', 'cancelled']),
  query('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  query('urgency').optional().isIn(['low', 'medium', 'high', 'critical']),
  query('requestType').optional().isIn(['emergency', 'planned', 'regular']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], handleValidationErrors, async (req, res) => {
  try {
    const { status, bloodType, urgency, requestType, page = 1, limit = 20 } = req.query
    
    let query = { expiresAt: { $gt: new Date() } }
    
    if (status) query.status = status
    if (bloodType) query['patient.bloodType'] = bloodType
    if (urgency) query.urgencyLevel = urgency
    if (requestType) query.requestType = requestType
    
    const skip = (page - 1) * limit
    
    const requests = await BloodRequest.find(query)
      .populate('matchedDonors.donor', 'firstName lastName bloodType phone')
      .sort({ priorityScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
    
    const total = await BloodRequest.countDocuments(query)
    
    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRequests: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      },
      message: `Found ${requests.length} blood requests`
    })
    
  } catch (error) {
    console.error('Error fetching requests:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message
    })
  }
})

// POST /api/requests - Create new blood request (CREATE)
router.post('/', [
  body('requestType').isIn(['emergency', 'planned', 'regular']),
  body('urgencyLevel').isIn(['low', 'medium', 'high', 'critical']),
  body('patient.firstName').trim().isLength({ min: 1 }),
  body('patient.lastName').trim().isLength({ min: 1 }),
  body('patient.age').isInt({ min: 0, max: 120 }),
  body('patient.gender').isIn(['male', 'female', 'other']),
  body('patient.bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('patient.medicalRecordNumber').trim().isLength({ min: 1 }),
  body('requester.name').trim().isLength({ min: 1 }),
  body('requester.relationship').isIn(['family', 'friend', 'medical_staff', 'self']),
  body('requester.email').isEmail().normalizeEmail(),
  body('requester.phone').matches(/^\+?[\d\s\-\(\)]{10,}$/),
  body('medicalInfo.hospital.name').trim().isLength({ min: 1 }),
  body('medicalInfo.hospital.address').trim().isLength({ min: 1 }),
  body('medicalInfo.hospital.contactNumber').matches(/^\+?[\d\s\-\(\)]{10,}$/),
  body('medicalInfo.doctor.name').trim().isLength({ min: 1 }),
  body('medicalInfo.diagnosis').trim().isLength({ min: 1 }),
  body('medicalInfo.transfusionDate').isISO8601(),
  body('bloodRequirement.unitsNeeded').isInt({ min: 1, max: 10 }),
  body('bloodRequirement.componentType').optional().isIn(['whole_blood', 'red_cells', 'platelets', 'plasma', 'cryoprecipitate']),
  body('location.coordinates').isArray({ min: 2, max: 2 }),
  body('location.coordinates.*').isFloat()
], handleValidationErrors, async (req, res) => {
  try {
    const requestData = req.body
    
    // Validate transfusion date is not in the past
    const transfusionDate = new Date(requestData.medicalInfo.transfusionDate)
    if (transfusionDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Transfusion date cannot be in the past'
      })
    }
    
    const bloodRequest = new BloodRequest(requestData)
    await bloodRequest.save()
    
    // Add initial timeline entry
    await bloodRequest.addTimelineEntry('created', 'Blood request created', requestData.requester.name)
    
    // Find and notify nearby compatible donors
    const compatibleDonors = await Donor.findNearbyDonors(
      requestData.location.coordinates,
      requestData.patient.bloodType,
      20000 // 20km radius
    )
    
    // Emit real-time notification
    io.emit('new-blood-request', {
      requestId: bloodRequest._id,
      bloodType: requestData.patient.bloodType,
      urgency: requestData.urgencyLevel,
      location: requestData.location,
      hospital: requestData.medicalInfo.hospital.name
    })
    
    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: { 
        request: bloodRequest,
        compatibleDonorsFound: compatibleDonors.length
      }
    })
    
  } catch (error) {
    console.error('Error creating request:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating request',
      error: error.message
    })
  }
})

// GET /api/requests/:id - Get blood request by ID (READ)
router.get('/:id', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('matchedDonors.donor', 'firstName lastName bloodType phone address')
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      })
    }
    
    res.status(200).json({
      success: true,
      data: { request },
      message: 'Blood request retrieved successfully'
    })
    
  } catch (error) {
    console.error('Error fetching request:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching request',
      error: error.message
    })
  }
})

// PUT /api/requests/:id - Update blood request (UPDATE)
router.put('/:id', [
  body('urgencyLevel').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('bloodRequirement.unitsNeeded').optional().isInt({ min: 1, max: 10 }),
  body('medicalInfo.transfusionDate').optional().isISO8601(),
  body('notes').optional().isString(),
  body('status').optional().isIn(['pending', 'matched', 'fulfilled', 'expired', 'cancelled'])
], handleValidationErrors, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      })
    }
    
    // Store old status for timeline
    const oldStatus = request.status
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key === 'medicalInfo' && req.body.medicalInfo) {
        request.medicalInfo = { ...request.medicalInfo.toObject(), ...req.body.medicalInfo }
      } else if (key === 'bloodRequirement' && req.body.bloodRequirement) {
        request.bloodRequirement = { ...request.bloodRequirement.toObject(), ...req.body.bloodRequirement }
      } else {
        request[key] = req.body[key]
      }
    })
    
    await request.save()
    
    // Add timeline entry if status changed
    if (req.body.status && req.body.status !== oldStatus) {
      await request.addTimelineEntry('status_updated', `Status changed from ${oldStatus} to ${req.body.status}`)
    }
    
    res.status(200).json({
      success: true,
      message: 'Blood request updated successfully',
      data: { request }
    })
    
  } catch (error) {
    console.error('Error updating request:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating request',
      error: error.message
    })
  }
})

// DELETE /api/requests/:id - Cancel blood request (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      })
    }
    
    // Update status to cancelled instead of deleting
    request.status = 'cancelled'
    await request.save()
    
    // Add timeline entry
    await request.addTimelineEntry('cancelled', 'Blood request cancelled by requester')
    
    res.status(200).json({
      success: true,
      message: 'Blood request cancelled successfully'
    })
    
  } catch (error) {
    console.error('Error cancelling request:', error)
    res.status(500).json({
      success: false,
      message: 'Error cancelling request',
      error: error.message
    })
  }
})

// POST /api/requests/:id/match - Match donor to request
router.post('/:id/match', [
  body('donorId').isMongoId().withMessage('Valid donor ID is required'),
  body('notes').optional().isString()
], handleValidationErrors, async (req, res) => {
  try {
    const { donorId, notes = '' } = req.body
    
    const request = await BloodRequest.findById(req.params.id)
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      })
    }
    
    const donor = await Donor.findById(donorId)
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      })
    }
    
    // Check if donor is already matched
    const alreadyMatched = request.matchedDonors.some(
      match => match.donor.toString() === donorId
    )
    
    if (alreadyMatched) {
      return res.status(409).json({
        success: false,
        message: 'Donor already matched to this request'
      })
    }
    
    // Match donor to request
    await request.matchWithDonor(donorId, notes)
    
    // Notify in real-time
    io.emit('donor-matched', {
      requestId: request._id,
      donorId: donorId,
      bloodType: request.patient.bloodType
    })
    
    res.status(200).json({
      success: true,
      message: 'Donor matched successfully',
      data: { request }
    })
    
  } catch (error) {
    console.error('Error matching donor:', error)
    res.status(500).json({
      success: false,
      message: 'Error matching donor',
      error: error.message
    })
  }
})

// PUT /api/requests/:id/fulfill - Mark request as fulfilled
router.put('/:id/fulfill', [
  body('unitsCollected').isInt({ min: 1 }).withMessage('Units collected is required'),
  body('notes').optional().isString()
], handleValidationErrors, async (req, res) => {
  try {
    const { unitsCollected, notes = '' } = req.body
    
    const request = await BloodRequest.findById(req.params.id)
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found'
      })
    }
    
    if (request.status === 'fulfilled') {
      return res.status(409).json({
        success: false,
        message: 'Request is already fulfilled'
      })
    }
    
    // Update request
    request.status = 'fulfilled'
    request.fulfilledAt = new Date()
    request.unitsCollected = unitsCollected
    
    await request.save()
    
    // Add timeline entry
    await request.addTimelineEntry('fulfilled', `Request fulfilled with ${unitsCollected} units. ${notes}`)
    
    // Update donor statistics
    for (const match of request.matchedDonors) {
      if (match.status === 'completed') {
        const donor = await Donor.findById(match.donor)
        if (donor) {
          donor.donationCount += 1
          donor.totalDonationsML += (unitsCollected * 450) // Approximate 450ml per unit
          donor.lastDonationDate = new Date()
          await donor.save()
        }
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Blood request fulfilled successfully',
      data: { request }
    })
    
  } catch (error) {
    console.error('Error fulfilling request:', error)
    res.status(500).json({
      success: false,
      message: 'Error fulfilling request',
      error: error.message
    })
  }
})

// GET /api/requests/search/urgent - Get urgent requests for donor
router.get('/search/urgent', [
  query('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood type is required'),
  query('lat').optional().isFloat({ min: -90, max: 90 }),
  query('lng').optional().isFloat({ min: -180, max: 180 }),
  query('maxDistance').optional().isInt({ min: 1, max: 100 })
], handleValidationErrors, async (req, res) => {
  try {
    const { bloodType, lat, lng, maxDistance = 50 } = req.query
    
    let coordinates = null
    if (lat && lng) {
      coordinates = [parseFloat(lng), parseFloat(lat)]
    }
    
    const urgentRequests = await BloodRequest.findUrgentRequests(
      bloodType, 
      coordinates, 
      maxDistance * 1000
    ).limit(10)
    
    res.status(200).json({
      success: true,
      data: { 
        requests: urgentRequests,
        searchCriteria: { bloodType, coordinates, maxDistance }
      },
      message: `Found ${urgentRequests.length} urgent requests`
    })
    
  } catch (error) {
    console.error('Error searching urgent requests:', error)
    res.status(500).json({
      success: false,
      message: 'Error searching urgent requests',
      error: error.message
    })
  }
})

export default router