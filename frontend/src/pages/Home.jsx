import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  HeartIcon, 
  MapPinIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  UserGroupIcon, 
  PhoneIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const Home = () => {
  const [featuresRef, featuresInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const [statsRef, statsInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  })

  const features = [
    {
      icon: MapPinIcon,
      title: 'Find Nearby Donors',
      description: 'Locate compatible blood donors in your area using our interactive map powered by real-time location data.'
    },
    {
      icon: ClockIcon,
      title: 'Real-Time Availability',
      description: 'Get instant updates on donor availability and blood type compatibility for urgent medical needs.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Verified Community',
      description: 'All donors are verified through our secure registration process ensuring safety and reliability.'
    },
    {
      icon: UserGroupIcon,
      title: 'Community Network',
      description: 'Join thousands of life-savers in your community who are ready to help during emergencies.'
    }
  ];

  const stats = [
    { label: 'Lives Saved', value: '1,247', color: 'text-primary-600' },
    { label: 'Active Donors', value: '3,892', color: 'text-life-600' },
    { label: 'Emergency Responses', value: '156', color: 'text-red-600' },
    { label: 'Cities Connected', value: '28', color: 'text-blue-600' }
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <>
      <Helmet>
        <title>LifeLink - Community Blood Donor Network | Save Lives Together</title>
        <meta name="description" content="Join LifeLink's community of blood donors. Find nearby donors, register as a donor, or request blood in emergencies. Real-time matching, verified donors, immediate response." />
        <meta name="keywords" content="blood donation, emergency blood, blood donors, community network, healthcare, life saving" />
      </Helmet>
      
      <div className="bg-white">
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-sm">
          <div className="font-semibold">WT Project</div>
          <div className="text-gray-300">Guide: Dr. Padma Nimbore Mam</div>
        </div>
      </div>
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-life-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/5 to-life-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-primary-100 p-2 rounded-full">
                  <HeartIcon className="h-6 w-6 text-primary-600" />
                </div>
                <span className="text-primary-600 font-semibold text-sm tracking-wide uppercase">Life-Saving Network</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight mb-6">
                Connect. 
                <span className="text-primary-600 block">Save Lives.</span>
                <span className="text-life-600 block">Together.</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-lg">
                LifeLink connects blood donors and recipients in real-time within your community. 
                Making blood donation faster, transparent, and accessible during emergencies.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
                <Link 
                  to="/register"
                  className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                >
                  <HeartIcon className="h-5 w-5" />
                  <span>Become a Donor</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                
                <Link 
                  to="/find-donors"
                  className="bg-white text-primary-600 border-2 border-primary-200 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <MapPinIcon className="h-5 w-5" />
                  <span>Find Donors</span>
                </Link>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <PhoneIcon className="h-6 w-6 text-red-600 animate-bounce-gentle" />
                  <h3 className="text-lg font-semibold text-red-800">Emergency Blood Request?</h3>
                </div>
                <p className="text-red-700 mb-4">Need blood urgently? Our emergency network can help you find donors immediately.</p>
                <Link 
                  to="/emergency"
                  className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 inline-flex items-center space-x-2"
                >
                  <span>Request Emergency Help</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="text-center mb-6">
                  <HeartIcon className="h-16 w-16 text-primary-500 mx-auto mb-4 animate-pulse-slow" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Blood Type Compatibility</h3>
                  <p className="text-gray-600">Find your match in our donor network</p>
                </div>
                
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {bloodTypes.map((type, index) => (
                    <div key={type} className={`bg-gradient-to-br ${
                      index % 4 === 0 ? 'from-primary-100 to-primary-200' :
                      index % 4 === 1 ? 'from-life-100 to-life-200' :
                      index % 4 === 2 ? 'from-blue-100 to-blue-200' :
                      'from-purple-100 to-purple-200'
                    } rounded-lg p-3 text-center font-bold text-gray-800 hover:scale-105 transition-transform duration-200 cursor-pointer`}>
                      {type}
                    </div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-life-600" />
                    <span>Real-time donor availability</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-life-600" />
                    <span>Verified donor profiles</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <CheckCircleIcon className="h-4 w-4 text-life-600" />
                    <span>Emergency response network</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-4xl font-display font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
              How LifeLink <span className="text-primary-600">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform connects you with verified donors in your community through an intelligent matching system
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                  <div className="bg-gradient-to-br from-primary-50 to-life-50 p-4 rounded-xl w-fit mb-6">
                    <IconComponent className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary-600 to-life-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-bold text-white mb-6">
            Ready to Save Lives?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join our community of life-savers and make a difference in someone's emergency moment
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/register"
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <HeartIcon className="h-5 w-5" />
              <span>Register as Donor</span>
            </Link>
            <Link 
              to="/request"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Request Blood</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}

export default Home
