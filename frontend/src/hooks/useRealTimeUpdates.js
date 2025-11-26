import { useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'
import { useAuthStore, useRequestsStore, useDonorsStore } from '../store/useStore'

let socket = null

export function useRealTimeUpdates() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { addRequest, addEmergency } = useRequestsStore()
  const { setLoading } = useDonorsStore()

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000
      })

      // Connection events
      socket.on('connect', () => {
        console.log('Connected to real-time server')
        toast.success('Real-time updates connected', { duration: 2000 })
        
        // Join location-based room if user has location
        if (user?.address?.city) {
          socket.emit('join-location', { city: user.address.city })
        }
      })

      socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason)
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          socket.connect()
        }
      })

      socket.on('reconnect', () => {
        console.log('Reconnected to server')
        toast.success('Connection restored')
        
        // Invalidate all queries to refresh data
        queryClient.invalidateQueries()
      })

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error)
        toast.error('Real-time connection failed')
      })

      // Blood request events
      socket.on('new-blood-request', (data) => {
        console.log('New blood request:', data)
        
        // Show notification if compatible with user's blood type
        if (user?.bloodType && isCompatibleDonor(user.bloodType, data.bloodType)) {
          toast((t) => (
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-full">
                <span className="text-red-600 font-bold">BLOOD</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Blood Request - {data.bloodType}
                </div>
                <div className="text-sm text-gray-600">
                  {data.urgency} priority at {data.hospital}
                </div>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => {
                      window.location.href = '/requests'
                      toast.dismiss(t.id)
                    }}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ), { 
            duration: 10000,
            position: 'top-right'
          })
        }
        
        // Update requests cache
        queryClient.invalidateQueries({ queryKey: ['requests'] })
        addRequest(data)
      })

      // Emergency alert events
      socket.on('emergency-alert', (data) => {
        console.log('Emergency alert:', data)
        
        // Show prominent emergency notification
        if (user?.bloodType && isCompatibleDonor(user.bloodType, data.patient.bloodType)) {
          toast((t) => (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
              <div className="flex items-start">
                <div className="text-red-400 text-xl mr-3 animate-pulse font-bold">EMERGENCY</div>
                <div className="flex-1">
                  <h3 className="text-red-800 font-bold text-lg">EMERGENCY BLOOD NEEDED!</h3>
                  <div className="text-red-700 mt-1">
                    <div>Patient needs <strong>{data.patient.bloodType}</strong> blood</div>
                    <div>Hospital: {data.hospital}</div>
                    <div>Units needed: {data.unitsNeeded}</div>
                    <div className="text-sm mt-2">
                      {data.compatibleDonors} compatible donors found nearby
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={() => {
                        window.location.href = '/emergency'
                        toast.dismiss(t.id)
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700"
                    >
                      Respond Now
                    </button>
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="bg-gray-300 text-gray-700 px-3 py-2 rounded"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ), { 
            duration: 20000,
            position: 'top-center',
            style: {
              maxWidth: '500px'
            }
          })
          
          // Play alert sound (if supported)
          try {
            const audio = new Audio('/alert-sound.mp3')
            audio.play().catch(() => {
              // Ignore if audio fails
            })
          } catch (error) {
            // Ignore audio errors
          }
        }
        
        // Update emergency cache
        queryClient.invalidateQueries({ queryKey: ['emergencies'] })
        addEmergency(data)
      })

      // Donor availability events
      socket.on('donor-available', (data) => {
        console.log('Donor available:', data)
        
        // Refresh donors list
        queryClient.invalidateQueries({ queryKey: ['donors'] })
        
        // Show subtle notification
        toast.success(`New ${data.bloodType} donor available in ${data.city}`, {
          duration: 3000
        })
      })

      // Donor matched events
      socket.on('donor-matched', (data) => {
        console.log('Donor matched:', data)
        
        // Refresh both requests and donors
        queryClient.invalidateQueries({ queryKey: ['requests'] })
        queryClient.invalidateQueries({ queryKey: ['donors'] })
        
        toast.success('Donor successfully matched to request!', {
          duration: 4000
        })
      })
    }

    return socket
  }, [user, queryClient, addRequest, addEmergency, setLoading])

  // Clean up socket connection
  const disconnectSocket = useCallback(() => {
    if (socket) {
      console.log('Disconnecting socket')
      socket.disconnect()
      socket = null
    }
  }, [])

  // Join location room
  const joinLocationRoom = useCallback((location) => {
    if (socket && location?.city) {
      socket.emit('join-location', location)
      console.log('Joined location room:', location.city)
    }
  }, [])

  // Blood type compatibility check
  const isCompatibleDonor = (donorType, recipientType) => {
    const compatibilityMap = {
      'A+': ['A+', 'AB+'],
      'A-': ['A+', 'A-', 'AB+', 'AB-'],
      'B+': ['B+', 'AB+'],
      'B-': ['B+', 'B-', 'AB+', 'AB-'],
      'AB+': ['AB+'],
      'AB-': ['AB+', 'AB-'],
      'O+': ['A+', 'B+', 'AB+', 'O+'],
      'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    }
    
    return compatibilityMap[donorType]?.includes(recipientType) || false
  }

  // Auto-refresh data periodically
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      // Invalidate stale queries for auto-refresh
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const dataAge = Date.now() - (query.state.dataUpdatedAt || 0)
          return dataAge > 30000 // Refresh data older than 30 seconds
        }
      })
    }, 30000) // Check every 30 seconds

    return () => clearInterval(refreshInterval)
  }, [queryClient])

  // Initialize socket on mount
  useEffect(() => {
    initializeSocket()

    return () => {
      // Don't disconnect on unmount, keep connection alive for app
      // disconnectSocket()
    }
  }, [initializeSocket])

  // Update location room when user location changes
  useEffect(() => {
    if (user?.address?.city) {
      joinLocationRoom(user.address)
    }
  }, [user?.address?.city, joinLocationRoom])

  return {
    socket,
    isConnected: socket?.connected || false,
    initializeSocket,
    disconnectSocket,
    joinLocationRoom
  }
}

// Global hook for managing app-wide real-time updates
export function useGlobalRealTimeUpdates() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // Set up global query invalidation on window focus
    const handleFocus = () => {
      queryClient.invalidateQueries()
    }

    // Set up global query invalidation on network reconnect
    const handleOnline = () => {
      queryClient.invalidateQueries()
      toast.success('Back online! Refreshing data...')
    }

    const handleOffline = () => {
      toast.error('Connection lost. Data may be outdated.')
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [queryClient])
}
