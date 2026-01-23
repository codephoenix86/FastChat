# Architecture Documentation

This document provides an overview of the fastchat application architecture, design patterns, and system components.

## Table of Contents

- [System Architecture](#system-architecture)
- [Request Flow](#request-flow)
- [Socket.io Real-time Architecture](#socketio-real-time-architecture)
- [Database Schema](#database-schema)
- [Design Patterns](#design-patterns)

---

## System Architecture

The application follows a layered architecture with clear separation of concerns:

```
┌─────────────┐         ┌────────────────────────────────────┐
│   Client    │◄────────┤       HTTP/WebSocket               │
│  (Browser/  │         │                                    │
│   Mobile)   │         └────────────────────────────────────┘
└─────────────┘                        │
                                       ▼
                       ┌───────────────────────────────┐
                       │    Express Application        │
                       │  ┌─────────────────────────┐  │
                       │  │   Middleware Stack      │  │
                       │  │  • Helmet (Security)    │  │
                       │  │  • CORS                 │  │
                       │  │  • Body Parser          │  │
                       │  │  • Request ID           │  │
                       │  │  • Sanitization (XSS)   │  │
                       │  │  • Authentication       │  │
                       │  └─────────────────────────┘  │
                       │                               │
                       │  ┌─────────────────────────┐  │
                       │  │   Routes (REST API)     │  │
                       │  │  /api/v1/auth           │  │
                       │  │  /api/v1/users          │  │
                       │  │  /api/v1/chats          │  │
                       │  │  /api/v1/.../messages   │  │
                       │  └─────────────────────────┘  │
                       └───────────────────────────────┘
                                       │
                       ┌───────────────┴───────────────┐
                       ▼                               ▼
            ┌──────────────────┐           ┌──────────────────┐
            │ Socket.io Server │           │   Controllers    │
            │                  │           │                  │
            │ • Authentication │           │ • Request        │
            │ • Chat Rooms     │           │   Validation     │
            │ • Online Users   │           │ • Response       │
            │ • Event Handlers │           │   Formatting     │
            └──────────────────┘           └──────────────────┘
                       │                               │
                       └───────────────┬───────────────┘
                                       ▼
                            ┌──────────────────┐
                            │    Services      │
                            │  (Business Logic)│
                            │                  │
                            │ • Auth Service   │
                            │ • User Service   │
                            │ • Chat Service   │
                            │ • Message Service│
                            └──────────────────┘
                                       │
                                       ▼
                            ┌──────────────────┐
                            │   Repositories   │
                            │  (Data Access)   │
                            │                  │
                            │ • User Repo      │
                            │ • Chat Repo      │
                            │ • Message Repo   │
                            │ • Token Repo     │
                            └──────────────────┘
                                       │
                                       ▼
                            ┌──────────────────┐
                            │   MongoDB        │
                            │                  │
                            │ • Users          │
                            │ • Chats          │
                            │ • Messages       │
                            │ • RefreshTokens  │
                            └──────────────────┘
```

### Key Components

#### 1. Express Application Layer
- **Middleware Stack**: Handles security, parsing, validation, and authentication
- **Routes**: RESTful API endpoints organized by resource
- **Error Handling**: Centralized error handling with custom error types

#### 2. Socket.io Server
- **Real-time Communication**: Bidirectional event-based communication
- **Authentication**: JWT-based socket authentication
- **Room Management**: Chat room joining/leaving functionality
- **Online Status Tracking**: Manages user online/offline states

#### 3. Controllers
- Handle HTTP requests and responses
- Extract and validate request data
- Call appropriate service methods
- Format responses using ApiResponse utility

#### 4. Services (Business Logic Layer)
- Implement core business logic
- Enforce business rules and validations
- Orchestrate repository calls
- Handle complex operations

#### 5. Repositories (Data Access Layer)
- Abstract database operations
- Provide clean interfaces for data access
- Handle Mongoose queries and model operations
- Ensure data consistency

#### 6. MongoDB Database
- Document-based storage
- Collections: Users, Chats, Messages, RefreshTokens
- Indexed for performance optimization

---

## Request Flow

Detailed flow of an HTTP request through the application:

```
Client Request
      │
      ▼
┌────────────────────────────────────────────────────┐
│                  Middleware Chain                  │
│                                                    │
│  1. Security (Helmet, CORS)                        │
│  2. Request Parsing (JSON, URL-encoded)            │
│  3. Request ID Generation                          │
│  4. Input Sanitization (XSS Protection)            │
│  5. Request Logging                                │
│  6. Authentication (JWT Verification)              │
│  7. Validation (express-validator)                 │
└────────────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────────────┐
│                    Controller                      │
│  • Extracts request data                           │
│  • Calls appropriate service method                │
│  • Formats response using ApiResponse              │
└────────────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────────────┐
│                     Service                        │
│  • Implements business logic                       │
│  • Validates business rules                        │
│  • Calls repository methods                        │
│  • Handles errors (throws AppError instances)      │
└────────────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────────────┐
│                   Repository                       │
│  • Interacts with MongoDB models                   │
│  • Executes database queries                       │
│  • Returns raw data                                │
└────────────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────────────────────┐
│                  MongoDB Database                  │
└────────────────────────────────────────────────────┘
      │
      ▼
Response sent back through the chain
```

### Request Flow Example: Sending a Message

1. **Client** sends POST request to `/api/v1/chats/:chatId/messages`
2. **Middleware Chain** processes the request:
   - Helmet adds security headers
   - CORS validates origin
   - Body parser parses JSON payload
   - Request ID is generated
   - XSS sanitization cleans input
   - Logger records the request
   - Auth middleware verifies JWT token
   - Validator checks message content
3. **Message Controller** receives validated request:
   - Extracts `content` and `chatId`
   - Calls `messageService.sendMessage()`
4. **Message Service** executes business logic:
   - Verifies chat exists (calls chatRepository)
   - Verifies user is a participant
   - Creates message object
   - Calls `messageRepository.create()`
5. **Message Repository** interacts with database:
   - Creates new Message document in MongoDB
   - Returns saved message
6. **Response** flows back:
   - Service formats the message
   - Controller wraps in ApiResponse
   - Middleware adds final headers
   - Client receives JSON response
7. **Socket.io** broadcasts message:
   - Real-time event emitted to chat room
   - All connected participants receive update

---

## Socket.io Real-time Architecture

WebSocket connection lifecycle and event management:

```
┌────────────────────────────────────────────────────┐
│                  Client Connects                   │
│          (with JWT in auth handshake)              │
└────────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────┐
│        Socket Authentication Middleware           │
│  • Verify JWT token                               │
│  • Attach userId to socket                        │
└───────────────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────┐
│               Connection Handler                   │
│                                                    │
│  1. Register event handlers (chat, message, typing)│
│  2. Add socket to OnlineUsersService               │
│  3. Broadcast user:online if first connection      │
│  4. Push pending messages to user                  │
└────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│Chat Handler  │  │Message       │  │Typing        │
│              │  │Handler       │  │Handler       │
│• chat:join   │  │• message:    │  │• typing:     │
│• chat:leave  │  │  delivered   │  │  start       │
│              │  │• message:    │  │• typing:     │
│              │  │  read        │  │  stop        │
└──────────────┘  └──────────────┘  └──────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────┐
│          Room-based Message Broadcasting          │
│                                                   │
│  socket.to(chatId).emit(event, data)              │
│  • Only users in specific chat room receive events│
└───────────────────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────┐
│                Disconnect Handler                 │
│                                                   │
│  1. Remove socket from OnlineUsersService         │
│  2. Update user's lastSeen in database            │
│  3. Broadcast user:offline if last connection     │
└───────────────────────────────────────────────────┘
```

### Socket Event Flow

#### User Joins a Chat
```
Client                    Server                    Other Clients
  │                         │                         │
  ├──chat:join─────────────►│                         │
  │                         │                         │
  │                         ├─ Add to room            │
  │                         │                         │
  │◄────────────────────────┤                         │
  │  (joined successfully)  │                         │
```

#### Sending a Message
```
Client                    Server                    Other Clients
  │                         │                         │
  ├──HTTP POST message─────►│                         │
  │                         │                         │
  │                         ├─ Save to DB             │
  │                         │                         │
  │◄─HTTP Response──────────┤                         │
  │                         │                         │
  │                         ├──message:new───────────►│
  │                         │  (broadcast to room)    │
```

#### Online Status Updates
```
User A                    Server                    User B
  │                         │                         │
  ├──connect (JWT)─────────►│                         │
  │                         │                         │
  │                         ├─ Add to OnlineUsers     │
  │                         │                         │
  │                         ├──user:online───────────►│
  │                         │  (broadcast to all)     │
```

### OnlineUsersService

In-memory service tracking connected users:

```javascript
{
  "userId1": Set(["socket1", "socket2"]),  // Multiple devices
  "userId2": Set(["socket3"]),             // Single device
  "userId3": Set(["socket4", "socket5"])   // Multiple tabs
}
```

**Features:**
- Tracks multiple concurrent connections per user
- Efficient Set data structure for socket management
- First connection triggers `user:online` broadcast
- Last disconnection triggers `user:offline` broadcast

---

## Database Schema

Entity relationships and data model:

```
┌──────────────────┐
│      User        │
│──────────────────│
│ _id (PK)         │◄────────┐
│ username (unique)│         │
│ email (unique)   │         │
│ password (hashed)│         │
│ role             │         │
│ avatar           │         │
│ bio              │         │
│ lastSeen         │         │
│ createdAt        │         │
│ updatedAt        │         │
└──────────────────┘         │
         │                   │
         │                   │
         │ 1:N               │ N:1
         │                   │
         ▼                   │
┌──────────────────┐         │
│  RefreshToken    │         │
│──────────────────│         │
│ _id (PK)         │         │
│ user (FK)        │─────────┘
│ refreshToken     │
│ createdAt (TTL)  │
└──────────────────┘

┌──────────────────┐         ┌──────────────────┐
│      Chat        │         │     Message      │
│──────────────────│         │──────────────────│
│ _id (PK)         │◄────────│ chat (FK)        │
│ type             │   N:1   │──────────────────│
│ groupName        │         │ _id (PK)         │
│ groupPicture     │         │ content          │
│ participants[]   │───┐     │ sender (FK)      │──┐
│ admin (FK)       │─┐ │     │ status           │  │
│ createdAt        │ │ │     │ type             │  │
│ updatedAt        │ │ │     │ file             │  │
└──────────────────┘ │ │     │ createdAt        │  │
         │           │ │     │ updatedAt        │  │
         │ N:1       │ │     └──────────────────┘  │
         └───────────┼─┼────────────────────────┬──┘
                     │ │                        │
                     │ │ N:M                    │ N:1
                     │ └────────────────────────┼──┐
                     │                          │  │
                     │ 1:1 (admin)              │  │
                     └──────────────────────────┼──┤
                                                │  │
                                                ▼  ▼
                                         ┌──────────────────┐
                                         │      User        │
                                         │──────────────────│
                                         │ _id (PK)         │
                                         └──────────────────┘
```

### Collections

#### Users
```javascript
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  password: String (hashed, select: false),
  role: String (enum: ['user', 'admin']),
  avatar: String (optional),
  bio: String (optional, max 200 chars),
  lastSeen: Date (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

#### Chats
```javascript
{
  _id: ObjectId,
  type: String (enum: ['private', 'group']),
  groupName: String (required for groups),
  groupPicture: String (optional),
  participants: [ObjectId] (indexed, ref: User),
  admin: ObjectId (ref: User, required for groups),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ participants: 1, createdAt: -1 }`
- `{ participants: 1, type: 1 }`
- `{ admin: 1 }`

#### Messages
```javascript
{
  _id: ObjectId,
  content: String (required for text messages),
  status: String (enum: ['sent', 'delivered', 'read']),
  sender: ObjectId (ref: User, indexed),
  chat: ObjectId (ref: Chat, indexed),
  type: String (enum: ['text', 'file']),
  file: {
    url: String,
    filename: String,
    mimetype: String
  } (required for file messages),
  createdAt: Date (indexed),
  updatedAt: Date
}
```

**Indexes:**
- `{ chat: 1, createdAt: -1 }`
- `{ sender: 1, createdAt: -1 }`
- `{ status: 1, chat: 1 }`

#### RefreshTokens
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User, indexed),
  refreshToken: String,
  createdAt: Date (TTL index, auto-expires after 7 days)
}
```

**Indexes:**
- `{ user: 1, refreshToken: 1 }`
- TTL index on `createdAt` (expires after JWT_REFRESH_EXPIRES)

---

## Design Patterns

### 1. Repository Pattern
Abstracts data access logic from business logic.

```
Service Layer          Repository Layer        Database
     │                        │                      │
     ├─findUserById()────────►├─findById()──────────►│
     │                        │                      │
     ├─createChat()──────────►├─create()────────────►│
     │                        │                      │
     ├─updateMessage()───────►├─findByIdAndUpdate()─►│
```

**Benefits:**
- Centralized data access logic
- Easy to test (can mock repositories)
- Consistent query patterns
- Decouples business logic from database implementation

### 2. Service Layer Pattern
Encapsulates business logic and orchestrates operations.

```
Controller ──► Service ──► Repository ──► Database
                  │
                  ├─ Business Rules
                  ├─ Validation
                  ├─ Error Handling
                  └─ Data Transformation
```

**Benefits:**
- Reusable business logic
- Single responsibility
- Easier to unit test
- Clear separation of concerns

### 3. Middleware Chain Pattern
Sequential processing of requests through middleware functions.

```
Request
   │
   ├─► Helmet (Security Headers)
   │
   ├─► CORS (Origin Validation)
   │
   ├─► Body Parser (Parse JSON)
   │
   ├─► Request ID (UUID Generation)
   │
   ├─► Sanitization (XSS Prevention)
   │
   ├─► Logger (Request Logging)
   │
   ├─► Authentication (JWT Verification)
   │
   ├─► Validation (Input Validation)
   │
   └─► Route Handler
```

### 4. Error Handling Pattern
Centralized error handling with custom error types.

```javascript
// Custom error classes
class AppError extends Error {
  constructor(message, status, operational = true)
}

class ValidationError extends AppError { }
class AuthError extends AppError { }
class NotFoundError extends AppError { }

// Global error handler
app.use((err, req, res, next) => {
  // Log error
  // Format response
  // Send to client
})
```

**Error Flow:**
```
Service throws error
       │
       ▼
asyncHandler catches
       │
       ▼
Global error handler
       │
       ▼
Formatted JSON response
```

### 5. Singleton Pattern
Used for shared services and resources.

```javascript
// Socket.io server (singleton)
class SocketServer {
  constructor() {
    this.io = null
  }
  
  init(server) {
    this.io = new Server(server)
    return this.io
  }
  
  get() {
    if (!this.io) throw new Error('Socket not initialized')
    return this.io
  }
}

module.exports = new SocketServer()
```

**Examples in codebase:**
- `socketServer` (Socket.io instance)
- `onlineUsersService` (Online user tracking)
- Repository instances
- Service instances

### 6. Factory Pattern
Used for creating consistent response objects.

```javascript
class ApiResponse {
  constructor(message, data = null, status = 200) {
    this.success = true
    this.message = message
    this.timestamp = new Date().toISOString()
    this.data = data
  }
}
```

---

## Security Architecture

### Authentication Flow
```
1. User Login
   ├─► Credentials sent to /auth/login
   ├─► Server validates credentials (bcrypt)
   ├─► Generate access token (15min expiry)
   ├─► Generate refresh token (7d expiry)
   ├─► Store refresh token in DB
   └─► Return both tokens to client

2. API Request
   ├─► Client sends access token in Authorization header
   ├─► Auth middleware verifies token
   ├─► If valid: attach user to req.user
   └─► If invalid/expired: return 401 error

3. Token Refresh
   ├─► Client sends refresh token to /auth/refresh-token
   ├─► Server verifies token and checks DB
   ├─► Generate new access + refresh tokens
   ├─► Delete old refresh token from DB
   ├─► Store new refresh token in DB
   └─► Return new tokens to client

4. Logout
   ├─► Client sends refresh token to /auth/logout
   ├─► Server deletes refresh token from DB
   └─► Token invalidated
```

### Security Layers
```
┌──────────────────────────────────────┐
│         Client Request               │
└──────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│  Layer 1: Helmet (Security Headers)  │
│  • CSP, HSTS, X-Frame-Options, etc.  │
└──────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│  Layer 2: CORS (Origin Validation)   │
│  • Whitelist allowed origins         │
└──────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│  Layer 3: XSS Sanitization           │
│  • Clean user input                  │
└──────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│  Layer 4: JWT Authentication         │
│  • Verify token signature            │
└──────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│  Layer 5: Input Validation           │
│  • express-validator rules           │
└──────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────┐
│  Layer 6: Business Logic             │
│  • Authorization checks              │
│  • Resource ownership                │
└──────────────────────────────────────┘
```

---

## Performance Considerations

### Database Optimization
- **Indexes**: Strategic indexes on frequently queried fields
- **Query Optimization**: Selective field projection, population
- **Connection Pooling**: Min/max pool size configuration

### Caching Strategy
- **In-Memory Cache**: OnlineUsersService for real-time status
- **Static Assets**: Serve uploaded files with proper caching headers

### Scalability Considerations
- **Stateless API**: JWT-based auth enables horizontal scaling
- **Socket.io Scaling**: Can add Redis adapter for multi-server Socket.io
- **Database Replication**: MongoDB replica sets for read scaling
- **Load Balancing**: Application is load-balancer ready

---

## Logging Strategy

### Log Levels
```
ERROR   ─► Critical errors, exceptions
WARN    ─► Warning conditions
INFO    ─► General information (default)
DEBUG   ─► Detailed debugging information
```

### Log Structure
```javascript
{
  level: 'info',
  message: 'User logged in successfully',
  timestamp: '2024-01-21T10:30:00.000Z',
  service: 'fastchat-api',
  userId: '65a7c9f8e4b0a1234567890a',
  requestId: 'uuid-here'
}
```

### Log Rotation
- Daily rotation with date-based filenames
- Separate error and combined logs
- 14-day retention policy
- 20MB max file size before rotation