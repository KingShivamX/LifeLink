import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authAPI } from '../services/api'

// Auth store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await authAPI.login(credentials)
          const { donor, token } = response.data.data
          
          localStorage.setItem('lifelink_token', token)
          
          set({
            user: donor,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          
          return { success: true, data: donor }
        } catch (error) {
          set({ isLoading: false })
          return { 
            success: false, 
            error: error.response?.data?.message || 'Login failed' 
          }
        }
      },
      
      logout: () => {
        localStorage.removeItem('lifelink_token')
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        })
      },
      
      verifyToken: async () => {
        const token = localStorage.getItem('lifelink_token')
        if (!token) return false
        
        try {
          const response = await authAPI.verifyToken()
          const donor = response.data.data.donor
          
          set({
            user: donor,
            token,
            isAuthenticated: true,
            isLoading: false
          })
          
          return true
        } catch (error) {
          get().logout()
          return false
        }
      }
    }),
    {
      name: 'lifelink-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
)

// App state store
export const useAppStore = create((set, get) => ({
  // Location state
  userLocation: null,
  locationPermission: null,
  
  // UI state
  sidebarOpen: false,
  searchFilters: {
    bloodType: '',
    city: '',
    radius: 10,
    available: true
  },
  
  // Set user location
  setUserLocation: (location) => {
    set({ userLocation: location })
  },
  
  // Set location permission
  setLocationPermission: (permission) => {
    set({ locationPermission: permission })
  },
  
  // Toggle sidebar
  toggleSidebar: () => {
    set({ sidebarOpen: !get().sidebarOpen })
  },
  
  // Update search filters
  updateSearchFilters: (filters) => {
    set({ searchFilters: { ...get().searchFilters, ...filters } })
  },
  
  // Get current location
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        set({ locationPermission: 'denied' })
        reject(new Error('Geolocation is not supported'))
        return
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
          
          set({ 
            userLocation: location,
            locationPermission: 'granted'
          })
          
          resolve(location)
        },
        (error) => {
          set({ locationPermission: 'denied' })
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }
}))

// Donors store
export const useDonorsStore = create((set, get) => ({
  donors: [],
  nearbyDonors: [],
  donorStats: null,
  isLoading: false,
  
  setDonors: (donors) => set({ donors }),
  setNearbyDonors: (donors) => set({ nearbyDonors: donors }),
  setDonorStats: (stats) => set({ donorStats: stats }),
  setLoading: (loading) => set({ isLoading: loading })
}))

// Requests store  
export const useRequestsStore = create((set, get) => ({
  requests: [],
  emergencies: [],
  isLoading: false,
  
  setRequests: (requests) => set({ requests }),
  setEmergencies: (emergencies) => set({ emergencies }),
  setLoading: (loading) => set({ isLoading: loading }),
  
  addRequest: (request) => {
    set({ requests: [request, ...get().requests] })
  },
  
  addEmergency: (emergency) => {
    set({ emergencies: [emergency, ...get().emergencies] })
  }
}))
