# LifeLink - Community Blood Donor Network

> **A modern, full-stack web application connecting blood donors and recipients in real-time during emergencies.**

[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-brightgreen)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4+-blue)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8+-orange)](https://socket.io/)

## Features

### Core Functionality
- **Real-time Donor Search** - Find compatible blood donors in your area
- **Geolocation Services** - Location-based matching and emergency response
- **Emergency Requests** - Urgent blood request broadcasting system
- **Donor Registration** - Comprehensive donor onboarding with medical verification
- **Real-time Communication** - Instant notifications via Socket.IO
- **Analytics Dashboard** - Blood type distribution, donation statistics, and more

### Modern Tech Stack
- **Frontend**: React 18.3 with Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js with Express, MongoDB, Socket.IO
- **State Management**: Zustand for client-side state
- **Forms**: React Hook Form with validation
- **API**: RESTful API with comprehensive error handling
- **Real-time**: WebSocket connections for live updates

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- MongoDB database (local or cloud)
- Modern web browser with geolocation support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lifelink/blood-donor-network.git
   cd blood-donor-network
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Project Structure

```
LifeLink/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── store/          # Zustand state management
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx            # Main App component
│   │   └── main.jsx          # Application entry point
│   ├── package.json
│   └── vite.config.js        # Vite configuration
│
├── backend/                 # Node.js backend application
│   ├── models/             # MongoDB schemas
│   ├── routes/             # Express route handlers
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Backend utilities
│   ├── logs/               # Application logs
│   ├── server.js              # Express server setup
│   └── package.json
│
├── package.json               # Root package.json
└── README.md
```

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Production
npm run build           # Build frontend for production
npm start              # Start production server

# Maintenance
npm run clean          # Clean all node_modules
npm run lint           # Lint both projects
npm test               # Run all tests
```

### Environment Variables

Create `.env` files as needed:

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lifelink
JWT_SECRET=your-secret-key
```

**Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:5000/api
```

## Blood Type Compatibility

LifeLink automatically handles blood type compatibility:

| Recipient | Compatible Donors |
|-----------|------------------|
| A+ | A+, A-, O+, O- |
| A- | A-, O- |
| B+ | B+, B-, O+, O- |
| B- | B-, O- |
| AB+ | All blood types (Universal Receiver) |
| AB- | A-, B-, AB-, O- |
| O+ | O+, O- |
| O- | O- (Universal Donor) |

## Emergency Response System

1. **Emergency Request Creation**
   - Critical priority assignment
   - Automatic nearby donor notification
   - Real-time broadcasting to compatible donors

2. **Donor Notification**
   - Socket.IO real-time alerts
   - Email/SMS notifications (configurable)
   - Geographic proximity filtering

3. **Response Tracking**
   - Donor availability updates
   - Request fulfillment monitoring
   - Response time analytics

## API Documentation

### Authentication
```javascript
POST /api/auth/login
POST /api/auth/verify-token
```

### Donors
```javascript
GET    /api/donors              # Get donors with filters
POST   /api/donors              # Register new donor
GET    /api/donors/:id          # Get donor by ID
PUT    /api/donors/:id/availability
POST   /api/donors/search/nearby
GET    /api/donors/stats/summary
```

### Blood Requests
```javascript
GET    /api/requests            # Get all requests
POST   /api/requests            # Create new request
GET    /api/requests/:id        # Get request by ID
```

### Emergency
```javascript
POST   /api/emergency/request   # Create emergency request
GET    /api/emergency/active    # Get active emergencies
```

### Analytics
```javascript
GET    /api/analytics/dashboard
GET    /api/analytics/blood-types
```

## Security Features

- **Input Validation**: Comprehensive validation using express-validator
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Helmet**: Security headers for production deployment
- **CORS**: Configurable cross-origin resource sharing
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage

## Real-time Features

### WebSocket Events
```javascript
// Client -> Server
'join-location'     // Join location-based room
'emergency-request' // Broadcast emergency
'donor-available'   // Notify availability

// Server -> Client
'new-emergency'     // New emergency in area
'donor-available'   # New donor available
'emergency-alert'   # Critical emergency broadcast
```

## UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Animations**: Smooth transitions with Framer Motion
- **Dark Mode Ready**: Built with modern CSS custom properties
- **Accessibility**: WCAG compliant with proper ARIA attributes
- **Toast Notifications**: Real-time user feedback
- **Loading States**: Progressive loading indicators

## Testing

```bash
# Frontend tests
cd frontend && npm test

# Backend tests  
cd backend && npm test

# Integration tests
npm run test:integration
```

## Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build:frontend
# Deploy the frontend/dist folder
```

### Backend (Heroku/Railway)
```bash
# Set environment variables
# Deploy the backend folder
```

### Full Stack (Docker)
```bash
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- ESLint configuration for consistent code style
- Prettier for automatic code formatting
- Conventional commits for clear git history

## Medical Disclaimers

**Important**: LifeLink is a community platform for connecting donors and recipients. 

- Always verify donor eligibility through proper medical screening
- Follow local blood donation guidelines and regulations
- Consult healthcare professionals for medical advice
- Emergency cases should contact official emergency services (911)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Medical Consultants**: Dr. Padma Nimbore and healthcare professionals
- **Open Source Libraries**: React, Node.js, MongoDB, and the amazing open source community
- **Design Inspiration**: Modern healthcare applications and emergency response systems
- **Beta Testers**: Community volunteers who helped test and improve the platform

## Support

- **Email**: help@lifelink.org
- **Documentation**: [docs.lifelink.org](https://docs.lifelink.org)
- **Community**: [Discord Server](https://discord.gg/lifelink)
- **Issues**: [GitHub Issues](https://github.com/lifelink/blood-donor-network/issues)

---

<div align="center">
  <p><strong>LifeLink - Connecting Hearts, Saving Lives</strong></p>
  <p>Built with care for the community</p>
</div>