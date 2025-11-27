Complete Technical Documentation

## 📚 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [MongoDB - Database Layer](#mongodb---database-layer)
4. [Backend - Node.js & Express](#backend---nodejs--express)
5. [Frontend - React & Concepts](#frontend---react--concepts)
6. [Real-Time Communication](#real-time-communication)
7. [Key Features & Implementation](#key-features--implementation)
8. [Code Flow & Execution](#code-flow--execution)

---

## 🎯 Project Overview

**LifeLink** is a full-stack MERN (MongoDB, Express, React, Node.js) blood donor network platform that connects blood donors with recipients in real-time.

### What Problem Does It Solve?
- Finding blood donors during emergencies is time-critical
- Traditional methods (phone calls, manual searching) are slow
- Need for real-time donor availability and location-based matching

### Key Capabilities:
- Real-time donor search with geolocation
- Emergency blood request broadcasting
- WebSocket-based live notifications
- Blood type compatibility matching
- Secure donor registration and authentication

---

## 🏗️ Architecture & Tech Stack

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│                    (React Frontend - Vite)                   │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   Pages    │  │ Components │  │   Hooks & Services   │  │
│  │  (Views)   │  │   (UI)     │  │  (Business Logic)    │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│         │              │                    │                │
│         └──────────────┴────────────────────┘                │
│                        │                                     │
│                   HTTP / WebSocket                           │
└───────────────────────┴─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVER LAYER                           │
│                 (Node.js + Express Backend)                  │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   Routes   │  │Middleware  │  │    WebSocket Server  │  │
│  │  (API)     │  │ (Auth,     │  │     (Socket.IO)      │  │
│  │            │  │  Error)    │  │                      │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│         │              │                    │                │
│         └──────────────┴────────────────────┘                │
│                        │                                     │
│                   Mongoose ODM                               │
└───────────────────────┴─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│                     (MongoDB Atlas)                          │
│  ┌────────────────────┐    ┌───────────────────────────┐   │
│  │  Donor Collection  │    │  BloodRequest Collection  │   │
│  │  (User Profiles)   │    │  (Blood Requests)         │   │
│  └────────────────────┘    └───────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Breakdown

#### **Frontend Technologies**

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI library for building component-based interfaces |
| **Vite** | 5.4.8 | Fast build tool and dev server (replacement for Create React App) |
| **React Router DOM** | 6.26.2 | Client-side routing between pages |
| **Zustand** | 4.5.5 | Lightweight state management (global state) |
| **TanStack React Query** | 5.56.2 | Server state management, caching, and data fetching |
| **Axios** | 1.7.7 | HTTP client for API calls |
| **Socket.IO Client** | 4.8.0 | Real-time bidirectional communication |
| **Tailwind CSS** | 3.4.13 | Utility-first CSS framework |
| **Framer Motion** | 11.9.0 | Animation library |
| **React Hook Form** | 7.53.0 | Form state management and validation |
| **React Hot Toast** | 2.4.1 | Toast notification system |
| **Leaflet** | 1.9.4 | Interactive maps for donor location |

#### **Backend Technologies**

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime environment |
| **Express** | 4.19.2 | Web application framework |
| **MongoDB** | - | NoSQL database |
| **Mongoose** | 8.7.1 | MongoDB Object Data Modeling (ODM) library |
| **Socket.IO** | 4.8.0 | Real-time WebSocket server |
| **JWT** | 9.0.2 | JSON Web Tokens for authentication |
| **bcryptjs** | 2.4.3 | Password hashing |
| **Helmet** | 7.1.0 | Security headers middleware |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing |
| **Express Rate Limit** | 7.4.0 | Rate limiting to prevent abuse |
| **Winston** | 3.14.2 | Logging library |
| **compression** | 1.7.4 | Response compression (gzip) |

---

## 🗄️ MongoDB - Database Layer

### What is MongoDB?

MongoDB is a **NoSQL database** that stores data in flexible, JSON-like documents called **BSON** (Binary JSON).

**Why MongoDB for this project?**
- Flexible schema - easy to add new fields without migrations
- Handles geospatial data natively (donor locations)
- Horizontal scalability
- Native JSON support works perfectly with JavaScript/Node.js

### How MongoDB is Connected

#### Connection Location: `backend/app-setup.js`

```javascript
// MongoDB Connection URI
const MONGODB_URI = process.env.MONGODB_URI || 
  "mongodb+srv://username:password@cluster0.mongodb.net/lifelink"

// Connection Function (Lines 38-64)
const connectDatabase = async () => {
  // Check if already connected
  if (mongoose.connection?.readyState === 1) {
    return mongoose.connection
  }

  // Create connection with options
  if (!mongoPromise) {
    mongoPromise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,  // How long to try connecting
      socketTimeoutMS: 10000,           // Socket timeout
      maxPoolSize: 1,                   // Max concurrent connections
      minPoolSize: 0,                   // Min connections in pool
      connectTimeoutMS: 3000,           // Connection timeout
    })
  }
  
  return mongoPromise
}
```

**Key Points:**
- Uses **Mongoose** as an ODM (Object Document Mapper)
- Connection is **cached** to reuse in serverless environments
- **Connection pooling** manages multiple simultaneous requests
- **Retry logic** handles temporary connection failures

### MongoDB Schema Design

#### 1. **Donor Schema** (`backend/models/Donor.js`)

```javascript
const donorSchema = new mongoose.Schema({
  // Personal Information
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  phone: String,
  password: { type: String, select: false }, // Hidden by default
  
  // Blood Information
  bloodType: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  lastDonationDate: Date,
  
  // Location with GeoJSON for geospatial queries
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  
  // Medical Information
  dateOfBirth: Date,
  weight: Number,
  isEligible: Boolean,
  
  // Availability
  availability: {
    isAvailable: Boolean,
    emergencyOnly: Boolean
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
})
```

**Important Mongoose Features Used:**

1. **Indexes for Performance**
   ```javascript
   donorSchema.index({ location: '2dsphere' })  // Geospatial queries
   donorSchema.index({ bloodType: 1, 'availability.isAvailable': 1 })
   ```

2. **Virtual Fields** (computed properties not stored in DB)
   ```javascript
   donorSchema.virtual('age').get(function() {
     return Math.floor((new Date() - new Date(this.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
   })
   ```

3. **Pre-save Middleware** (runs before saving to DB)
   ```javascript
   donorSchema.pre('save', async function(next) {
     if (!this.isModified('password')) return next()
     const salt = await bcrypt.genSalt(12)
     this.password = await bcrypt.hash(this.password, salt)
     next()
   })
   ```

4. **Instance Methods** (methods callable on documents)
   ```javascript
   donorSchema.methods.comparePassword = async function(candidatePassword) {
     return await bcrypt.compare(candidatePassword, this.password)
   }
   ```

5. **Static Methods** (methods callable on model)
   ```javascript
   donorSchema.statics.findNearbyDonors = function(coordinates, bloodType, maxDistance) {
     return this.find({
       location: {
         $near: {
           $geometry: { type: 'Point', coordinates: coordinates },
           $maxDistance: maxDistance
         }
       },
       bloodType: bloodType
     })
   }
   ```

#### 2. **Blood Request Schema** (`backend/models/BloodRequest.js`)

```javascript
const bloodRequestSchema = new mongoose.Schema({
  requestType: {
    type: String,
    enum: ['emergency', 'planned', 'regular']
  },
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical']
  },
  patient: {
    firstName: String,
    lastName: String,
    bloodType: String,
    age: Number
  },
  bloodRequirement: {
    unitsNeeded: Number,
    compatibleTypes: [String]
  },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number]
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'fulfilled', 'expired', 'cancelled'],
    default: 'pending'
  },
  matchedDonors: [{
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor' },
    matchedAt: Date,
    status: String
  }]
})
```

**Key MongoDB Concepts:**

- **Schema Types**: String, Number, Date, Boolean, Array, Object
- **Schema Validation**: `required`, `enum`, `min`, `max`, `match`
- **References**: `ObjectId` with `ref` for relating documents
- **GeoJSON**: `type: 'Point'` and `coordinates` for location data
- **TTL Indexes**: Automatically delete expired documents

### Geospatial Queries

MongoDB supports powerful location-based queries:

```javascript
// Find donors within 10km of coordinates
Donor.find({
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]  // Note: [lng, lat] not [lat, lng]!
      },
      $maxDistance: 10000  // 10,000 meters = 10km
    }
  }
})
```

---

## ⚙️ Backend - Node.js & Express

### What is Node.js?

**Node.js** is a JavaScript runtime built on Chrome's V8 engine that allows you to run JavaScript on the server.

**Why Node.js?**
- Same language (JavaScript) on frontend and backend
- Non-blocking I/O - handles many concurrent connections efficiently
- Huge ecosystem (npm packages)
- Perfect for real-time applications (WebSockets)

### What is Express?

**Express** is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

**Key Features:**
- Routing
- Middleware
- HTTP utility methods
- Template rendering

### Backend Architecture

#### Entry Point: `backend/index.js`

This is a **serverless function** for Vercel deployment:

```javascript
import serverless from "serverless-http"
import { getApp, getApiBasePath } from "./app-setup.js"

export default async function vercelHandler(req, res) {
  if (!handler) {
    const app = await getApp()  // Get Express app
    handler = serverless(app)    // Wrap for serverless
  }
  return handler(req, res)
}
```

#### App Configuration: `backend/app-setup.js`

This file sets up the entire Express application:

```javascript
const createAppInstance = async () => {
  await connectDatabase()  // Connect to MongoDB first
  
  const app = express()
  
  // Security Middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }))
  
  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100  // Limit each IP to 100 requests per windowMs
  })
  app.use('/api', limiter)
  
  // CORS - Allow cross-origin requests from frontend
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  }))
  
  // Body Parsing - Convert JSON in request body
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  
  // Compression - Gzip responses
  app.use(compression())
  
  // Logging - HTTP request logs
  app.use(morgan('combined'))
  
  // API Routes
  app.use('/api/auth', authRoutes)
  app.use('/api/donors', donorRoutes)
  app.use('/api/requests', requestRoutes)
  app.use('/api/emergency', emergencyRoutes)
  app.use('/api/analytics', analyticsRoutes)
  
  // Error Handling Middleware
  app.use(errorHandler)
  
  return app
}
```

**Middleware Explanation:**

1. **helmet** - Sets security HTTP headers
2. **cors** - Enables Cross-Origin Resource Sharing
3. **express.json()** - Parses JSON request bodies
4. **compression** - Compresses HTTP responses
5. **morgan** - Logs HTTP requests
6. **rateLimit** - Prevents abuse by limiting requests

### API Routes

#### Route Structure: `backend/routes/donors.js`

```javascript
import express from 'express'
const router = express.Router()

// GET /api/donors - Get all donors
router.get('/', async (req, res) => {
  try {
    const { bloodType, city, available } = req.query
    
    // Build query object
    const query = {}
    if (bloodType) query.bloodType = bloodType
    if (city) query['address.city'] = new RegExp(city, 'i')
    if (available === 'true') query['availability.isAvailable'] = true
    
    // Execute query
    const donors = await Donor.find(query)
      .select('-password')  // Don't return password field
      .limit(100)
    
    res.status(200).json({
      success: true,
      count: donors.length,
      data: donors
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// POST /api/donors - Register new donor
router.post('/', async (req, res) => {
  try {
    const donor = await Donor.create(req.body)
    
    res.status(201).json({
      success: true,
      data: donor
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
})

export default router
```

**HTTP Methods:**
- **GET** - Retrieve data
- **POST** - Create new data
- **PUT** - Update existing data
- **DELETE** - Delete data

**Status Codes:**
- **200** - OK (success)
- **201** - Created (resource created)
- **400** - Bad Request (validation error)
- **401** - Unauthorized (authentication required)
- **404** - Not Found
- **500** - Internal Server Error

### Error Handling

#### Error Handler Middleware: `backend/middleware/errorHandler.js`

```javascript
export const errorHandler = (err, req, res, next) => {
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    })
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    })
  }
  
  // Default error
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  })
}
```

---

## ⚛️ Frontend - React & Concepts

### What is React?

**React** is a JavaScript library for building user interfaces using reusable **components**.

**Key Philosophy:**
- **Component-based**: UI is broken into reusable pieces
- **Declarative**: Describe what the UI should look like, React handles updates
- **Unidirectional data flow**: Data flows from parent to child

### React Core Concepts

#### 1. **Components**

Components are the building blocks of React applications. They can be **functional** or **class-based** (we use functional).

**Example Component:**

```jsx
// Simple functional component
function DonorCard({ donor }) {
  return (
    <div className="card">
      <h3>{donor.firstName} {donor.lastName}</h3>
      <p>Blood Type: {donor.bloodType}</p>
      <p>Available: {donor.availability.isAvailable ? 'Yes' : 'No'}</p>
    </div>
  )
}

export default DonorCard
```

**Component Types:**
- **Presentational Components**: Only display data (like DonorCard)
- **Container Components**: Handle logic and data fetching
- **Page Components**: Full page views (Home, FindDonors, etc.)

#### 2. **Props (Properties)**

**Props** are arguments passed to components, similar to function parameters.

**Example:**

```jsx
// Parent Component
function DonorList() {
  const donors = [
    { id: 1, firstName: 'John', lastName: 'Doe', bloodType: 'A+' },
    { id: 2, firstName: 'Jane', lastName: 'Smith', bloodType: 'O-' }
  ]
  
  return (
    <div>
      {donors.map(donor => (
        <DonorCard 
          key={donor.id}        // Special prop for lists
          donor={donor}         // Passing donor object as prop
          onSelect={handleSelect} // Passing function as prop
        />
      ))}
    </div>
  )
}

// Child Component receives props
function DonorCard({ donor, onSelect }) {
  return (
    <div onClick={() => onSelect(donor.id)}>
      <h3>{donor.firstName}</h3>
      <p>{donor.bloodType}</p>
    </div>
  )
}
```

**Props Rules:**
- Props are **read-only** (immutable)
- Props flow **one way** (parent to child)
- Any JavaScript value can be a prop (strings, numbers, objects, functions, etc.)

#### 3. **State with useState**

**State** is data that can change over time. When state changes, React re-renders the component.

**useState Hook:**

```jsx
import { useState } from 'react'

function SearchDonors() {
  // Declare state variable with initial value
  const [searchTerm, setSearchTerm] = useState('')
  const [bloodType, setBloodType] = useState('A+')
  const [results, setResults] = useState([])
  
  const handleSearch = async () => {
    // Update state using setter function
    setResults(await api.searchDonors(searchTerm, bloodType))
  }
  
  return (
    <div>
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select 
        value={bloodType}
        onChange={(e) => setBloodType(e.target.value)}
      >
        <option value="A+">A+</option>
        <option value="O-">O-</option>
      </select>
      <button onClick={handleSearch}>Search</button>
      
      <div>
        {results.map(donor => (
          <DonorCard key={donor.id} donor={donor} />
        ))}
      </div>
    </div>
  )
}
```

**useState Syntax:**
```javascript
const [stateValue, setStateFunction] = useState(initialValue)
```

**Example from Header Component:**

```jsx
// frontend/src/components/Header.jsx (Line 7)
const [isMenuOpen, setIsMenuOpen] = useState(false)

// Toggle menu on click (Line 65)
<button onClick={() => setIsMenuOpen(!isMenuOpen)}>
  {isMenuOpen ? <XMarkIcon /> : <Bars3Icon />}
</button>
```

#### 4. **useEffect Hook**

**useEffect** runs side effects (API calls, subscriptions, timers) after render.

**Syntax:**
```javascript
useEffect(() => {
  // Effect code here
  
  return () => {
    // Cleanup code (optional)
  }
}, [dependencies])
```

**Example:**

```jsx
import { useState, useEffect } from 'react'

function DonorProfile({ donorId }) {
  const [donor, setDonor] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // This runs after component renders
    const fetchDonor = async () => {
      setLoading(true)
      const data = await api.getDonor(donorId)
      setDonor(data)
      setLoading(false)
    }
    
    fetchDonor()
  }, [donorId])  // Re-run when donorId changes
  
  if (loading) return <div>Loading...</div>
  
  return <div>{donor.firstName}</div>
}
```

**Dependency Array:**
- `[]` - Run once on mount
- `[value]` - Run when `value` changes
- No array - Run after every render (usually avoided)

#### 5. **Custom Hooks**

Custom hooks are reusable functions that use React hooks.

**Example: `useRealTimeUpdates.jsx`**

```jsx
import { useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'

export function useRealTimeUpdates() {
  const initializeSocket = useCallback(() => {
    if (!socket) {
      socket = io(import.meta.env.VITE_SOCKET_URL, {
        autoConnect: true,
        reconnection: true
      })
      
      socket.on('connect', () => {
        console.log('Connected to real-time server')
      })
      
      socket.on('new-blood-request', (data) => {
        toast.success('New blood request received!')
        queryClient.invalidateQueries(['requests'])
      })
    }
    
    return socket
  }, [])
  
  useEffect(() => {
    initializeSocket()
    
    return () => {
      // Cleanup on unmount
      socket?.disconnect()
    }
  }, [initializeSocket])
  
  return { socket, isConnected: socket?.connected }
}
```

**Usage in Component:**

```jsx
function App() {
  useRealTimeUpdates()  // Auto-connects to WebSocket
  
  return <div>App Content</div>
}
```

### State Management

#### 1. **Zustand (Global State)**

Zustand is a lightweight state management library.

**Store Definition: `frontend/src/store/useStore.js`**

```javascript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Create store with state and actions
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Actions (functions to update state)
      login: async (credentials) => {
        const response = await authAPI.login(credentials)
        const { donor, token } = response.data.data
        
        set({
          user: donor,
          token,
          isAuthenticated: true
        })
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      }
    }),
    {
      name: 'lifelink-auth',  // localStorage key
      storage: localStorage    // Persist to localStorage
    }
  )
)
```

**Using Store in Component:**

```jsx
import { useAuthStore } from '../store/useStore'

function Header() {
  // Select specific state
  const { user, isAuthenticated, logout } = useAuthStore()
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user.firstName}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </div>
  )
}
```

#### 2. **React Query (Server State)**

React Query manages server data with caching, automatic refetching, and more.

**Setup: `frontend/src/main.jsx`**

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,  // Data is fresh for 1 minute
      cacheTime: 300 * 1000   // Cache for 5 minutes
    }
  }
})

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)
```

**Using React Query:**

```jsx
import { useQuery } from '@tanstack/react-query'

