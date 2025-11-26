import { Link } from 'react-router-dom'
import {
    HeartIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline'

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="col-span-1 lg:col-span-2">
                        <div className="flex items-center space-x-3 mb-4">
                            <HeartIcon className="h-8 w-8 text-primary-400 animate-pulse-slow" />
                            <div>
                                <h2 className="text-xl font-display font-bold">
                                    <span className="text-primary-400">
                                        Life
                                    </span>
                                    <span className="text-life-400">Link</span>
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    Community Blood Network
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                            Connecting blood donors and recipients in real-time
                            within our community. Making blood donation faster,
                            transparent, and accessible during emergencies.
                        </p>
                        <div className="flex space-x-4">
                            <div className="bg-primary-600 p-3 rounded-full">
                                <PhoneIcon className="h-5 w-5" />
                            </div>
                            <div className="bg-life-600 p-3 rounded-full">
                                <HeartIcon className="h-5 w-5" />
                            </div>
                            <div className="bg-blue-600 p-3 rounded-full">
                                <MapPinIcon className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-primary-300">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
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
                                    to="/emergency"
                                    className="text-gray-300 hover:text-red-400 transition-colors duration-200 font-medium"
                                >
                                    Emergency Help
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-primary-300">
                            Contact Info
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <PhoneIcon className="h-5 w-5 text-primary-400 flex-shrink-0" />
                                <span className="text-gray-300">
                                    Emergency: 911
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <EnvelopeIcon className="h-5 w-5 text-primary-400 flex-shrink-0" />
                                <span className="text-gray-300">
                                    help@lifelink.org
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <MapPinIcon className="h-5 w-5 text-primary-400 flex-shrink-0" />
                                <span className="text-gray-300">
                                    Community Network
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm">
                            © 2025 LifeLink Community Blood Network. Saving
                            lives together.
                        </p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                            >
                                Privacy Policy
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                            >
                                Terms of Service
                            </a>
                            <a
                                href="#"
                                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                            >
                                About Us
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
