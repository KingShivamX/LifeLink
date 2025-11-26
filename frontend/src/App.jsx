import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'

// Components
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

// Pages  
import Home from './pages/Home.jsx'
import DonorRegistration from './pages/DonorRegistration.jsx'
import FindDonors from './pages/FindDonors.jsx'
import RequestBlood from './pages/RequestBlood.jsx'
import EmergencyRequest from './pages/EmergencyRequest.jsx'

// Hooks
import { useScrollToTop } from './hooks/useScrollToTop'

function App() {
  useScrollToTop()

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
      
      <Router>
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
                  path="/emergency" 
                  element={
                    <motion.div
                      initial="initial"
                      animate="in"
                      exit="out"
                      variants={pageVariants}
                      transition={pageTransition}
                    >
                      <EmergencyRequest />
                    </motion.div>
                  } 
                />
              </Routes>
            </AnimatePresence>
          </main>
          
          <Footer />
        </div>
      </Router>
    </>
  )
}

export default App
