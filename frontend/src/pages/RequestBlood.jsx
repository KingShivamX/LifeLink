import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { HeartIcon, MapPinIcon, ClockIcon, UserIcon, PhoneIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { requestsAPI } from '../services/api';

const RequestBlood = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState(null);
  
  const [formData, setFormData] = useState({
    patientName: '',
    requestorName: '',
    relationship: '',
    contactPhone: '',
    contactEmail: '',
    bloodType: '',
    unitsNeeded: '1',
    urgencyLevel: 'routine',
    hospital: '',
    hospitalAddress: '',
    city: '',
    zipCode: '',
    medicalCondition: '',
    additionalNotes: '',
    preferredDate: '',
    preferredTime: '',
    doctorName: '',
    doctorPhone: ''
  });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const relationships = ['Self', 'Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'];
  const urgencyLevels = [
    { value: 'routine', label: 'Routine (1-2 weeks)', color: 'bg-green-100 text-green-800' },
    { value: 'urgent', label: 'Urgent (24-48 hours)', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'critical', label: 'Critical (Immediate)', color: 'bg-red-100 text-red-800' }
  ];

  // API mutation for creating blood request
  const createRequestMutation = useMutation({
    mutationFn: (requestData) => requestsAPI.createRequest(requestData),
    onSuccess: (response) => {
      const requestId = response.data?.data?.request?._id || response.data?.data?._id;
      setCreatedRequestId(requestId);
      setShowSuccessModal(true);
      toast.success('Blood request submitted successfully!');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to submit blood request';
      toast.error(errorMessage);
      console.error('Error creating request:', error);
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const transformFormData = (formData) => {
    // Map urgency level
    const urgencyMap = {
      'routine': 'low',
      'urgent': 'high',
      'critical': 'critical'
    };

    // Split patient name
    const nameParts = formData.patientName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || 'N/A';

    // Combine date and time for transfusion date
    const transfusionDate = formData.preferredDate && formData.preferredTime
      ? new Date(`${formData.preferredDate}T${formData.preferredTime}`)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow

    return {
      requestType: formData.urgencyLevel === 'critical' ? 'emergency' : 'regular',
      urgencyLevel: urgencyMap[formData.urgencyLevel] || 'low',
      patient: {
        firstName,
        lastName,
        age: null,
        gender: null
      },
      requestor: {
        name: formData.requestorName,
        phone: formData.contactPhone,
        email: formData.contactEmail,
        relationship: formData.relationship
      },
      bloodRequirement: {
        bloodType: formData.bloodType,
        unitsNeeded: parseInt(formData.unitsNeeded),
        componentType: 'whole_blood'
      },
      medicalInfo: {
        hospital: formData.hospital,
        hospitalAddress: formData.hospitalAddress,
        condition: formData.medicalCondition || 'Not specified',
        transfusionDate,
        doctorName: formData.doctorName,
        doctorContact: formData.doctorPhone || formData.contactPhone
      },
      location: {
        type: 'Point',
        coordinates: [0, 0], // Default coordinates (can be improved with geocoding)
        address: formData.hospitalAddress,
        city: formData.city,
        state: 'Unknown',
        zipCode: formData.zipCode
      },
      notes: formData.additionalNotes || ''
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Transform and submit data
    const requestData = transformFormData(formData);
    createRequestMutation.mutate(requestData);
  };

  const getUrgencyColor = (level) => {
    const urgency = urgencyLevels.find(u => u.value === level);
    return urgency ? urgency.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-life-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-100 p-4 rounded-full">
              <HeartIcon className="h-12 w-12 text-primary-600 animate-pulse-slow" />
            </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            Request <span className="text-primary-600">Blood Donation</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with our network of verified donors. Fill out this form and we'll help you find compatible donors in your area.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-life-600 px-8 py-6">
            <div className="flex items-center space-x-3">
              <HeartIcon className="h-8 w-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">Blood Request Form</h2>
                <p className="text-primary-100">Help us connect you with the right donors</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-primary-600" />
                <span>Patient & Contact Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Name</label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Full name of patient"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name (Requestor)</label>
                  <input
                    type="text"
                    name="requestorName"
                    value={formData.requestorName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship to Patient</label>
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Select relationship</option>
                    {relationships.map(rel => (
                      <option key={rel} value={rel.toLowerCase()}>{rel}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <HeartIcon className="h-5 w-5 text-primary-600" />
                <span>Blood Requirements</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type Needed</label>
                  <select
                    name="bloodType"
                    value={formData.bloodType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Select blood type</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Units Needed</label>
                  <select
                    name="unitsNeeded"
                    value={formData.unitsNeeded}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <option key={num} value={num}>{num} unit{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                  <select
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    required
                  >
                    {urgencyLevels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Current urgency:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyColor(formData.urgencyLevel)}`}>
                    {urgencyLevels.find(u => u.value === formData.urgencyLevel)?.label}
                  </span>
                </div>
                {formData.urgencyLevel === 'critical' && (
                  <div className="flex items-start space-x-2 text-red-700 text-sm">
                    <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>For critical situations, also call 911 or go to the nearest emergency room</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <MapPinIcon className="h-5 w-5 text-primary-600" />
                <span>Hospital & Location Details</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                  <input
                    type="text"
                    name="hospital"
                    value={formData.hospital}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Name of hospital or medical facility"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Address</label>
                  <input
                    type="text"
                    name="hospitalAddress"
                    value={formData.hospitalAddress}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Hospital street address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="City name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="12345"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <ClockIcon className="h-5 w-5 text-primary-600" />
                <span>Timing & Medical Details</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                  <input
                    type="time"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Dr. Smith"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Phone</label>
                  <input
                    type="tel"
                    name="doctorPhone"
                    value={formData.doctorPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medical Condition (Optional)</label>
                  <input
                    type="text"
                    name="medicalCondition"
                    value={formData.medicalCondition}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Brief description of condition requiring blood transfusion"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    name="additionalNotes"
                    value={formData.additionalNotes}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                    placeholder="Any additional information that might help donors understand your situation..."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-6">
              <button
                type="submit"
                disabled={createRequestMutation.isPending}
                className={`flex-1 bg-gradient-to-r from-primary-600 to-life-600 text-white px-8 py-4 rounded-xl font-semibold transform transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 ${
                  createRequestMutation.isPending 
                    ? 'opacity-70 cursor-not-allowed' 
                    : 'hover:from-primary-700 hover:to-life-700 hover:scale-105'
                }`}
              >
                {createRequestMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <HeartIcon className="h-5 w-5" />
                    <span>Submit Blood Request</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                disabled={createRequestMutation.isPending}
                className="flex-1 sm:flex-none bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Draft
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What happens after you submit?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-500 text-white rounded-full p-3 w-fit mx-auto mb-4">
                <span className="text-lg font-bold">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Instant Matching</h4>
              <p className="text-gray-600 text-sm">
                Our system immediately searches for compatible donors in your area and sends out notifications.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-500 text-white rounded-full p-3 w-fit mx-auto mb-4">
                <span className="text-lg font-bold">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Donor Responses</h4>
              <p className="text-gray-600 text-sm">
                Interested donors will contact you directly. You'll receive calls and messages within hours.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-life-500 text-white rounded-full p-3 w-fit mx-auto mb-4">
                <span className="text-lg font-bold">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Coordination</h4>
              <p className="text-gray-600 text-sm">
                We help coordinate the donation process with your hospital and chosen donors.
              </p>
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl transform transition-all">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <CheckCircleIcon className="h-10 w-10 text-green-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Request Submitted Successfully!
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Your blood request has been created and compatible donors in your area are being notified.
                  {createdRequestId && (
                    <span className="block mt-2 text-sm text-gray-500">
                      Request ID: <code className="bg-gray-100 px-2 py-1 rounded">{createdRequestId}</code>
                    </span>
                  )}
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/requests')}
                    className="w-full bg-gradient-to-r from-primary-600 to-life-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-life-700 transition-all duration-200"
                  >
                    View All Requests
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowSuccessModal(false);
                      // Reset form
                      setFormData({
                        patientName: '',
                        requestorName: '',
                        relationship: '',
                        contactPhone: '',
                        contactEmail: '',
                        bloodType: '',
                        unitsNeeded: '1',
                        urgencyLevel: 'routine',
                        hospital: '',
                        hospitalAddress: '',
                        city: '',
                        zipCode: '',
                        medicalCondition: '',
                        additionalNotes: '',
                        preferredDate: '',
                        preferredTime: '',
                        doctorName: '',
                        doctorPhone: ''
                      });
                    }}
                    className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-200"
                  >
                    Create Another Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestBlood;