function FindDonors() {
  // Fetch donors with automatic caching
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['donors', bloodType],  // Unique key
    queryFn: () => donorsAPI.getDonors({ bloodType }),
    staleTime: 30000  // Override default
  })
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {data.data.map(donor => (
        <DonorCard key={donor.id} donor={donor} />
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  )
}
```

### Routing with React Router

**Setup: `frontend/src/main.jsx`**

```jsx
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
```

**Routes: `frontend/src/App.jsx`**

```jsx
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<DonorRegistration />} />
        <Route path="/find-donors" element={<FindDonors />} />
        <Route path="/request" element={<RequestBlood />} />
        <Route path="/emergency" element={<EmergencyRequest />} />
      </Routes>
      <Footer />
    </div>
  )
}
```

**Navigation:**

```jsx
import { Link, useNavigate } from 'react-router-dom'

function Navigation() {
  const navigate = useNavigate()
  
  const handleClick = () => {
    // Programmatic navigation
    navigate('/find-donors')
  }
  
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/register">Register</Link>
      <button onClick={handleClick}>Find Donors</button>
    </nav>
  )
}
```

### API Service Layer

**API Configuration: `frontend/src/services/api.js`**

```javascript
import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.lifelink.com/api',
  timeout: 10000
})

// Request interceptor - Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lifelink_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong'
    toast.error(message)
    return Promise.reject(error)
  }
)

