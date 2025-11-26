import { Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'

// Components
import Header from './components/Header'
import Footer from './components/Footer'

// Pages
import Home from './pages/Home'
import FindDonors from './pages/FindDonors'
import DonorRegistration from './pages/DonorRegistration'
import RequestBlood from './pages/RequestBlood'
import DonorDetail from './pages/DonorDetail'
import ViewRequests from './pages/ViewRequests'
import RequestDetail from './pages/RequestDetail'

// Hooks
import { useScrollToTop } from './hooks/useScrollToTop'
import { useRealTimeUpdates, useGlobalRealTimeUpdates } from './hooks/useRealTimeUpdates'

function App() {
  useScrollToTop()
  useRealTimeUpdates() // Enable real-time features
  useGlobalRealTimeUpdates() // Enable global updates

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  }

  return (
    <>
      <Helmet>
        <title>LifeLink - Community Blood Donor Network</title>
        <meta name="description" content="Connect with blood donors in your community. LifeLink helps save lives through real-time donor matching and emergency response." />
        <link rel="canonical" href="https://lifelink.health" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Home />
                  </motion.div>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <DonorRegistration />
                  </motion.div>
                } 
              />
              <Route 
                path="/find-donors" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <FindDonors />
                  </motion.div>
                } 
              />
              <Route 
                path="/request" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <RequestBlood />
                  </motion.div>
                } 
              />
              <Route 
                path="/donor/:id" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <DonorDetail />
                  </motion.div>
                } 
              />
              <Route 
                path="/requests" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <ViewRequests />
                  </motion.div>
                } 
              />
              <Route 
                path="/request/:id" 
                element={
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <RequestDetail />
                  </motion.div>
                } 
              />
            </Routes>
          </AnimatePresence>
        </main>
        
        <Footer />
      </div>
    </>
  )
}

export default App
