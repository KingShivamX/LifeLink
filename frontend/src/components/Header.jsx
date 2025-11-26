import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HeartIcon, MapPinIcon, UserPlusIcon, PhoneIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    { name: 'Home', path: '/', icon: HeartIcon },
    { name: 'Find Donors', path: '/find-donors', icon: MapPinIcon },
    { name: 'Register as Donor', path: '/register', icon: UserPlusIcon },
    { name: 'Request Blood', path: '/request', icon: HeartIcon },
  ];

  return (
    <header className="bg-white shadow-lg border-b-4 border-primary-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <HeartIcon className="h-10 w-10 text-primary-600 animate-pulse-slow" />
              <div className="absolute inset-0 bg-primary-100 rounded-full -z-10 transform scale-150 animate-ping opacity-20"></div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-gray-900">
                <span className="text-primary-600">Life</span>
                <span className="text-life-600">Link</span>
              </h1>
              <p className="text-sm text-gray-600 font-medium">Community Blood Network</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-50 text-primary-700 border-2 border-primary-200'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            <Link
              to="/emergency"
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
            >
              <PhoneIcon className="h-5 w-5" />
              <span>EMERGENCY</span>
            </Link>
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-50"
          >
            {isMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden border-t border-gray-200 mt-4"
            >
              <div className="space-y-2 pt-4 pb-4">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-primary-50 text-primary-700 border-2 border-primary-200'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <Link
                to="/emergency"
                onClick={() => setIsMenuOpen(false)}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg flex items-center space-x-3 mt-4"
              >
                <PhoneIcon className="h-5 w-5" />
                <span>EMERGENCY REQUEST</span>
              </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export default Header
