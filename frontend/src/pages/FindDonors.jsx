import React, { useState, useEffect } from 'react';
import { MapPinIcon, FunnelIcon, UserIcon, PhoneIcon, ClockIcon, HeartIcon } from '@heroicons/react/24/outline';

const FindDonors = () => {
  const [filters, setFilters] = useState({
    bloodType: '',
    distance: '10',
    availability: 'all'
  });

  const [donors, setDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const mockDonors = [
    {
      id: 1,
      name: 'Sarah Mitchell',
      bloodType: 'O+',
      distance: '0.8 miles',
      availability: 'Available now',
      lastDonation: '3 months ago',
      totalDonations: 12,
      rating: 4.9,
      phone: '(555) 123-4567',
      location: { lat: 40.7589, lng: -73.9851 }
    },
    {
      id: 2,
      name: 'Michael Chen',
      bloodType: 'A+',
      distance: '1.2 miles',
      availability: 'Available today',
      lastDonation: '2 months ago',
      totalDonations: 8,
      rating: 5.0,
      phone: '(555) 987-6543',
      location: { lat: 40.7614, lng: -73.9776 }
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      bloodType: 'B+',
      distance: '2.1 miles',
      availability: 'Available tomorrow',
      lastDonation: '1 month ago',
      totalDonations: 15,
      rating: 4.8,
      phone: '(555) 456-7890',
      location: { lat: 40.7505, lng: -73.9934 }
    },
    {
      id: 4,
      name: 'James Wilson',
      bloodType: 'AB-',
      distance: '2.8 miles',
      availability: 'Available this week',
      lastDonation: '4 months ago',
      totalDonations: 6,
      rating: 4.7,
      phone: '(555) 321-0987',
      location: { lat: 40.7549, lng: -73.9840 }
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      bloodType: 'O-',
      distance: '3.5 miles',
      availability: 'Available now',
      lastDonation: '2 months ago',
      totalDonations: 20,
      rating: 5.0,
      phone: '(555) 654-3210',
      location: { lat: 40.7648, lng: -73.9808 }
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setDonors(mockDonors);
      setIsLoading(false);
    }, 1500);
  }, []);

  const filteredDonors = donors.filter(donor => {
    if (filters.bloodType && donor.bloodType !== filters.bloodType) return false;
    if (filters.availability !== 'all') {
      if (filters.availability === 'now' && !donor.availability.includes('now')) return false;
      if (filters.availability === 'today' && !donor.availability.includes('today') && !donor.availability.includes('now')) return false;
    }
    return true;
  });

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactDonor = (donor) => {
    window.open(`tel:${donor.phone}`);
  };

  const getAvailabilityColor = (availability) => {
    if (availability.includes('now')) return 'text-green-600 bg-green-100';
    if (availability.includes('today')) return 'text-blue-600 bg-blue-100';
    if (availability.includes('tomorrow')) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-life-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            Find <span className="text-primary-600">Blood Donors</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with verified donors in your area. All donors are pre-screened and ready to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center space-x-3 mb-6">
                <FunnelIcon className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-semibold text-gray-900">Search Filters</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type Needed</label>
                  <select
                    name="bloodType"
                    value={filters.bloodType}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All blood types</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Distance: {filters.distance} miles
                  </label>
                  <input
                    type="range"
                    name="distance"
                    min="1"
                    max="50"
                    value={filters.distance}
                    onChange={handleFilterChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 mile</span>
                    <span>50 miles</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    name="availability"
                    value={filters.availability}
                    onChange={handleFilterChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All availability</option>
                    <option value="now">Available now</option>
                    <option value="today">Available today</option>
                    <option value="week">Available this week</option>
                  </select>
                </div>

                <div className="bg-gradient-to-r from-primary-50 to-life-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Quick Tip</h3>
                  <p className="text-sm text-gray-600">
                    Universal donors (O-) can donate to anyone. Consider reaching out to O- donors for emergency situations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
              <div className="bg-gray-800 h-80 flex items-center justify-center">
                <div className="text-center text-white">
                  <MapPinIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Interactive Donor Map</h3>
                  <p className="text-gray-300">Map integration with Google Maps API</p>
                  <p className="text-sm text-gray-400 mt-2">Showing {filteredDonors.length} donors in your area</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Available Donors ({filteredDonors.length})
                </h3>
                <div className="text-sm text-gray-500">
                  Showing results within {filters.distance} miles
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="bg-gray-200 rounded-full h-16 w-16"></div>
                        <div className="flex-1 space-y-2">
                          <div className="bg-gray-200 h-4 rounded w-1/3"></div>
                          <div className="bg-gray-200 h-3 rounded w-1/4"></div>
                          <div className="bg-gray-200 h-3 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDonors.map((donor) => (
                    <div key={donor.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="bg-gradient-to-br from-primary-100 to-life-100 rounded-full p-4">
                              <UserIcon className="h-8 w-8 text-primary-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">{donor.name}</h4>
                                <div className="flex items-center space-x-1">
                                  <HeartIcon className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-sm font-medium text-gray-600">{donor.rating}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="flex items-center space-x-2">
                                  <div className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    {donor.bloodType}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <MapPinIcon className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">{donor.distance}</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <ClockIcon className="h-4 w-4 text-gray-400" />
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getAvailabilityColor(donor.availability)}`}>
                                    {donor.availability}
                                  </span>
                                </div>
                                
                                <div className="text-sm text-gray-600">
                                  {donor.totalDonations} donations
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                  Last donation: {donor.lastDonation}
                                </p>
                                
                                <button
                                  onClick={() => contactDonor(donor)}
                                  className="bg-gradient-to-r from-primary-600 to-life-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-primary-700 hover:to-life-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                  <PhoneIcon className="h-4 w-4" />
                                  <span>Contact</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredDonors.length === 0 && (
                    <div className="text-center py-12">
                      <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No donors found</h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your filters or expanding your search radius
                      </p>
                      <button 
                        onClick={() => setFilters({ bloodType: '', distance: '25', availability: 'all' })}
                        className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
                      >
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-red-800 mb-4">Can't Find What You Need?</h3>
          <p className="text-red-700 mb-6">
            If you can't find a compatible donor, consider posting an emergency request to reach our entire network.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a 
              href="/emergency"
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <PhoneIcon className="h-5 w-5" />
              <span>Emergency Request</span>
            </a>
            <a 
              href="/request"
              className="bg-white text-red-600 border-2 border-red-300 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors duration-200"
            >
              Regular Blood Request
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindDonors;
