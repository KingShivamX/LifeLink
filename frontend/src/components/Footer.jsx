import { Link } from 'react-router-dom'
import {
    HeartIcon,
    PhoneIcon,
    EnvelopeIcon,
} from '@heroicons/react/24/outline'

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand Section */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <HeartIcon className="h-8 w-8 text-red-500 animate-pulse" />
                            <div>
                                <h2 className="text-2xl font-bold">
                                    <span className="text-red-500">Life</span>
                                    <span className="text-white">Link</span>
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    Community Blood Network
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-300 leading-relaxed max-w-md">
                            Connecting blood donors and recipients in real-time within our community. Making blood donation faster, transparent, and accessible during emergencies.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-red-400">
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/"
                                    className="text-gray-300 hover:text-white transition-colors duration-200"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/find-donors"
                                    className="text-gray-300 hover:text-white transition-colors duration-200"
                                >
                                    Find Donors
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/register"
                                    className="text-gray-300 hover:text-white transition-colors duration-200"
                                >
                                    Become a Donor
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/request"
                                    className="text-gray-300 hover:text-white transition-colors duration-200"
                                >
                                    Request Blood
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/requests"
                                    className="text-gray-300 hover:text-white transition-colors duration-200"
                                >
                                    View Requests
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-red-400">
                            Contact Info
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <PhoneIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <span className="text-gray-300">
                                    Emergency: 911
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <EnvelopeIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <a 
                                    href="mailto:support@lifelink.network"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    support@lifelink.network
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} LifeLink. Saving lives together.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <Link
                                to="/privacy"
                                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="/terms"
                                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                            >
                                Terms of Service
                            </Link>
                            <Link
                                to="/about"
                                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                            >
                                About Us
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
