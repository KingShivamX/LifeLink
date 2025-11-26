import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeftIcon,
  HeartIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  BuildingOffice2Icon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { requestsAPI } from '../services/api';
import { bloodTypeStyles } from '../utils';

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['bloodRequest', id],
    queryFn: async () => {
      const response = await requestsAPI.getRequestById(id);
      return response.data?.data?.request || response.data?.request || response.data;
    }
  });

  const request = data;

  const getUrgencyConfig = (urgency) => {
    const configs = {
      critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500', label: 'CRITICAL', icon: '🚨' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500', label: 'URGENT', icon: '⚠️' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500', label: 'MODERATE', icon: '📋' },
      low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500', label: 'ROUTINE', icon: '✓' }
    };
    return configs[urgency] || configs.low;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">Request Not Found</h2>
            <p className="text-red-700 mb-6">The blood request you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/requests')}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Requests
            </button>
          </div>
        </div>
      </div>
    );
  }

  const urgencyConfig = getUrgencyConfig(request.urgencyLevel);

  return (
    <>
      <Helmet>
        <title>Blood Request Details - LifeLink</title>
        <meta name="description" content="View detailed information about this blood donation request" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/requests')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span className="font-medium">Back to Requests</span>
          </motion.button>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-2xl shadow-xl overflow-hidden border-l-8 ${urgencyConfig.border}`}
          >
            {/* Header */}
            <div className={`${urgencyConfig.bg} px-8 py-6 border-b border-gray-200`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`px-4 py-2 text-lg font-bold rounded-full ${bloodTypeStyles[request.patient?.bloodType]}`}>
                    {request.patient?.bloodType}
                  </div>
                  <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold ${urgencyConfig.bg} ${urgencyConfig.text} border-2 ${urgencyConfig.border}`}>
                    <span>{urgencyConfig.icon}</span>
                    <span>{urgencyConfig.label}</span>
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">
                    {request.bloodRequirement?.unitsNeeded} {request.bloodRequirement?.unitsNeeded === 1 ? 'Unit' : 'Units'}
                  </div>
                  <div className="text-sm text-gray-600">Blood Needed</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Patient Information */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <UserIcon className="h-6 w-6 text-red-600" />
                  <span>Patient Information</span>
                </h2>
                <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Name:</span>
                      <p className="text-gray-900 font-semibold">{request.patient?.firstName} {request.patient?.lastName}</p>
                    </div>
                    {request.patient?.age && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Age:</span>
                        <p className="text-gray-900 font-semibold">{request.patient.age} years</p>
                      </div>
                    )}
                    {request.patient?.gender && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Gender:</span>
                        <p className="text-gray-900 font-semibold capitalize">{request.patient.gender}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-600">Blood Type:</span>
                      <p className="text-gray-900 font-semibold">{request.patient?.bloodType}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Medical Information */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <BuildingOffice2Icon className="h-6 w-6 text-red-600" />
                  <span>Medical Information</span>
                </h2>
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Hospital:</span>
                    <p className="text-gray-900 font-semibold">{request.medicalInfo?.hospital?.name || request.medicalInfo?.hospital}</p>
                    <p className="text-sm text-gray-600">{request.medicalInfo?.hospital?.address}</p>
                  </div>
                  
                  {request.medicalInfo?.doctor?.name && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Doctor:</span>
                      <p className="text-gray-900 font-semibold">{request.medicalInfo.doctor.name}</p>
                    </div>
                  )}

                  {(request.medicalInfo?.diagnosis || request.medicalInfo?.condition) && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Medical Condition:</span>
                      <p className="text-gray-900">{request.medicalInfo?.diagnosis || request.medicalInfo?.condition}</p>
                    </div>
                  )}

                  <div>
                    <span className="text-sm font-medium text-gray-600">Transfusion Date:</span>
                    <p className="text-gray-900 font-semibold flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{new Date(request.medicalInfo?.transfusionDate).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Requester Information */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <PhoneIcon className="h-6 w-6 text-red-600" />
                  <span>Contact Information</span>
                </h2>
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Requester:</span>
                    <p className="text-gray-900 font-semibold">{request.requester?.name}</p>
                    {request.requester?.relationship && (
                      <p className="text-sm text-gray-600 capitalize">({request.requester.relationship})</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {request.requester?.phone && (
                      <a
                        href={`tel:${request.requester.phone}`}
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-200 font-medium"
                      >
                        <PhoneIcon className="h-5 w-5" />
                        <span>Call {request.requester.phone}</span>
                      </a>
                    )}
                    
                    {request.requester?.email && (
                      <a
                        href={`mailto:${request.requester.email}`}
                        className="flex items-center justify-center space-x-2 bg-white border-2 border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition-colors font-medium"
                      >
                        <EnvelopeIcon className="h-5 w-5" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>
                </div>
              </section>

              {/* Location */}
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <MapPinIcon className="h-6 w-6 text-red-600" />
                  <span>Location</span>
                </h2>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-900">{request.location?.address}</p>
                  <p className="text-gray-600">{request.location?.city}, {request.location?.state} {request.location?.zipCode}</p>
                </div>
              </section>

              {/* Additional Notes */}
              {request.notes && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Notes</h2>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-gray-900">{request.notes}</p>
                  </div>
                </section>
              )}

              {/* Posted Time */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4" />
                  <span>Posted on {new Date(request.createdAt).toLocaleString()}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default RequestDetail;
