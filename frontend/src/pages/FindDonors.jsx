import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HeartIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  UserIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

import { donorsAPI } from '../services/api'
import { useAppStore } from '../store/useStore'
import { bloodTypeStyles, locationUtils, dateUtils } from '../utils'

const FindDonors = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { userLocation, getCurrentLocation } = useAppStore()
  
  const [filters, setFilters] = useState({
    bloodType: '',
    city: '',
    available: true,
    radius: 10,
    searchTerm: ''
  })
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  // Fetch donors with real-time updates
  const { data: donorsData, isLoading, error, refetch } = useQuery({
    queryKey: ['donors', filters, userLocation],
    queryFn: async () => {
      const params = {
        ...filters,
        ...(userLocation && {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          radius: filters.radius
        })
      }
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key]
        }
      })
      
      const response = await donorsAPI.getDonors(params)
      return response.data?.data ?? response.data
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 10000 // Consider data stale after 10 seconds
  })

  // Get current location
  const handleGetLocation = async () => {
    setLocationLoading(true)
    try {
      await getCurrentLocation()
      toast.success('Location updated! Showing nearby donors.')
      refetch()
    } catch (error) {
      toast.error('Failed to get location. Please enable location services.')
    } finally {
      setLocationLoading(false)
    }
  }

  // Search donors by name or city
  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm, city: searchTerm }))
  }

  // Filter change handler
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      bloodType: '',
      city: '',
      available: true,
      radius: 10,
      searchTerm: ''
    })
  }

  // Calculate distance if user location is available
  const calculateDistance = (donorCoords) => {
    if (!userLocation || !donorCoords?.coordinates) return null
    
    const distance = locationUtils.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      donorCoords.coordinates[1],
      donorCoords.coordinates[0]
    )
    
    return locationUtils.formatDistance(distance)
  }

  const donors = donorsData?.donors || []
  const pagination = donorsData?.pagination

  return (
    <>
      <Helmet>
        <title>Find Blood Donors - LifeLink Network</title>
        <meta name="description" content="Search and connect with verified blood donors in your area. Find compatible donors by blood type, location, and availability." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <MapPinIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Find Blood Donors
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with verified donors in your community. Search by blood type, location, and availability.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by city or donor name..."
                  value={filters.searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={handleGetLocation}
                disabled={locationLoading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  locationLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <MapPinIcon className="h-5 w-5" />
                <span>{locationLoading ? 'Detecting...' : 'Use My Location'}</span>
              </button>
              
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <FunnelIcon className="h-5 w-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* Quick Blood Type Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700 self-center mr-2">
                Blood Type:
              </span>
              {bloodTypes.map(type => (
                <button
                  key={type}
                  onClick={() => handleFilterChange('bloodType', filters.bloodType === type ? '' : type)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    filters.bloodType === type
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
              
              {(filters.bloodType || filters.city || filters.searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Radius
                    </label>
                    <select
                      value={filters.radius}
                      onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>5 km</option>
                      <option value={10}>10 km</option>
                      <option value={25}>25 km</option>
                      <option value={50}>50 km</option>
                      <option value={100}>100 km</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <select
                      value={filters.available}
                      onChange={(e) => handleFilterChange('available', e.target.value === 'true')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={true}>Available Now</option>
                      <option value={false}>All Donors</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="Enter city name"
                      value={filters.city}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isLoading ? 'Searching...' : `${donors.length} Donors Found`}
                </h2>
                {pagination && (
                  <p className="text-sm text-gray-600">
                    Showing {donors.length} of {pagination.totalDonors} total donors
                  </p>
                )}
              </div>
              
              {userLocation && (
                <div className="text-sm text-green-600 flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>Location detected</span>
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <div className="text-red-600 mb-2">Error Loading Donors</div>
                  <p className="text-red-700 mb-4">{error.message}</p>
                  <button
                    onClick={() => refetch()}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Donors Grid */}
            {!isLoading && !error && donors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donors.map((donor, index) => (
                  <motion.div
                    key={donor._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 cursor-pointer"
                    onClick={() => navigate(`/donor/${donor._id}`)}
                  >
                    {/* Donor Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-2 rounded-full">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {donor.firstName} {donor.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {donor.address?.city}, {donor.address?.state}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`px-2 py-1 text-xs font-medium rounded-full ${bloodTypeStyles[donor.bloodType]}`}>
                        {donor.bloodType}
                      </div>
                    </div>

                    {/* Donor Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Availability:</span>
                        <span className={`font-medium ${
                          donor.availability?.isAvailable 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {donor.availability?.isAvailable ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                      
                      {donor.donationCount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Donations:</span>
                          <span className="text-blue-600 font-medium">
                            {donor.donationCount} times
                          </span>
                        </div>
                      )}
                      
                      {calculateDistance(donor.location) && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Distance:</span>
                          <span className="text-gray-900 font-medium flex items-center space-x-1">
                            <MapPinIcon className="h-3 w-3" />
                            <span>{calculateDistance(donor.location)}</span>
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Last Active:</span>
                        <span className="text-gray-500">
                          {dateUtils.formatTimeAgo(donor.lastActive)}
                        </span>
                      </div>
                    </div>

                    {/* Emergency Badge */}
                    {donor.availability?.emergencyOnly && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-4">
                        <div className="flex items-center space-x-2 text-red-700 text-xs">
                          <ClockIcon className="h-4 w-4" />
                          <span>Emergency cases only</span>
                        </div>
                      </div>
                    )}

                    {/* View Details Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/donor/${donor._id}`)
                      }}
                      className="w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && donors.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 max-w-md mx-auto">
                  <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Donors Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search filters or expanding the search radius.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default FindDonors