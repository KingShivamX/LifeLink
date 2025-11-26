import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistance, isValid } from 'date-fns'

// Utility function to merge Tailwind CSS classes
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Blood type compatibility checker
export const bloodCompatibility = {
  // Who can receive from whom
  canReceiveFrom: {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  },
  
  // Who can donate to whom
  canDonateTo: {
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB+', 'AB-'],
    'O+': ['A+', 'B+', 'AB+', 'O+'],
    'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  
  isCompatible: (donorType, recipientType) => {
    return bloodCompatibility.canReceiveFrom[recipientType]?.includes(donorType) || false
  }
}

// Date formatting utilities
export const dateUtils = {
  formatDate: (date) => {
    if (!date || !isValid(new Date(date))) return 'Invalid date'
    return format(new Date(date), 'MMM dd, yyyy')
  },
  
  formatDateTime: (date) => {
    if (!date || !isValid(new Date(date))) return 'Invalid date'
    return format(new Date(date), 'MMM dd, yyyy h:mm a')
  },
  
  formatTimeAgo: (date) => {
    if (!date || !isValid(new Date(date))) return 'Invalid date'
    return formatDistance(new Date(date), new Date(), { addSuffix: true })
  },
  
  getAge: (birthDate) => {
    if (!birthDate || !isValid(new Date(birthDate))) return null
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }
}

// Location utilities
export const locationUtils = {
  // Calculate distance between two coordinates using Haversine formula
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  },
  
  formatDistance: (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`
    }
    return `${distance.toFixed(1)}km`
  },
  
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    })
  }
}

// Validation utilities
export const validation = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },
  
  isValidPhone: (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  },
  
  isValidBloodType: (bloodType) => {
    const validTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    return validTypes.includes(bloodType)
  },
  
  isValidAge: (birthDate) => {
    const age = dateUtils.getAge(birthDate)
    return age !== null && age >= 18 && age <= 65
  }
}

// Emergency priority levels
export const emergencyLevels = {
  low: {
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    label: 'Low Priority'
  },
  medium: {
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    label: 'Medium Priority'
  },
  high: {
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    label: 'High Priority'
  },
  critical: {
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    label: 'Critical'
  }
}

// Blood type styling
export const bloodTypeStyles = {
  'A+': 'bg-red-100 text-red-800',
  'A-': 'bg-red-200 text-red-900',
  'B+': 'bg-blue-100 text-blue-800',
  'B-': 'bg-blue-200 text-blue-900',
  'AB+': 'bg-purple-100 text-purple-800',
  'AB-': 'bg-purple-200 text-purple-900',
  'O+': 'bg-green-100 text-green-800',
  'O-': 'bg-green-200 text-green-900'
}

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error reading from localStorage:`, error)
      return defaultValue
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage:`, error)
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage:`, error)
    }
  }
}

// Debounce utility
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
