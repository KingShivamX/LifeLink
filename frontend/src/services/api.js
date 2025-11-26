import axios from 'axios'
import toast from 'react-hot-toast'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://lifelink-omh5.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lifelink_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong'
    
    // Don't show toast for 401 errors (handled by auth context)
    if (error.response?.status !== 401) {
      toast.error(message)
    }
    
    return Promise.reject(error)
  }
)

// Donors API
export const donorsAPI = {
  // Get all donors with filters
  getDonors: (params = {}) => {
    return api.get('/donors', { params })
  },
  
  // Register new donor
  registerDonor: (donorData) => {
    return api.post('/donors', donorData)
  },
  
  // Get donor by ID
  getDonor: (id) => {
    return api.get(`/donors/${id}`)
  },
  
  // Get donor by ID (alias)
  getDonorById: (id) => {
    return api.get(`/donors/${id}`)
  },
  
  // Update donor availability
  updateAvailability: (id, availabilityData) => {
    return api.put(`/donors/${id}/availability`, availabilityData)
  },
  
  // Search nearby donors
  searchNearbyDonors: (searchData) => {
    return api.post('/donors/search/nearby', searchData)
  },
  
  // Get donor statistics
  getDonorStats: () => {
    return api.get('/donors/stats/summary')
  }
}

// Blood Requests API
export const requestsAPI = {
  // Get all blood requests
  getRequests: (params = {}) => {
    return api.get('/requests', { params })
  },
  
  // Create new blood request
  createRequest: (requestData) => {
    return api.post('/requests', requestData)
  },
  
  // Get request by ID
  getRequest: (id) => {
    return api.get(`/requests/${id}`)
  }
}

// Emergency API
export const emergencyAPI = {
  // Create emergency request
  createEmergencyRequest: (emergencyData) => {
    return api.post('/emergency/request', emergencyData)
  },
  
  // Get active emergencies
  getActiveEmergencies: () => {
    return api.get('/emergency/active')
  }
}

// Auth API
export const authAPI = {
  // Login donor
  login: (credentials) => {
    returnapi.post('/auth/login', credentials)
  },
  
  // Verify token
  verifyToken: () => {
    return api.post('/auth/verify-token')
  }
}

// Analytics API
export const analyticsAPI = {
  // Get dashboard analytics
  getDashboard: () => {
    return api.get('/analytics/dashboard')
  },
  
  // Get blood type distribution
  getBloodTypeAnalytics: () => {
    return api.get('/analytics/blood-types')
  }
}

export default api
