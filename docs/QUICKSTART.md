# Quick Start Guide

Get fastchat running on your local machine in 5 minutes.

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0 (running locally or accessible remotely)
- npm >= 9.0.0

## Step 1: Clone and Install

```bash
git clone https://github.com/codephoenix86/fastchat.git
cd fastchat
npm install
```

## Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your preferred editor
```

**Minimum required configuration:**

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/fastchat

# Generate secure secrets (min 32 characters each)
JWT_SECRET=your_very_long_secret_at_least_32_characters_here_change_me
JWT_REFRESH_SECRET=another_very_long_secret_at_least_32_characters_change_me
```

**Quick secret generation:**

```bash
# Generate secure secrets using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Create Required Directories

```bash
mkdir -p logs uploads/public/avatars uploads/private
```

## Step 4: Start MongoDB

If you don't have MongoDB running:

```bash
# Using Docker (recommended for quick start)
docker run -d -p 27017:27017 --name mongodb mongo:6

# Or start your local MongoDB service
# macOS: brew services start mongodb-community
# Ubuntu: sudo systemctl start mongod
# Windows: net start MongoDB
```

## Step 5: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:

```
Server listening on port 3000
Environment: development
Application started successfully
```

## Step 6: Test the API

### Health Check

```bash
curl http://localhost:3000/health
```

**Response:**

```json
{
  "uptime": 5.123,
  "timestamp": 1706000000000,
  "status": "OK",
  "environment": "development",
  "version": "1.0.0",
  "checks": {
    "database": "connected"
  }
}
```

### Create a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password@123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Password@123"
  }'
```

Save the `accessToken` from the response for authenticated requests.

### Get Current User

```bash
curl http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Next Steps

### Explore the API

- [REST API Reference](API_REST.md) - Complete endpoint documentation
- [WebSocket API](API_WEBSOCKET.md) - Real-time features

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:unit
npm run test:integration
```

### Connect a Frontend

Example WebSocket connection:

```javascript
import io from 'socket.io-client'

const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_ACCESS_TOKEN',
  },
})

socket.on('connect', () => {
  console.log('Connected to server')
})

socket.on('message:new', (message) => {
  console.log('New message:', message)
})
```

## Common Issues

### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Ensure MongoDB is running on port 27017

```bash
# Check if MongoDB is running
docker ps | grep mongo
# or
mongosh  # Should connect successfully
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:** Change the port in `.env` or kill the process using port 3000

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or change port in .env
PORT=3001
```

### JWT Secret Error

```
Error: JWT_SECRET must be at least 32 characters long
```

**Solution:** Generate a proper secret (see Step 2)

## Development Tips

### Hot Reload

The development server uses nodemon for automatic reloading on file changes.

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Run with Node.js inspector
node --inspect server.js
```

### API Testing Tools

- **Postman**: Import the API collection (see [API_REST.md](API_REST.md))
- **HTTPie**: `http POST :3000/api/v1/auth/signup username=test email=test@example.com password=Password@123`
- **curl**: Examples provided above

### Database GUI

Use MongoDB Compass or Studio 3T to view your database:

```
Connection String: mongodb://localhost:27017/fastchat
```

## Additional Resources

- [Architecture Overview](ARCHITECTURE.md)
- [Testing Guide](TESTING.md)
