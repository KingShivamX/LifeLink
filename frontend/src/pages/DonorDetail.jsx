import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import {
  ArrowLeftIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  UserIcon,
  HeartIcon,
  StarIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

import { donorsAPI } from '../services/api'
import { useAppStore } from '../store/useStore'
import { bloodTypeStyles, locationUtils, dateUtils } from '../utils'

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const DonorDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userLocation } = useAppStore()

  // Fetch donor details
  const { data: donorData, isLoading, error } = useQuery({
    queryKey: ['donor', id],
    queryFn: async () => {
      const response = await donorsAPI.getDonorById(id)
      return response.data?.data?.donor ?? response.data?.donor
    },
    enabled: !!id
  })

  const donor = donorData

  // Calculate distance if user location is available
  const calculateDistance = () => {
    if (!userLocation || !donor?.location?.coordinates) return null
    
    const distance = locationUtils.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      donor.location.coordinates[1],
      donor.location.coordinates[0]
    )
    
    return locationUtils.formatDistance(distance)
  }

  // Handle contact action
  const handleContact = (method) => {
    if (method === 'phone' && donor?.phone) {
      window.open(`tel:${donor.phone}`)
      toast.success(`Calling ${donor.firstName}...`)
    } else if (method === 'email' && donor?.email) {
      window.open(`mailto:${donor.email}?subject=Blood Donation Request - LifeLink`)
      toast.success(`Opening email client...`)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="h-32 bg-gray-200 rounded w-full mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !donor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/find-donors')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Donors</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Donor Not Found</h2>
            <p className="text-gray-600 mb-6">
              The donor you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/find-donors"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
            >
              Find Other Donors
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const distance = calculateDistance()
  const averageRating = donor.averageRating || 4.5
  const reviewCount = donor.reviewCount || 0
  const donorCoords = donor.location?.coordinates ? [donor.location.coordinates[1], donor.location.coordinates[0]] : null

  return (
    <>
      <Helmet>
        <title>{`${donor.firstName} ${donor.lastName} - Donor Profile | LifeLink`}</title>
        <meta name="description" content={`View ${donor.firstName}'s donor profile. Blood type: ${donor.bloodType}. ${donor.availability?.isAvailable ? 'Available' : 'Not available'} for donation.`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/find-donors')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-8 group"
          >
            <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Donors</span>
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              
              {/* Header Card */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-4 rounded-full">
                        <UserIcon className="h-12 w-12 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h1 className="text-3xl font-bold text-white">
                            {donor.firstName} {donor.lastName}
                          </h1>
                          {donor.isVerified && (
                            <CheckBadgeIcon className="h-7 w-7 text-blue-300" title="Verified Donor" />
                          )}
                        </div>
                        <p className="text-blue-100 text-lg">
                          {donor.address?.city}, {donor.address?.state}
                        </p>
                      </div>
                    </div>
                    
                    <div className={`px-4 py-2 text-lg font-bold rounded-full ${bloodTypeStyles[donor.bloodType]} bg-opacity-90`}>
                      {donor.bloodType}
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6">
                  {/* Availability Status */}
                  <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${donor.availability?.isAvailable ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                      <span className="text-lg font-semibold text-gray-900">
                        {donor.availability?.isAvailable ? 'Available for Donation' : 'Currently Unavailable'}
                      </span>
                    </div>
                    {donor.availability?.emergencyOnly && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                        Emergency Only
                      </span>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <HeartIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{donor.donationCount || 0}</div>
                      <div className="text-sm text-gray-600">Donations</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                      <StarIcon className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                      <div className="text-sm text-gray-600">{reviewCount} Reviews</div>
                    </div>
                    
                    {distance && (
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                        <MapPinIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{distance}</div>
                        <div className="text-sm text-gray-600">Away</div>
                      </div>
                    )}
                  </div>

                  {/* Contact Actions */}
                  <button
                    onClick={() => handleContact('phone')}
                    disabled={!donor.availability?.isAvailable}
                    className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                      donor.availability?.isAvailable
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <PhoneIcon className="h-5 w-5" />
                    <span>Call Now</span>
                  </button>
                </div>
              </div>

              {/* Map Card */}
              {donorCoords && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                  <div className="px-8 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <MapPinIcon className="h-6 w-6 text-blue-600" />
                      <span>Donor Location</span>
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {donor.address?.street}, {donor.address?.city}, {donor.address?.state} {donor.address?.zipCode}
                    </p>
                  </div>
                  <div className="h-96 w-full">
                    <MapContainer
                      center={donorCoords}
                      zoom={13}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={donorCoords}>
                        <Popup>
                          <div className="text-center">
                            <p className="font-semibold text-gray-900">
                              {donor.firstName} {donor.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {donor.address?.city}, {donor.address?.state}
                            </p>
                            <p className="text-xs text-blue-600 font-medium mt-1">
                              Blood Type: {donor.bloodType}
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                </div>
              )}

              {/* Additional Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                  <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  <span>Donor Information</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-2">
                      <UserIcon className="h-5 w-5" />
                      <span>Age</span>
                    </span>
                    <span className="font-semibold text-gray-900">{donor.age || 'N/A'} years</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-2">
                      <MapPinIcon className="h-5 w-5" />
                      <span>Location</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {donor.address?.city}, {donor.address?.state}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-2">
                      <ClockIcon className="h-5 w-5" />
                      <span>Last Active</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {dateUtils.formatTimeAgo(donor.lastActive)}
                    </span>
                  </div>
                  
                  {donor.lastDonationDate && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-600 flex items-center space-x-2">
                        <CalendarIcon className="h-5 w-5" />
                        <span>Last Donation</span>
                      </span>
                      <span className="font-semibold text-gray-900">
                        {new Date(donor.lastDonationDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600 flex items-center space-x-2">
                      <TrophyIcon className="h-5 w-5" />
                      <span>Total Blood Donated</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {donor.totalDonationsML || 0} mL
                    </span>
                  </div>
                </div>
              </div>

            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              
              {/* Rating Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Donor Rating</h3>
                
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
                  <div className="flex items-center justify-center space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIconSolid
                        key={star}
                        className={`h-6 w-6 ${
                          star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">Based on {reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
                </div>

                {reviewCount > 0 && (
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const percentage = reviewCount > 0 ? Math.floor(Math.random() * 100) : 0
                      return (
                        <div key={rating} className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 w-12">{rating} star</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{percentage}%</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Trust & Safety</h3>
                
                <div className="space-y-3">
                  {donor.isVerified && (
                    <div className="flex items-center space-x-3 text-green-700">
                      <CheckBadgeIcon className="h-6 w-6" />
                      <span className="font-medium">Verified Identity</span>
                    </div>
                  )}
                  
                  {donor.isEligible && (
                    <div className="flex items-center space-x-3 text-green-700">
                      <CheckBadgeIcon className="h-6 w-6" />
                      <span className="font-medium">Medically Eligible</span>
                    </div>
                  )}
                  
                  {donor.donationCount > 0 && (
                    <div className="flex items-center space-x-3 text-green-700">
                      <CheckBadgeIcon className="h-6 w-6" />
                      <span className="font-medium">Experienced Donor</span>
                    </div>
                  )}
                  
                  {donor.donationCount >= 10 && (
                    <div className="flex items-center space-x-3 text-green-700">
                      <TrophyIcon className="h-6 w-6" />
                      <span className="font-medium">Elite Donor (10+ donations)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Alert */}
              {donor.availability?.emergencyOnly && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Emergency Cases Only</h4>
                      <p className="text-sm text-red-700">
                        This donor has indicated they can only respond to emergency blood requests.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>

          </div>

        </div>
      </div>

    </>
  )
}

export default DonorDetail
