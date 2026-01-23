# fastchat - Real-Time Chat Application

A production-ready real-time chat application built with Node.js, Express, MongoDB, and Socket.io following REST best practices and clean architecture principles.

## Features

### Core Functionality
- **JWT Authentication**: Access/refresh token system with automatic token rotation
- **User Management**: Complete CRUD operations with profile customization and avatar support
- **Chat System**: Private and group chats with full management capabilities
- **Real-Time Messaging**: Instant messaging with delivery/read receipts and typing indicators
- **Message Operations**: Send, edit, delete messages with pagination support

### Production-Ready Features
- Structured logging with Winston (daily rotation)
- Input sanitization and XSS protection
- Security headers with Helmet
- Graceful shutdown handling
- Health check endpoint
- Environment validation
- Comprehensive error handling
- Request tracking with unique IDs
- Advanced pagination, filtering, and sorting

## Tech Stack

- **Runtime**: Node.js >= 18.0.0
- **Framework**: Express 5.x
- **Database**: MongoDB >= 6.0
- **Real-time**: Socket.io 4.x
- **Authentication**: JWT with bcrypt
- **Validation**: express-validator
- **Logging**: Winston with daily rotation

## Documentation

- **[API Documentation](./src/docs/API_DOCUMENTATION.md)** - Complete REST API reference with all endpoints
- **[Architecture](./src/docs/ARCHITECTURE.md)** - System architecture and design diagrams

## Quick Start

```bash
# Clone and install
git clone https://github.com/codephoenix86/fastchat.git
cd fastchat
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Create required directories
mkdir -p logs uploads/public/avatars uploads/private

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Configuration

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/fastchat

# JWT Secrets (minimum 32 characters)
JWT_SECRET=your_jwt_secret_minimum_32_characters_long_here
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_characters_long_here

# Token expiration
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Logging
LOG_LEVEL=info

# File upload
MAX_FILE_SIZE=5242880
```

## Project Structure

```
fastchat/
├── src/
│   ├── config/          # Database, logger, environment validation
│   ├── constants/       # Application constants
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Express middleware
│   │   └── validators/  # Input validation rules
│   ├── models/          # Mongoose schemas
│   ├── repositories/    # Data access layer
│   ├── routes/          # API routes
│   │   └── v1/          # Version 1 routes
│   ├── services/        # Business logic
│   ├── sockets/         # Socket.io implementation
│   │   ├── handlers/    # Socket event handlers
│   │   ├── middlewares/ # Socket middleware
│   │   └── services/    # Socket services
│   ├── utils/           # Helper functions
│   └── app.js           # Express configuration
├── uploads/             # User-uploaded files
├── logs/                # Application logs
├── docs/                # Documentation
└── server.js            # Application entry point
```

## Key Features Explained

### Authentication Flow
- JWT-based authentication with access and refresh tokens
- Access tokens expire in 15 minutes, refresh tokens in 7 days
- Token rotation on refresh for enhanced security
- Secure password hashing with bcrypt

### Real-Time Communication
- Socket.io for bidirectional communication
- Online/offline status tracking
- Message delivery and read receipts
- Typing indicators
- Automatic reconnection handling

### Data Management
- Repository pattern for database operations
- Service layer for business logic
- Comprehensive input validation
- XSS protection and sanitization
- Pagination, filtering, and sorting on all list endpoints

### Logging & Monitoring
- Structured JSON logging with Winston
- Daily log rotation (14-day retention)
- Separate error and combined logs
- Request tracking with unique IDs
- Health check endpoint for monitoring

## Health Check

```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "uptime": 123.456,
  "timestamp": 1705838400000,
  "status": "OK",
  "environment": "development",
  "version": "1.0.0",
  "checks": {
    "database": "connected"
  }
}
```

## Security Features

- Helmet.js for security headers
- CORS configuration
- JWT token-based authentication
- Input sanitization against XSS
- Password strength validation
- MongoDB injection protection
- Rate limiting ready (extensible)

## API Response Format

All API endpoints return responses in a standardized format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "timestamp": "2024-01-21T10:30:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": []
  },
  "timestamp": "2024-01-21T10:30:00.000Z",
  "requestId": "uuid"
}
```

For detailed API documentation, see [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md).

## License

ISC

## Author

Naresh Lohar

## Repository

https://github.com/codephoenix86/fastchat

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.