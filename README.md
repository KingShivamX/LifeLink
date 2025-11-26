# LifeLink - Blood Donor Network Platform

A comprehensive web application connecting blood donors with recipients in real-time, featuring geolocation-based donor search, emergency request handling, and live notifications.

## Overview

LifeLink is a full-stack blood donation management system designed to streamline the process of finding blood donors during emergencies. The platform enables users to register as donors, search for nearby donors based on blood type and location, create blood requests, and receive real-time updates through WebSocket connections.

## Features

### Core Functionality

- **Donor Registration & Management**
  - Complete donor profile creation with medical history
  - Blood type verification and eligibility checking
  - Availability status management
  - Last donation date tracking

- **Advanced Donor Search**
  - Real-time search with multiple filters (blood type, location, availability)
  - Geolocation-based proximity search
  - Interactive map visualization using Leaflet
  - Distance calculation and sorting
  - Search debouncing for optimized performance

- **Blood Request System**
  - Create urgent and regular blood requests
  - Specify required blood type, quantity, and urgency level
  - Hospital/location details with coordinates
  - Request status tracking (pending, fulfilled, cancelled)
  - Automatic donor matching based on compatibility

- **Emergency Requests**
  - Priority handling for critical cases
  - Broadcast notifications to compatible donors
  - Real-time status updates
  - Quick response system

### Real-Time Features

- **Live Notifications**
  - Toast notifications for all major events
  - Custom notification UI with action buttons
  - New donor registration alerts
  - Blood request updates
  - Emergency broadcast messages
  - Connection status indicators

- **WebSocket Integration**
  - Socket.IO for bidirectional communication
  - Real-time donor availability updates
  - Live request status changes
  - Automatic reconnection handling
  - Online/offline status detection

### Location Services

- **Device Geolocation**
  - Browser-based location detection
  - Automatic coordinate capture
  - Manual location input fallback
  - Distance calculation between donors and recipients
  - City/state/country detection

- **Interactive Maps**
  - Leaflet integration for map display
  - Donor location markers
  - Request location visualization
  - Zoom and pan controls
  - Custom marker icons

### User Experience

- **Modern UI/UX**
  - Responsive design for all devices
  - Tailwind CSS for consistent styling
  - Framer Motion animations
  - Loading states and skeletons
  - Error boundaries and fallbacks

- **Form Validation**
  - React Hook Form integration
  - Real-time validation feedback
  - Custom validation rules
  - Error message display

- **State Management**
  - Zustand for global state
  - React Query for server state
  - Optimistic updates
  - Cache management

### Backend Features

- **RESTful API**
  - Express.js server
  - MongoDB database with Mongoose ODM
  - JWT authentication
  - Input validation with express-validator
  - Error handling middleware

- **Security**
  - Helmet.js for security headers
  - CORS configuration
  - Rate limiting (100 requests/15min general, 10 requests/15min for sensitive endpoints)
  - Password hashing with bcrypt
  - Environment variable protection

- **Performance**
  - Response compression
  - Database query optimization
  - Connection pooling
  - Serverless deployment support

- **Logging & Monitoring**
  - Winston logger integration
  - Morgan HTTP request logging
  - Error tracking
  - Health check endpoints

## Technology Stack

### Frontend

- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.8
- **Routing**: React Router DOM 6.26.2
- **Styling**: Tailwind CSS 3.4.13
- **State Management**: 
  - Zustand 4.5.5 (global state)
  - TanStack React Query 5.56.2 (server state)
- **Forms**: React Hook Form 7.53.0
- **Notifications**: React Hot Toast 2.4.1
- **Maps**: Leaflet 1.9.4 + React Leaflet 4.2.1
- **Animations**: Framer Motion 11.9.0
- **HTTP Client**: Axios 1.7.7
- **Real-time**: Socket.IO Client 4.8.0
- **Icons**: Heroicons 2.1.5, Lucide React 0.446.0
- **Utilities**: 
  - date-fns 4.1.0
  - clsx 2.1.1
  - tailwind-merge 2.5.4

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express 4.19.2
- **Database**: MongoDB with Mongoose 8.7.1
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcryptjs 2.4.3
- **Security**: 
  - Helmet 7.1.0
  - CORS 2.8.5
  - Express Rate Limit 7.4.0
- **Validation**: Express Validator 7.2.0
- **Logging**: Winston 3.14.2 + Morgan 1.10.0
- **Real-time**: Socket.IO 4.8.0
- **Email**: Nodemailer 6.9.15
- **Utilities**:
  - Compression 1.7.4
  - dayjs 1.11.13
  - node-cron 3.0.3
- **Serverless**: serverless-http 3.2.0

### Development Tools

- **Linting**: ESLint 8.57.1
- **Testing**: Jest 29.7.0, Supertest 7.0.0
- **Dev Server**: Nodemon 3.1.7
- **Package Manager**: npm 9+

## Project Structure

```
WT-Project/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── DonorRegistration.jsx
│   │   │   ├── FindDonors.jsx
│   │   │   ├── RequestBlood.jsx
│   │   │   └── EmergencyRequest.jsx
│   │   ├── hooks/
│   │   │   ├── useRealTimeUpdates.jsx
│   │   │   └── useGeolocation.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   └── useStore.js
│   │   ├── utils/
│   │   │   └── index.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── donors.js
│   │   ├── requests.js
│   │   ├── emergency.js
│   │   └── analytics.js
│   ├── models/
│   │   ├── Donor.js
│   │   └── Request.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── validators.js
│   ├── api/
│   │   └── index.js (Vercel serverless entry)
│   ├── app-setup.js
│   ├── local-server.js
│   ├── vercel.json
│   └── package.json
├── start-dev.bat
└── README.md
```