// API methods
export const donorsAPI = {
  getDonors: (params) => api.get('/donors', { params }),
  registerDonor: (data) => api.post('/donors', data),
  searchNearbyDonors: (data) => api.post('/donors/search/nearby', data)
}

export const requestsAPI = {
  getRequests: (params) => api.get('/requests', { params }),
  createRequest: (data) => api.post('/requests', data)
}

export default api
```

---

## 🔴 Real-Time Communication

### What is WebSocket?

**WebSocket** is a protocol that provides full-duplex (two-way) communication between client and server over a single TCP connection.

**Difference from HTTP:**
- **HTTP**: Request → Response (one-time)
- **WebSocket**: Persistent connection, bidirectional

### Socket.IO

**Socket.IO** is a library that enables real-time, bidirectional communication between web clients and servers.

**Features:**
- Automatic reconnection
- Built-in rooms and namespaces
- Fallback to HTTP long-polling if WebSocket unavailable

### Backend WebSocket Setup

**Local Server: `backend/local-server.js`**

```javascript
import { Server } from 'socket.io'
import http from 'http'

const server = http.createServer(app)

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  }
})

// Connection event
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)
  
  // Join location-based room
  socket.on('join-location', (data) => {
    socket.join(`location:${data.city}`)
    console.log(`User joined room: location:${data.city}`)
  })
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Emit event to all clients in a room
function broadcastToCity(city, event, data) {
  io.to(`location:${city}`).emit(event, data)
}

