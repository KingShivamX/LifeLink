import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { 
  HeartIcon, 
  UserPlusIcon, 
  ShieldCheckIcon, 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

import { donorsAPI } from '../services/api'
import { useAppStore } from '../store/useStore'
import { bloodTypeStyles, dateUtils, locationUtils } from '../utils'

const DonorRegistration = () => {
  const navigate = useNavigate()
  const { getCurrentLocation, setUserLocation } = useAppStore()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      bloodType: '',
      dateOfBirth: '',
      weight: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA'
      },
      location: {
        coordinates: []
      },
      medicalConditions: [],
      medications: [],
      availability: {
        isAvailable: true,
        emergencyOnly: false
      },
      agreedToTerms: false
    }
  })

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  
  const steps = [
    { number: 1, title: 'Personal Info', icon: UserPlusIcon },
    { number: 2, title: 'Medical Info', icon: ShieldCheckIcon },
    { number: 3, title: 'Location', icon: MapPinIcon },
    { number: 4, title: 'Availability', icon: HeartIcon }
  ]

  const getCurrentLocationHandler = async () => {
    setLocationLoading(true)
    try {
      const location = await getCurrentLocation()
      setValue('location.coordinates', [location.longitude, location.latitude])
      setUserLocation(location)
      toast.success('Location detected successfully!')
    } catch (error) {
      toast.error('Failed to get location. Please enter manually.')
    } finally {
      setLocationLoading(false)
    }
  }

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep)
    const isValid = await trigger(fieldsToValidate)
    
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const getFieldsForStep = (step) => {
    switch (step) {
      case 1:
        return ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword']
      case 2:
        return ['bloodType', 'dateOfBirth', 'weight']
      case 3:
        return ['address.street', 'address.city', 'address.state', 'address.zipCode']
      case 4:
        return ['agreedToTerms']
      default:
        return []
    }
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    
    try {
      // Validate location coordinates
      if (!data.location.coordinates || data.location.coordinates.length !== 2) {
        toast.error('Please set your location before submitting')
        setCurrentStep(3)
        return
      }

      const response = await donorsAPI.registerDonor(data)
      
      toast.success('Registration successful! Welcome to LifeLink!')
      
      setTimeout(() => {
        navigate('/', { 
          state: { 
            message: 'Registration completed successfully! You can now help save lives.' 
          } 
        })
      }, 2000)
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === step.number
            const isCompleted = currentStep > step.number
            
            return (
              <div key={step.number} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                  ${isActive 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : isCompleted 
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }
                `}>
                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`
                    w-16 h-1 mx-2 transition-all duration-300
                    ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      <div className="text-center mt-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Step {currentStep}: {steps.find(s => s.number === currentStep)?.title}
        </h3>
      </div>
    </div>
  )

  const renderPersonalInfoStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            {...register('firstName', { 
              required: 'First name is required',
              minLength: { value: 2, message: 'Minimum 2 characters required' }
            })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            {...register('lastName', { 
              required: 'Last name is required',
              minLength: { value: 2, message: 'Minimum 2 characters required' }
            })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address *
        </label>
        <div className="relative">
          <EnvelopeIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
              }
            })}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="your.email@example.com"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number *
        </label>
        <div className="relative">
          <PhoneIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="tel"
            {...register('phone', { 
              required: 'Phone number is required',
              pattern: {
                value: /^\+?[\d\s\-\(\)]{10,}$/,
                message: 'Please enter a valid phone number'
              }
            })}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            type="password"
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <input
            type="password"
            {...register('confirmPassword', { 
              required: 'Please confirm your password',
              validate: value => value === watch('password') || 'Passwords do not match'
            })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirm password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>
    </motion.div>
  )

  const renderMedicalInfoStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Blood Type *
        </label>
        <div className="grid grid-cols-4 gap-3">
          {bloodTypes.map(type => (
            <label key={type} className="cursor-pointer">
              <input
                type="radio"
                {...register('bloodType', { required: 'Please select your blood type' })}
                value={type}
                className="sr-only"
              />
              <div className={`
                border-2 rounded-lg p-4 text-center font-semibold transition-all
                ${watch('bloodType') === type 
                  ? 'border-primary-600 bg-primary-50 text-primary-700' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}>
                {type}
              </div>
            </label>
          ))}
        </div>
        {errors.bloodType && (
          <p className="mt-1 text-sm text-red-600">{errors.bloodType.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            {...register('dateOfBirth', { 
              required: 'Date of birth is required',
              validate: value => {
                const age = dateUtils.getAge(value)
                if (age < 18) return 'You must be at least 18 years old'
                if (age > 65) return 'Maximum age limit is 65 years'
                return true
              }
            })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Weight (kg) *
          </label>
          <input
            type="number"
            {...register('weight', { 
              required: 'Weight is required',
              min: { value: 50, message: 'Minimum weight requirement is 50kg' },
              max: { value: 200, message: 'Maximum weight limit is 200kg' }
            })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.weight ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter weight in kg"
            min="50"
            max="200"
          />
          {errors.weight && (
            <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
          )}
        </div>
      </div>
    </motion.div>
  )

  const renderLocationStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-900">Quick Location Setup</h4>
            <p className="text-sm text-blue-700 mt-1">
              Allow location access for automatic setup, or enter manually below.
            </p>
          </div>
          <button
            type="button"
            onClick={getCurrentLocationHandler}
            disabled={locationLoading}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              ${locationLoading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }
            `}
          >
            {locationLoading ? 'Detecting...' : 'Auto-Detect'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Street Address *
        </label>
        <input
          {...register('address.street', { required: 'Street address is required' })}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
            errors.address?.street ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your street address"
        />
        {errors.address?.street && (
          <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            {...register('address.city', { required: 'City is required' })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.address?.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter city"
          />
          {errors.address?.city && (
            <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <input
            {...register('address.state', { required: 'State is required' })}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
              errors.address?.state ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter state"
          />
          {errors.address?.state && (
            <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ZIP Code *
        </label>
        <input
          {...register('address.zipCode', { required: 'ZIP code is required' })}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
            errors.address?.zipCode ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter ZIP code"
        />
        {errors.address?.zipCode && (
          <p className="mt-1 text-sm text-red-600">{errors.address.zipCode.message}</p>
        )}
      </div>
    </motion.div>
  )

  const renderAvailabilityStep = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            {...register('availability.isAvailable')}
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">
            I am available to donate blood
          </span>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            {...register('availability.emergencyOnly')}
            className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Contact me only for emergency cases
          </span>
        </label>
      </div>

      <div className="border-t pt-6">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            {...register('agreedToTerms', { 
              required: 'You must agree to the terms and conditions' 
            })}
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-0.5"
          />
          <div className="text-sm">
            <span className="font-medium text-gray-700">
              I agree to the{' '}
              <button
                type="button"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Terms and Conditions
              </button>
              {' '}and{' '}
              <button
                type="button"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                Privacy Policy
              </button>
            </span>
            <p className="text-gray-500 mt-1">
              By registering, you consent to being contacted by blood recipients 
              and medical facilities in need of your blood type.
            </p>
          </div>
        </label>
        {errors.agreedToTerms && (
          <p className="mt-2 text-sm text-red-600">{errors.agreedToTerms.message}</p>
        )}
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900">Ready to Save Lives!</h4>
            <p className="text-sm text-green-700 mt-1">
              You're all set to join our community of life-savers. Your generosity 
              could help save up to 3 lives with each donation.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep()
      case 2:
        return renderMedicalInfoStep()
      case 3:
        return renderLocationStep()
      case 4:
        return renderAvailabilityStep()
      default:
        return null
    }
  }

  return (
    <>
      <Helmet>
        <title>Become a Donor - LifeLink Blood Network</title>
        <meta name="description" content="Register as a blood donor with LifeLink. Join our community of life-savers and help save lives in your community." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-life-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-primary-100 p-4 rounded-full">
                <HeartIcon className="h-12 w-12 text-primary-600 animate-pulse" />
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              Become a <span className="text-primary-600">Life Saver</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Join our community of heroes and help save lives in your area. 
              Your donation could be the difference between life and death.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-primary-600 to-life-600 px-8 py-6">
              <div className="flex items-center space-x-3">
                <UserPlusIcon className="h-8 w-8 text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Donor Registration</h2>
                  <p className="text-primary-100">
                    Help us connect you with those who need your help
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {renderStepIndicator()}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <AnimatePresence mode="wait">
                  {renderStepContent()}
                </AnimatePresence>

                <div className="flex justify-between pt-6 border-t">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className={`
                      flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors
                      ${currentStep === 1 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Previous</span>
                  </button>

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                      <span>Next</span>
                      <ArrowRightIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`
                        flex items-center space-x-2 px-8 py-3 rounded-lg font-medium transition-colors
                        ${isSubmitting 
                          ? 'bg-gray-400 text-white cursor-not-allowed' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                        }
                      `}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <HeartIcon className="w-5 h-5" />
                          <span>Complete Registration</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default DonorRegistration