## Installation & Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- MongoDB Atlas account (or local MongoDB instance)
- Modern web browser with geolocation support

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Backend `.env`:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
API_BASE_PATH=/api
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Quick Start (Windows)

Run the automated setup script:

```bash
start-dev.bat
```

This script will:
1. Install all dependencies (root, frontend, backend)
2. Start the backend server on port 5000
3. Start the frontend server on port 3000
4. Open the application in your browser
5. Display server status and health checks

### Manual Setup

**1. Install Dependencies**

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

**2. Start Backend Server**

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5000`

**3. Start Frontend Server**

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Donors
- `GET /api/donors` - Get all donors (with filters)
- `GET /api/donors/:id` - Get donor by ID
- `POST /api/donors` - Create new donor
- `PUT /api/donors/:id` - Update donor
- `DELETE /api/donors/:id` - Delete donor
- `GET /api/donors/search` - Search donors with filters
- `GET /api/donors/nearby` - Find nearby donors

### Blood Requests
- `GET /api/requests` - Get all requests
- `GET /api/requests/:id` - Get request by ID
- `POST /api/requests` - Create new request
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request
- `POST /api/requests/:id/fulfill` - Mark request as fulfilled

### Emergency
- `POST /api/emergency` - Create emergency request
- `GET /api/emergency/active` - Get active emergencies
- `POST /api/emergency/:id/respond` - Respond to emergency

### Analytics
- `GET /api/analytics/stats` - Get platform statistics
- `GET /api/analytics/blood-types` - Blood type distribution
- `GET /api/analytics/requests` - Request analytics

### Health Check
- `GET /api/health` - Server health status

## Deployment

### Vercel Deployment (Recommended)

**Backend:**

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy backend:
```bash
cd backend
vercel
```

3. Set environment variables in Vercel dashboard

4. Configure MongoDB Atlas to allow connections from `0.0.0.0/0`

**Frontend:**

1. Update API URLs in `.env`:
```env
VITE_API_URL=https://your-backend.vercel.app/api
VITE_SOCKET_URL=https://your-backend.vercel.app
```

2. Deploy frontend:
```bash
cd frontend
vercel
```

### Production Build

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend:**
```bash
cd backend
npm start
```

## Development Workflow

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Linting

```bash
# Backend
cd backend
npm run lint
npm run lint:fix

# Frontend
cd frontend
npm run lint
npm run lint:fix
```

### Code Quality

- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages
- Test before pushing to production

## Key Features Implementation

### Search Functionality

The search feature includes:
- Real-time filtering by blood type, location, and availability
- Debounced search input (500ms delay)
- Case-insensitive text matching
- Distance-based sorting
- Pagination support

### Toast Notifications

Implemented using `react-hot-toast`:
- Success notifications (green)
- Error notifications (red)
- Custom notification components with actions
- Auto-dismiss after 4 seconds
- Manual dismiss option
- Position: top-right

### Device Location Detection

Features:
- Browser Geolocation API integration
- Automatic coordinate capture
- Reverse geocoding for address
- Manual input fallback
- Permission handling
- Error states for denied/unavailable location

### Real-Time Updates

WebSocket implementation:
- Socket.IO for bidirectional communication
- Event-based architecture
- Automatic reconnection
- Connection status monitoring
- Optimistic UI updates
- Event types:
  - `donor:new` - New donor registered
  - `request:new` - New blood request
  - `request:updated` - Request status changed
  - `emergency:broadcast` - Emergency alert
  - `donor:matched` - Donor matched to request

## Performance Optimizations

- Lazy loading for routes and components
- Image optimization
- Code splitting
- MongoDB query optimization with indexes
- Response compression (gzip)
- Connection pooling
- Debounced search inputs
- React Query caching
- Memoization for expensive calculations

## Security Features

- JWT-based authentication
- Password hashing with bcrypt (10 rounds)
- CORS protection
- Rate limiting (prevents DDoS)
- Helmet.js security headers
- Input validation and sanitization
- XSS protection
- CSRF protection
- Environment variable protection
- MongoDB injection prevention

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+

## Known Issues & Limitations

- Geolocation requires HTTPS in production
- Socket.IO may require WebSocket support
- Free tier MongoDB Atlas clusters auto-pause after inactivity
- Vercel free tier has 10-second function timeout
- Email notifications require SMTP configuration

## Future Enhancements

- Mobile application (React Native)
- SMS notifications
- Blood bank integration
- Donation history tracking
- Donor rewards system
- Multi-language support
- Advanced analytics dashboard
- Admin panel
- Push notifications
- Calendar integration for donation scheduling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Authors

LifeLink Development Team

## Acknowledgments

- MongoDB Atlas for database hosting
- Vercel for deployment platform
- OpenStreetMap for map tiles
- React community for excellent libraries
- All contributors and testers

## Support

For issues and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

## Version History

- **v2.0.0** (Current)
  - Added real-time notifications with toast
  - Implemented advanced search with filters
  - Added device location detection
  - Optimized for Vercel deployment
  - Enhanced UI/UX with animations
  - Improved error handling
  - Added WebSocket support
  - Performance optimizations

- **v1.0.0**
  - Initial release
  - Basic donor registration
  - Simple search functionality
  - Blood request system

---

Built with care to save lives, one donation at a time.