// Emit event to all clients
function broadcastToAll(event, data) {
  io.emit(event, data)
}
```

**Emitting Events from Routes:**

```javascript
// When new blood request is created
router.post('/requests', async (req, res) => {
  const request = await BloodRequest.create(req.body)
  
  // Emit real-time event
  io.emit('new-blood-request', {
    id: request._id,
    bloodType: request.patient.bloodType,
    urgency: request.urgencyLevel,
    hospital: request.medicalInfo.hospital.name
  })
  
  res.status(201).json({ success: true, data: request })
})
```

### Frontend WebSocket Client

**Custom Hook: `frontend/src/hooks/useRealTimeUpdates.jsx`**

```jsx
import { useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

let socket = null

export function useRealTimeUpdates() {
  const queryClient = useQueryClient()
  
  const initializeSocket = useCallback(() => {
    if (!socket) {
      // Create socket connection
      socket = io(import.meta.env.VITE_SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      })
      
      // Connection events
      socket.on('connect', () => {
        console.log('Connected to real-time server')
        toast.success('Real-time updates connected')
      })
      
      socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason)
      })
      
      socket.on('reconnect', () => {
        toast.success('Connection restored')
        queryClient.invalidateQueries()  // Refresh all data
      })
      
      // Custom events
      socket.on('new-blood-request', (data) => {
        toast((t) => (
          <div>
            <h3>Blood Request - {data.bloodType}</h3>
            <p>{data.urgency} priority at {data.hospital}</p>
            <button onClick={() => {
              window.location.href = '/requests'
              toast.dismiss(t.id)
            }}>
              View Details
            </button>
          </div>
        ), { duration: 10000 })
        
        // Invalidate requests cache to refetch
        queryClient.invalidateQueries({ queryKey: ['requests'] })
      })
      
      socket.on('emergency-alert', (data) => {
        toast.error(`EMERGENCY: ${data.patient.bloodType} blood needed!`, {
          duration: 20000
        })
        
        queryClient.invalidateQueries({ queryKey: ['emergencies'] })
      })
    }
    
    return socket
  }, [queryClient])
  
  useEffect(() => {
    initializeSocket()
    
    return () => {
      // Cleanup
      socket?.disconnect()
    }
  }, [initializeSocket])
  
  return {
    socket,
    isConnected: socket?.connected || false
  }
}
```

**Usage in App:**

```jsx
// frontend/src/App.jsx
function App() {
  useRealTimeUpdates()  // Initialize WebSocket
  
  return <div>...</div>
}
```

---

## 🔑 Key Features & Implementation

### 1. Geolocation-Based Donor Search

**Browser Geolocation API:**

```jsx
// Get user's current location
function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  
  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported')
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        setError(error.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000  // 5 minutes
      }
    )
  }
  
  return { location, error, getLocation }
}
```

**MongoDB Geospatial Query:**

```javascript
// Find donors within 10km
router.post('/donors/search/nearby', async (req, res) => {
  const { latitude, longitude, bloodType, maxDistance = 10000 } = req.body
  
  const donors = await Donor.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]  // [lng, lat]
        },
        $maxDistance: maxDistance  // meters
      }
    },
    bloodType,
    'availability.isAvailable': true
  })
  
  res.json({ success: true, data: donors })
})
```

### 2. Blood Type Compatibility

**Compatibility Logic:**

```javascript
// Which blood types can receive from which donors
const compatibilityMap = {
  'A+': ['A+', 'A-', 'O+', 'O-'],   // A+ can receive from these
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],  // Universal recipient
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-']  // Universal donor can only receive O-
}

