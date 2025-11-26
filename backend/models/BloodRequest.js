import mongoose from 'mongoose'

const bloodRequestSchema = new mongoose.Schema({
  // Request Information
  requestType: {
    type: String,
    enum: ['emergency', 'planned', 'regular'],
    required: [true, 'Request type is required']
  },
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: [true, 'Urgency level is required']
  },
  
  // Patient Information
  patient: {
    firstName: {
      type: String,
      required: [true, 'Patient first name is required']
    },
    lastName: {
      type: String,
      required: [true, 'Patient last name is required']
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age cannot exceed 120']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Patient gender is required']
    },
    bloodType: {
      type: String,
      required: [true, 'Patient blood type is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    medicalRecordNumber: {
      type: String,
      required: [true, 'Medical record number is required']
    }
  },
  
  // Requester Information
  requester: {
    name: {
      type: String,
      required: [true, 'Requester name is required']
    },
    relationship: {
      type: String,
      enum: ['family', 'friend', 'medical_staff', 'self'],
      required: [true, 'Relationship to patient is required']
    },
    email: {
      type: String,
      required: [true, 'Requester email is required'],
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Requester phone is required']
    }
  },
  
  // Medical Details
  medicalInfo: {
    hospital: {
      name: {
        type: String,
        required: [true, 'Hospital name is required']
      },
      address: {
        type: String,
        required: [true, 'Hospital address is required']
      },
      contactNumber: {
        type: String,
        required: [true, 'Hospital contact number is required']
      }
    },
    doctor: {
      name: {
        type: String,
        required: [true, 'Doctor name is required']
      },
      licenseNumber: String,
      department: String
    },
    diagnosis: {
      type: String,
      required: [true, 'Diagnosis is required']
    },
    procedure: String,
    transfusionDate: {
      type: Date,
      required: [true, 'Required transfusion date is required'],
      validate: {
        validator: function(date) {
          return date >= new Date()
        },
        message: 'Transfusion date cannot be in the past'
      }
    }
  },
  
  // Blood Requirements
  bloodRequirement: {
    unitsNeeded: {
      type: Number,
      required: [true, 'Number of units needed is required'],
      min: [1, 'At least 1 unit is required'],
      max: [10, 'Cannot request more than 10 units at once']
    },
    componentType: {
      type: String,
      enum: ['whole_blood', 'red_cells', 'platelets', 'plasma', 'cryoprecipitate'],
      default: 'whole_blood'
    },
    compatibleTypes: [{
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    }],
    specialRequirements: [String] // e.g., CMV negative, irradiated, etc.
  },
  
  // Location
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required']
    }
  },
  
  // Status and Tracking
  status: {
    type: String,
    enum: ['pending', 'matched', 'fulfilled', 'expired', 'cancelled'],
    default: 'pending'
  },
  
  // Matched Donors
  matchedDonors: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor'
    },
    matchedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['contacted', 'accepted', 'declined', 'completed'],
      default: 'contacted'
    },
    notes: String
  }],
  
  // Timeline
  timeline: [{
    action: {
      type: String,
      enum: ['created', 'matched', 'donor_contacted', 'donor_responded', 'fulfilled', 'cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String,
    performedBy: String
  }],
  
  // Additional Information
  notes: String,
  internalNotes: String, // For medical staff only
  
  // Priority and Scoring
  priorityScore: {
    type: Number,
    default: 0
  },
  
  // Fulfillment
  fulfilledAt: Date,
  unitsCollected: {
    type: Number,
    default: 0
  },
  
  // Expiry
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Default expiry: 7 days for regular, 24 hours for emergency
      const hours = this.requestType === 'emergency' ? 24 : 168
      return new Date(Date.now() + hours * 60 * 60 * 1000)
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes
bloodRequestSchema.index({ location: '2dsphere' })
bloodRequestSchema.index({ 'patient.bloodType': 1, status: 1 })
bloodRequestSchema.index({ urgencyLevel: 1, createdAt: -1 })
bloodRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
bloodRequestSchema.index({ status: 1, 'medicalInfo.transfusionDate': 1 })

// Virtual for time remaining
bloodRequestSchema.virtual('timeRemaining').get(function() {
  const now = new Date()
  const remaining = this.expiresAt - now
  
  if (remaining <= 0) return null
  
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
  
  return { days, hours, minutes, totalMinutes: Math.floor(remaining / (60 * 1000)) }
})

// Virtual for compatibility check
bloodRequestSchema.virtual('isUrgent').get(function() {
  return ['high', 'critical'].includes(this.urgencyLevel) || this.requestType === 'emergency'
})

// Pre-save middleware to calculate compatible blood types
bloodRequestSchema.pre('save', function(next) {
  if (!this.isModified('patient.bloodType')) return next()
  
  const bloodType = this.patient.bloodType
  const compatibilityMap = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  }
  
  this.bloodRequirement.compatibleTypes = compatibilityMap[bloodType] || []
  next()
})

// Pre-save middleware to calculate priority score
bloodRequestSchema.pre('save', function(next) {
  let score = 0
  
  // Urgency scoring
  const urgencyScores = { low: 1, medium: 3, high: 7, critical: 10 }
  score += urgencyScores[this.urgencyLevel] || 0
  
  // Request type scoring
  const typeScores = { regular: 1, planned: 2, emergency: 10 }
  score += typeScores[this.requestType] || 0
  
  // Time sensitivity
  const timeRemaining = this.expiresAt - new Date()
  const hoursRemaining = timeRemaining / (60 * 60 * 1000)
  
  if (hoursRemaining < 6) score += 5
  else if (hoursRemaining < 24) score += 3
  else if (hoursRemaining < 72) score += 1
  
  // Units needed
  score += Math.min(this.bloodRequirement.unitsNeeded, 5)
  
  this.priorityScore = score
  next()
})

// Method to add timeline entry
bloodRequestSchema.methods.addTimelineEntry = function(action, notes = '', performedBy = '') {
  this.timeline.push({
    action,
    notes,
    performedBy,
    timestamp: new Date()
  })
  return this.save()
}

// Method to match with donor
bloodRequestSchema.methods.matchWithDonor = function(donorId, notes = '') {
  this.matchedDonors.push({
    donor: donorId,
    notes
  })
  
  if (this.status === 'pending') {
    this.status = 'matched'
  }
  
  return this.addTimelineEntry('matched', `Matched with donor ${donorId}`)
}

// Static method to find urgent requests
bloodRequestSchema.statics.findUrgentRequests = function(bloodType, coordinates, maxDistance = 50000) {
  const query = {
    'bloodRequirement.compatibleTypes': bloodType,
    status: { $in: ['pending', 'matched'] },
    expiresAt: { $gt: new Date() }
  }
  
  if (coordinates) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    }
  }
  
  return this.find(query)
    .sort({ priorityScore: -1, createdAt: 1 })
    .populate('matchedDonors.donor', 'firstName lastName bloodType phone')
}

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema)

export default BloodRequest
