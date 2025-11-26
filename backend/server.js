import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'

// Import routes
import donorRoutes from './routes/donors.js'
import requestRoutes from './routes/requests.js'
import emergencyRoutes from './routes/emergency.js'
import authRoutes from './routes/auth.js'
import analyticsRoutes from './routes/analytics.js'

// Import middleware
import { errorHandler } from './middleware/errorHandler.js'
import { logger } from './utils/logger.js'

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://lifelink.health'] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST']
  }
})

// MongoDB Connection - Uses env vars for security (falls back to hardcoded as requested)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shivamhippalgave_db_user:ee8jd4FBOzPqLoUv@cluster0.gwufynq.mongodb.net/lifelink?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('MongoDB Connected Successfully')
    console.log('MongoDB Connected Successfully')
  })
  .catch((error) => {
    logger.error('MongoDB Connection Error:', error)
    console.error('MongoDB Connection Error:', error)
    process.exit(1)
  })

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1)

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
})

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for sensitive endpoints
  message: {
    error: 'Too many sensitive requests from this IP, please try again later.'
  }
})

app.use('/api/auth', strictLimiter)
app.use('/api/emergency', strictLimiter)
app.use('/api', limiter)

// Compression
app.use(compression())

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://lifelink.health'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}))

// Logging
app.use(morgan('combined', { 
  stream: { 
    write: (message) => logger.info(message.trim()) 
  }
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'LifeLink API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/donors', donorRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/emergency', emergencyRoutes)
app.use('/api/analytics', analyticsRoutes)

// Socket.IO for real-time features
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`)
  
  socket.on('join-location', (location) => {
    socket.join(`location-${location.city}`)
    logger.info(`User ${socket.id} joined location: ${location.city}`)
  })

  socket.on('emergency-request', (data) => {
    // Broadcast to all users in the same city
    socket.to(`location-${data.city}`).emit('new-emergency', data)
    logger.info(`Emergency request broadcasted in ${data.city}`)
  })

  socket.on('donor-available', (data) => {
    // Notify users looking for this blood type in the area
    socket.to(`location-${data.city}`).emit('donor-available', data)
    logger.info(`Donor availability broadcasted: ${data.bloodType} in ${data.city}`)
  })

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`)
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  })
})

// Error handling middleware (should be last)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  logger.info(`LifeLink API Server running on port ${PORT}`)
  console.log(`LifeLink API Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Socket.IO enabled for real-time features`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...')
  server.close(() => {
    mongoose.connection.close()
    logger.info('Server closed. Database connection closed.')
    process.exit(0)
  })
})

export { io }
