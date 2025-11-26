import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const donorSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s\-\(\)]{10,}$/, 'Please provide a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  
  // Blood Information
  bloodType: {
    type: String,
    required: [true, 'Blood type is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  lastDonationDate: {
    type: Date,
    default: null
  },
  
  // Location
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required']
    },
    country: {
      type: String,
      default: 'USA'
    }
  },
  
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
  
  // Medical Information
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(dob) {
        const age = (new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000)
        return age >= 18 && age <= 65
      },
      message: 'Donor must be between 18 and 65 years old'
    }
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [50, 'Minimum weight requirement is 50kg'],
    max: [200, 'Weight cannot exceed 200kg']
  },
  
  // Health Status
  medicalConditions: [{
    condition: String,
    notes: String
  }],
  medications: [{
    name: String,
    dosage: String
  }],
  isEligible: {
    type: Boolean,
    default: true
  },
  eligibilityNotes: String,
  
  // Availability
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    schedule: {
      monday: { available: Boolean, timeSlots: [String] },
      tuesday: { available: Boolean, timeSlots: [String] },
      wednesday: { available: Boolean, timeSlots: [String] },
      thursday: { available: Boolean, timeSlots: [String] },
      friday: { available: Boolean, timeSlots: [String] },
      saturday: { available: Boolean, timeSlots: [String] },
      sunday: { available: Boolean, timeSlots: [String] }
    },
    emergencyOnly: {
      type: Boolean,
      default: false
    }
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationExpires: Date,
  
  // Statistics
  donationCount: {
    type: Number,
    default: 0
  },
  totalDonationsML: {
    type: Number,
    default: 0
  },
  
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      emergency: { type: Boolean, default: true }
    },
    privacy: {
      showLocation: { type: Boolean, default: true },
      showContactInfo: { type: Boolean, default: false }
    },
    maxTravelDistance: {
      type: Number,
      default: 10, // kilometers
      min: 1,
      max: 50
    }
  },
  
  // Activity
  lastActive: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Indexes for geospatial queries
donorSchema.index({ location: '2dsphere' })
donorSchema.index({ bloodType: 1, 'availability.isAvailable': 1 })
donorSchema.index({ city: 1, bloodType: 1 })
donorSchema.index({ email: 1 }, { unique: true })

// Virtual for age
donorSchema.virtual('age').get(function() {
  return Math.floor((new Date() - new Date(this.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
})

// Virtual for eligibility to donate (based on last donation)
donorSchema.virtual('canDonate').get(function() {
  if (!this.lastDonationDate) return true
  
  const daysSinceLastDonation = (new Date() - new Date(this.lastDonationDate)) / (24 * 60 * 60 * 1000)
  return daysSinceLastDonation >= 56 // 8 weeks between donations
})

// Pre-save middleware to hash password
donorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
donorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Method to update last active
donorSchema.methods.updateLastActive = function() {
  this.lastActive = new Date()
  return this.save({ validateBeforeSave: false })
}

// Static method to find nearby donors
donorSchema.statics.findNearbyDonors = function(coordinates, bloodType, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance // meters
      }
    },
    bloodType: bloodType,
    'availability.isAvailable': true,
    isEligible: true,
    isActive: true
  })
}

const Donor = mongoose.model('Donor', donorSchema)

export default Donor
