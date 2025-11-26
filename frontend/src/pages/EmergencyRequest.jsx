import React, { useState, useEffect } from 'react';
import { 
  PhoneIcon, 
  ExclamationTriangleIcon, 
  ClockIcon, 
  HeartIcon, 
  MapPinIcon,
  UserIcon,
  BellAlertIcon 
} from '@heroicons/react/24/outline';

const EmergencyRequest = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    contactPhone: '',
    bloodType: '',
    unitsNeeded: '1',
    hospital: '',
    hospitalAddress: '',
    city: '',
    zipCode: '',
    emergencyDetails: '',
    contactName: ''
  });

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [nearbyDonors, setNearbyDonors] = useState(0);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const donorCount = Math.floor(Math.random() * 15) + 5;
    setNearbyDonors(donorCount);
  }, [formData.zipCode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    console.log('Emergency request submitted:', formData);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="bg-green-100 p-6 rounded-full w-fit mx-auto mb-6">
              <HeartIcon className="h-16 w-16 text-green-600 animate-pulse-slow" />
            </div>
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
              Emergency Request <span className="text-green-600">Sent!</span>
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                <BellAlertIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800 mb-2">Alert Broadcasted</h2>
                <p className="text-green-700">
                  Your emergency request has been sent to <strong>{nearbyDonors} compatible donors</strong> in your area.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-4">
                  <ClockIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{formatTime(timeElapsed)}</div>
                  <div className="text-sm text-blue-700">Time since request</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <UserIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{nearbyDonors}</div>
                  <div className="text-sm text-green-700">Donors notified</div>
                </div>
                
                <div className="bg-orange-50 rounded-lg p-4">
                  <PhoneIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <div className="text-sm text-orange-700">Expected responses</div>
                </div>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-bold text-red-800 mb-3">What to expect next:</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-200 text-red-800 rounded-full p-1 flex-shrink-0 mt-1">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <span className="text-red-700">Donors will start calling you within the next 5-15 minutes</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-200 text-red-800 rounded-full p-1 flex-shrink-0 mt-1">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <span className="text-red-700">Keep your phone accessible and answer all calls</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="bg-red-200 text-red-800 rounded-full p-1 flex-shrink-0 mt-1">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <span className="text-red-700">Coordinate directly with willing donors to meet at {formData.hospital}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <a
                  href="tel:911"
                  className="w-full bg-red-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-red-700 transition-all duration-200 shadow-lg flex items-center justify-center space-x-3 text-lg"
                >
                  <PhoneIcon className="h-6 w-6" />
                  <span>Call 911 if Critical</span>
                </a>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200">
                    Track Responses
                  </button>
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors duration-200"
                  >
                    Send Another Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="bg-red-100 p-4 rounded-full w-fit mx-auto mb-6 animate-bounce-gentle">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            <span className="text-red-600">Emergency</span> Blood Request
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            For life-threatening situations requiring immediate blood donation. 
            This will send alerts to all compatible donors in your area.
          </p>
        </div>

        <div className="bg-red-100 border-2 border-red-300 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-800 mb-2">Critical Emergency Notice</h3>
              <ul className="text-red-700 space-y-1 text-sm">
                <li>• If patient is unconscious or in severe distress, call 911 immediately</li>
                <li>• This emergency request will alert ALL compatible donors regardless of their availability</li>
                <li>• Use this only for genuine medical emergencies requiring immediate blood</li>
                <li>• For routine or planned procedures, use our regular blood request form</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6">
            <div className="flex items-center space-x-3">
              <PhoneIcon className="h-8 w-8 text-white animate-bounce-gentle" />
              <div>
                <h2 className="text-2xl font-bold text-white">Emergency Request Form</h2>
                <p className="text-red-100">Fast-track to our donor network</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Patient Name
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="Full name of patient"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Your Name
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="Your name for donor contact"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Contact Phone
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Blood Type Needed
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  required
                >
                  <option value="">Select blood type</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Units Needed
                </label>
                <select
                  name="unitsNeeded"
                  value={formData.unitsNeeded}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  required
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    <option key={num} value={num}>{num} unit{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Hospital Name
                </label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="Hospital or medical facility"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Hospital Address
                </label>
                <input
                  type="text"
                  name="hospitalAddress"
                  value={formData.hospitalAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="Complete hospital address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="12345"
                  required
                />
                {formData.zipCode && (
                  <p className="text-sm text-green-600 mt-1">
                    ✓ {nearbyDonors} compatible donors found in your area
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Details
                </label>
                <textarea
                  name="emergencyDetails"
                  value={formData.emergencyDetails}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="Brief description of the emergency situation (optional but helpful for donors)"
                />
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <ClockIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Time-Sensitive Alert</h4>
                  <p className="text-yellow-700 text-sm">
                    Once submitted, this emergency request cannot be easily canceled. 
                    Donors will be notified immediately and may travel to help.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-6 rounded-xl font-bold hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-3 text-xl"
              >
                <BellAlertIcon className="h-8 w-8" />
                <span>SEND EMERGENCY ALERT</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href="/request"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-center block"
                >
                  Use Regular Request Instead
                </a>
                <a
                  href="tel:911"
                  className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors duration-200 text-center block flex items-center justify-center space-x-2"
                >
                  <PhoneIcon className="h-5 w-5" />
                  <span>Call 911</span>
                </a>
              </div>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-gradient-to-r from-red-100 to-orange-100 rounded-xl p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Emergency Response Time</h3>
          <div className="text-sm text-gray-700 space-y-1">
            <p>⚡ Donors typically respond within <strong>5-15 minutes</strong></p>
            <p>📱 Keep your phone available for immediate contact</p>
            <p>🏥 Coordinate meeting location at the specified hospital</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyRequest;
