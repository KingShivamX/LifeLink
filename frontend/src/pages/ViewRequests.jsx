import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  HeartIcon, 
  MapPinIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  UserIcon,
  FunnelIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { requestsAPI } from '../services/api';
import { bloodTypeStyles, dateUtils } from '../utils';

const ViewRequests = () => {
  const [filters, setFilters] = useState({
    bloodType: '',
    urgencyLevel: '',
    status: 'pending'
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels = [
    { value: '', label: 'All Urgencies' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
    { value: 'high', label: 'Urgent', color: 'text-orange-600' },
    { value: 'low', label: 'Routine', color: 'text-green-600' }
  ];

  // Fetch blood requests
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['bloodRequests', filters],
    queryFn: async () => {
      const params = {};
      if (filters.bloodType) params.bloodType = filters.bloodType;
      if (filters.urgencyLevel) params.urgency = filters.urgencyLevel;
      if (filters.status) params.status = filters.status;
      
      const response = await requestsAPI.getRequests(params);
      return response.data?.data || response.data;
    },
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  const requests = Array.isArray(data?.requests) ? data.requests : Array.isArray(data) ? data : [];

  const getUrgencyConfig = (urgency) => {
    const configs = {
      critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500', label: 'CRITICAL' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500', label: 'URGENT' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500', label: 'MODERATE' },
      low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500', label: 'ROUTINE' }
    };
    return configs[urgency] || configs.low;
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <Helmet>
        <title>Active Blood Requests - LifeLink</title>
        <meta name="description" content="View active blood donation requests and help save lives in your community." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <HeartIcon className="h-8 w-8 text-red-600 animate-pulse" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Active Blood Requests
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Help save lives by responding to blood donation requests in your area
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center space-x-2 mb-4">
              <FunnelIcon className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Blood Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Type
                </label>
                <select
                  value={filters.bloodType}
                  onChange={(e) => handleFilterChange('bloodType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">All Blood Types</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Urgency Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  value={filters.urgencyLevel}
                  onChange={(e) => handleFilterChange('urgencyLevel', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {urgencyLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isLoading ? 'Loading...' : `${requests.length} Requests Found`}
              </h2>
              <p className="text-sm text-gray-600">
                Updated {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Requests</h3>
                <p className="text-red-700 mb-4">{error.message}</p>
                <button
                  onClick={() => refetch()}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Requests Grid */}
          {!isLoading && !error && requests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request, index) => {
                const urgencyConfig = getUrgencyConfig(request.urgencyLevel);
                
                return (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-red-100 to-pink-100 p-2 rounded-full">
                          <HeartIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <div className={`px-3 py-1 text-xs font-bold rounded-full ${bloodTypeStyles[request.patient?.bloodType]}`}>
                            {request.patient?.bloodType}
                          </div>
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${urgencyConfig.bg} ${urgencyConfig.text}`}>
                        {urgencyConfig.label}
                      </span>
                    </div>

                    {/* Units Needed */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {request.bloodRequirement?.unitsNeeded} {request.bloodRequirement?.unitsNeeded === 1 ? 'Unit' : 'Units'} Needed
                    </h3>

                    {/* Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <UserIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span>Patient: {request.patient?.firstName} {request.patient?.lastName?.[0]}.</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <MapPinIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span className="truncate">{request.location?.city}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <ClockIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <span>
                          Needed by: {new Date(request.medicalInfo?.transfusionDate).toLocaleDateString()}
                        </span>
                      </div>

                      {(request.medicalInfo?.diagnosis || request.medicalInfo?.condition) && (
                        <div className="bg-gray-50 rounded-lg p-3 mt-2">
                          <span className="text-xs font-semibold text-gray-600 block mb-1">Medical Condition:</span>
                          <span className="text-sm text-gray-900">{request.medicalInfo?.diagnosis || request.medicalInfo?.condition}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/request/${request._id}`}
                      className="w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white hover:from-red-700 hover:to-pink-700 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>View Details</span>
                    </Link>

                    {/* Time Posted */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 flex items-center space-x-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>Posted {dateUtils.formatTimeAgo(request.createdAt)}</span>
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && requests.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 max-w-md mx-auto">
                <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Active Requests
                </h3>
                <p className="text-gray-600 mb-6">
                  There are currently no blood requests matching your filters. Check back soon!
                </p>
                <button
                  onClick={() => setFilters({ bloodType: '', urgencyLevel: '', status: 'pending' })}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewRequests;