// Check if donor can donate to recipient
function isCompatibleDonor(donorType, recipientType) {
  // Which types can the donor give to
  const donorCanGiveTo = {
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB+', 'AB-'],
    'O+': ['A+', 'B+', 'AB+', 'O+'],
    'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']  // Universal donor
  }
  
  return donorCanGiveTo[donorType]?.includes(recipientType) || false
}
```

### 3. Form Handling with React Hook Form

```jsx
import { useForm } from 'react-hook-form'

function DonorRegistrationForm() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  
  const onSubmit = async (data) => {
    try {
      await donorsAPI.registerDonor(data)
      toast.success('Registration successful!')
    } catch (error) {
      toast.error('Registration failed')
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('firstName', { 
          required: 'First name is required',
          minLength: { value: 2, message: 'Too short' }
        })}
        placeholder="First Name"
      />
      {errors.firstName && <span>{errors.firstName.message}</span>}
      
      <input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address'
          }
        })}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email.message}</span>}
      
      <select {...register('bloodType', { required: true })}>
        <option value="">Select Blood Type</option>
        <option value="A+">A+</option>
        <option value="O-">O-</option>
      </select>
      
      <button type="submit">Register</button>
    </form>
  )
}
```

### 4. Toast Notifications

**Setup: `frontend/src/main.jsx`**

```jsx
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <>
    <App />
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff'
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff'
          }
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff'
          }
        }
      }}
    />
  </>
)
```

**Usage:**

```jsx
import toast from 'react-hot-toast'

// Simple notifications
toast.success('Donor registered successfully!')
toast.error('Failed to load donors')
toast.loading('Searching for donors...')

// Custom notification with JSX
toast((t) => (
  <div>
    <h3>Emergency Blood Request</h3>
    <p>A+ blood needed urgently</p>
    <button onClick={() => {
      handleRespond()
      toast.dismiss(t.id)
    }}>
      Respond
    </button>
  </div>
), { duration: 10000 })
```

---

## 🔄 Code Flow & Execution

### Complete Request Flow Example

Let's trace a complete user action: **Finding nearby donors**

#### 1. User Interaction (Frontend)

```jsx
// Page: frontend/src/pages/FindDonors.jsx

function FindDonors() {
  const [bloodType, setBloodType] = useState('A+')
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(false)
  const { location, getLocation } = useGeolocation()
  
  const handleSearch = async () => {
    setLoading(true)
    
    try {
      // Get user's location
      await getLocation()
      
      // Make API call
      const response = await donorsAPI.searchNearbyDonors({
        latitude: location.latitude,
        longitude: location.longitude,
        bloodType,
        maxDistance: 10000  // 10km
      })
      
      setDonors(response.data.data)
      toast.success(`Found ${response.data.data.length} donors!`)
      
    } catch (error) {
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div>
      <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
        <option value="A+">A+</option>
        <option value="O-">O-</option>
      </select>
      
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Find Donors'}
      </button>
      
      <div>
        {donors.map(donor => (
          <DonorCard key={donor._id} donor={donor} />
        ))}
      </div>
    </div>
  )
}
```

#### 2. API Service (Frontend)

```javascript
// Service: frontend/src/services/api.js

export const donorsAPI = {
  searchNearbyDonors: (searchData) => {
    return api.post('/donors/search/nearby', searchData)
  }
}

// Axios instance with interceptors
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lifelink_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

#### 3. Backend Route Handler

```javascript
// Route: backend/routes/donors.js

router.post('/search/nearby', async (req, res) => {
  try {
    const { latitude, longitude, bloodType, maxDistance } = req.body
    
    // Validate input
    if (!latitude || !longitude || !bloodType) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      })
    }
    
    // Query database using geospatial query
    const donors = await Donor.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance || 10000
        }
      },
      bloodType,
      'availability.isAvailable': true,
      isEligible: true,
      isActive: true
    })
    .select('-password')  // Don't send password
    .limit(50)
    
    // Return response
    res.status(200).json({
      success: true,
      count: donors.length,
      data: donors
    })
    
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    })
  }
})
```

#### 4. MongoDB Query Execution

```javascript
// Mongoose translates to MongoDB query:
db.donors.find({
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [73.8567, 18.5204]  // [lng, lat]
      },
      $maxDistance: 10000
    }
  },
  bloodType: "A+",
  "availability.isAvailable": true,
  isEligible: true,
  isActive: true
})
.limit(50)

// MongoDB uses 2dsphere index for fast geospatial search
// Returns documents sorted by distance
```

#### 5. Response Back to Frontend

```javascript
// Response flows back through the chain:

// Backend sends JSON
res.status(200).json({
  success: true,
  count: 3,
  data: [
    { _id: '...', firstName: 'John', bloodType: 'A+', ... },
    { _id: '...', firstName: 'Jane', bloodType: 'A+', ... },
    { _id: '...', firstName: 'Bob', bloodType: 'A+', ... }
  ]
})

// Axios receives and parses
// Component updates state
setDonors(response.data.data)

// React re-renders with new data
// User sees donor cards on screen
```

### Emergency Request with Real-Time Notification

#### 1. Create Emergency Request

```javascript
// Frontend: User clicks "Create Emergency Request"
const handleEmergencyRequest = async (formData) => {
  const response = await emergencyAPI.createEmergencyRequest(formData)
  toast.success('Emergency request created!')
}
```

#### 2. Backend Processes and Broadcasts

```javascript
// Backend: routes/emergency.js
router.post('/request', async (req, res) => {
  // Create request in database
  const request = await BloodRequest.create({
    ...req.body,
    requestType: 'emergency',
    urgencyLevel: 'critical'
  })
  
  // Find compatible donors
  const compatibleDonors = await Donor.findNearbyDonors(
    req.body.location.coordinates,
    req.body.patient.bloodType,
    50000  // 50km
  )
  
  // Broadcast to all connected clients via WebSocket
  io.emit('emergency-alert', {
    requestId: request._id,
    patient: {
      bloodType: request.patient.bloodType,
      age: request.patient.age
    },
    hospital: request.medicalInfo.hospital.name,
    location: request.location,
    unitsNeeded: request.bloodRequirement.unitsNeeded,
    compatibleDonors: compatibleDonors.length
  })
  
  res.status(201).json({ success: true, data: request })
})
```

#### 3. All Connected Clients Receive Notification

```jsx
// Frontend: hooks/useRealTimeUpdates.jsx

socket.on('emergency-alert', (data) => {
  // Check if user's blood type is compatible
  if (isCompatibleDonor(user.bloodType, data.patient.bloodType)) {
    // Show prominent notification
    toast((t) => (
      <div className="emergency-alert">
        <h3>🚨 EMERGENCY BLOOD NEEDED!</h3>
        <p>Patient needs {data.patient.bloodType} blood</p>
        <p>Hospital: {data.hospital}</p>
        <p>Units needed: {data.unitsNeeded}</p>
        <button onClick={() => {
          navigate('/emergency')
          toast.dismiss(t.id)
        }}>
          Respond Now
        </button>
      </div>
    ), { 
      duration: 20000,
      position: 'top-center'
    })
    
    // Play alert sound
    new Audio('/alert-sound.mp3').play()
  }
  
  // Refresh emergency requests list
  queryClient.invalidateQueries(['emergencies'])
})
```

---

## 📝 VIVA Preparation - Key Questions & Answers

### React Questions

**Q: What is useState and how does it work?**
**A:** `useState` is a React Hook that lets you add state to functional components. It returns an array with two elements: the current state value and a function to update it. When you call the setter function, React re-renders the component with the new state.

Example:
```jsx
const [count, setCount] = useState(0)  // count = 0 initially
setCount(count + 1)  // Updates count to 1, triggers re-render
```

**Q: What are props?**
**A:** Props (properties) are read-only data passed from parent to child components. They allow components to be reusable by accepting different data.

**Q: What is the difference between state and props?**
**A:**
- **State**: Mutable data owned by the component, can be changed
- **Props**: Immutable data passed from parent, cannot be changed by child

**Q: What is useEffect used for?**
**A:** `useEffect` is used for side effects like API calls, subscriptions, or DOM manipulation. It runs after the component renders. The dependency array controls when it runs.

**Q: What are React Hooks?**
**A:** Hooks are functions that let you use React features (state, effects, etc.) in functional components. Examples: `useState`, `useEffect`, `useContext`, `useCallback`, `useMemo`.

### MongoDB Questions

**Q: How is MongoDB connected in your project?**
**A:** We use Mongoose ODM to connect to MongoDB Atlas. Connection is established in `backend/app-setup.js` using `mongoose.connect()` with the MongoDB URI. The connection is cached for serverless environments.

**Q: What is Mongoose?**
**A:** Mongoose is an ODM (Object Document Mapper) for MongoDB. It provides schema validation, query building, middleware, and type casting for MongoDB documents.

**Q: What are MongoDB schemas?**
**A:** Schemas define the structure of documents in a collection. They specify field types, validation rules, default values, and indexes.

**Q: What is a geospatial query?**
**A:** Geospatial queries allow searching for documents based on location. We use `$near` operator to find donors within a certain distance of coordinates. Requires 2dsphere index.

**Q: What is the difference between SQL and NoSQL?**
**A:**
- **SQL**: Relational, fixed schema, tables with rows, ACID transactions
- **NoSQL**: Non-relational, flexible schema, documents/key-value, eventual consistency

### Node.js & Express Questions

**Q: What is Node.js?**
**A:** Node.js is a JavaScript runtime built on Chrome's V8 engine that allows running JavaScript on the server. It's non-blocking and event-driven, making it efficient for I/O operations.

**Q: What is Express?**
**A:** Express is a minimal web framework for Node.js that provides routing, middleware, and HTTP utilities.

**Q: What is middleware in Express?**
**A:** Middleware functions have access to request, response, and next function. They can modify req/res, end the request, or call next middleware. Examples: authentication, logging, parsing.

**Q: Explain the route structure**
**A:** Routes define endpoints (URLs) and HTTP methods. Each route has a path, method (GET/POST/PUT/DELETE), and handler function.

```javascript
router.get('/donors', async (req, res) => {
  // Handle GET request to /api/donors
})
```

### WebSocket Questions

**Q: What is WebSocket?**
**A:** WebSocket is a protocol for full-duplex (two-way) communication between client and server over a single TCP connection. Unlike HTTP (request-response), WebSocket maintains an open connection.

**Q: How does Socket.IO work in your project?**
**A:**
- **Backend**: Socket.IO server listens for connections, handles events, and broadcasts to clients
- **Frontend**: Socket.IO client connects, listens for events, and emits events
- Used for real-time notifications when blood requests are created

**Q: What events are used in your application?**
**A:**
- `connect` - Client connected
- `disconnect` - Client disconnected
- `new-blood-request` - New blood request created
- `emergency-alert` - Emergency request broadcast
- `donor-matched` - Donor matched to request

### Architecture Questions

**Q: Explain the MERN stack**
**A:**
- **M**ongoDB: NoSQL database
- **E**xpress: Backend framework
- **R**eact: Frontend library
- **N**ode.js: JavaScript runtime

**Q: How do frontend and backend communicate?**
**A:**
1. **HTTP REST API**: Frontend makes requests to backend endpoints using Axios
2. **WebSocket**: Real-time bidirectional communication using Socket.IO

**Q: What is the folder structure?**
**A:**
```
WT-Project/
├── frontend/          # React application
│   ├── src/
│   │   ├── pages/     # Page components
│   │   ├── components/ # Reusable UI components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── services/  # API calls
│   │   └── store/     # Global state management
│   └── package.json
└── backend/           # Node.js/Express API
    ├── routes/        # API endpoints
    ├── models/        # Mongoose schemas
    ├── middleware/    # Express middleware
    └── package.json
```

**Q: How is authentication handled?**
**A:** We use JWT (JSON Web Tokens):
1. User registers/logs in with credentials
2. Backend validates and generates JWT
3. Frontend stores JWT in localStorage
4. JWT is sent in Authorization header for protected routes
5. Backend verifies JWT for each request

---

## 🎓 Summary

### Core Technologies:
1. **React** - Component-based UI with hooks (useState, useEffect)
2. **Node.js + Express** - Backend API with middleware
3. **MongoDB + Mongoose** - NoSQL database with ODM
4. **Socket.IO** - Real-time WebSocket communication

### Key Concepts:
- **Props**: Data passed parent → child
- **State**: Component's own mutable data
- **Hooks**: Functions to use React features
- **Middleware**: Functions that process requests
- **Schema**: Database document structure
- **API**: Backend endpoints for CRUD operations
- **WebSocket**: Real-time bidirectional communication

### Data Flow:
1. User interacts with React component
2. Component calls API service (Axios)
3. HTTP request sent to Express backend
4. Express route handler processes request
5. Mongoose queries MongoDB
6. MongoDB returns data
7. Response sent back to frontend
8. React updates state and re-renders

Good luck with your VIVA! 🎉
