# API Documentation

Complete REST API reference for fastchat application.

## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Chats](#chats)
- [Messages](#messages)
- [Socket.io Events](#socketio-events)

---

## Authentication

### POST `/api/v1/auth/signup`
Register a new user.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "Secure@123"
}
```

**Validation Rules:**
- `username`: 3-20 characters, must start with a letter, can contain letters, digits, underscores, and dots
- `email`: Valid email format
- `password`: Minimum 8 characters, must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (@$!%*?&#)

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "userId",
      "username": "alice",
      "email": "alice@example.com",
      "role": "user"
    }
  }
}
```

---

### POST `/api/v1/auth/login`
Authenticate user and receive tokens.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "alice",  // or "email": "alice@example.com"
  "password": "Secure@123"
}
```

**Validation Rules:**
- Either `username` or `email` is required (not both)
- `password`: Required string

**Response (200):**
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "userId",
      "username": "alice",
      "email": "alice@example.com",
      "role": "user"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

---

### POST `/api/v1/auth/logout`
Logout user and invalidate refresh token.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/x-www-form-urlencoded
```

**Request Body:**
```
refresh_token=jwt_refresh_token
```

**Response (200):**
```json
{
  "success": true,
  "message": "User logged out successfully"
}
```

---

### POST `/api/v1/auth/refresh-token`
Refresh access token using refresh token.

**Headers:**
```
Content-Type: application/x-www-form-urlencoded
```

**Request Body:**
```
refresh_token=jwt_refresh_token
```

**Response (200):**
```json
{
  "success": true,
  "message": "Tokens refreshed successfully",
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

---

## Users

All user endpoints (except GET `/api/v1/users` and GET `/api/v1/users/:id`) require authentication.

### GET `/api/v1/users`
Get list of users with pagination and search.

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 20, max: 100
- `search` (optional): Search in username or email
- `role` (optional): Filter by role ("user" or "admin")
- `sort` (optional): Sort fields, e.g., "-createdAt,username" (prefix with "-" for descending)

**Example:**
```
GET /api/v1/users?page=1&limit=20&search=alice&sort=-createdAt
```

**Response (200):**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "id": "userId",
      "username": "alice",
      "email": "alice@example.com",
      "role": "user",
      "avatar": "filename.jpg",
      "bio": "Hello!",
      "lastSeen": "2024-01-21T10:30:00.000Z",
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-21T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### GET `/api/v1/users/:id`
Get user by ID.

**Response (200):**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "user": {
      "id": "userId",
      "username": "alice",
      "email": "alice@example.com",
      "role": "user",
      "avatar": "filename.jpg",
      "bio": "Hello!",
      "lastSeen": "2024-01-21T10:30:00.000Z",
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-21T10:30:00.000Z"
    }
  }
}
```

---

### GET `/api/v1/users/me`
Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
Same as GET `/api/v1/users/:id`

---

### PATCH `/api/v1/users/me`
Update current user's profile.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "newUsername": "newalice",
  "newEmail": "newalice@example.com",
  "newPassword": "NewSecure@123",
  "newBio": "Updated bio",
  "oldPassword": "Secure@123"
}
```

**Validation Rules:**
- `oldPassword`: Required when changing `newEmail` or `newPassword`
- `newUsername`: 3-20 characters, same format as signup
- `newPassword`: Minimum 8 characters with complexity requirements
- `newBio`: Maximum 200 characters
- At least one field (excluding `oldPassword`) must be provided

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "userId",
      "username": "newalice",
      "email": "newalice@example.com",
      ...
    }
  }
}
```

---

### DELETE `/api/v1/users/me`
Delete current user's account.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

---

### POST `/api/v1/users/me/avatar`
Upload user avatar.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
avatar: [image file]
```

**Validation Rules:**
- File types: jpeg, jpg, png, gif only
- Maximum file size: 5MB

**Response (200):**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "user": {
      "id": "userId",
      "avatar": "userId-timestamp.jpg",
      ...
    }
  }
}
```

---

### DELETE `/api/v1/users/me/avatar`
Remove user avatar.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Avatar removed successfully",
  "data": {
    "user": {
      "id": "userId",
      "avatar": null,
      ...
    }
  }
}
```

---

### PATCH `/api/v1/users/me/password`
Change user password.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "oldPassword": "Secure@123",
  "newPassword": "NewSecure@456"
}
```

**Validation Rules:**
- Both fields required
- `newPassword`: Minimum 8 characters with complexity requirements

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Chats

All chat endpoints require authentication.

### GET `/api/v1/chats`
Get user's chats with pagination.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 20, max: 100
- `type` (optional): Filter by type ("private" or "group")
- `sort` (optional): Sort fields, e.g., "-createdAt"

**Example:**
```
GET /api/v1/chats?page=1&limit=20&type=group&sort=-createdAt
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chats fetched successfully",
  "data": [
    {
      "id": "chatId",
      "type": "group",
      "name": "Team Chat",
      "picture": null,
      "admin": "userId",
      "participants": [
        {
          "id": "userId1",
          "username": "alice",
          "avatar": "avatar.jpg"
        }
      ],
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-21T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### POST `/api/v1/chats`
Create a new chat.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "group",
  "groupName": "Team Chat",
  "participants": ["userId1", "userId2"]
}
```

**Validation Rules:**
- `type`: Must be "private" or "group"
- `groupName`: Required for group chats, 1-50 characters
- `participants`: Array of user IDs
  - Private chat: Must result in exactly 2 unique participants (including creator)
  - Group chat: Must result in at least 2 unique participants (including creator)
- All participant IDs must be valid MongoDB ObjectIds and exist in database

**Response (201):**
```json
{
  "success": true,
  "message": "Chat created successfully",
  "data": {
    "chat": {
      "id": "chatId",
      "type": "group",
      "name": "Team Chat",
      "picture": null,
      "admin": "creatorUserId",
      "participants": ["userId1", "userId2", "creatorUserId"],
      "createdAt": "2024-01-21T10:30:00.000Z",
      "updatedAt": "2024-01-21T10:30:00.000Z"
    }
  }
}
```

---

### GET `/api/v1/chats/:chatId`
Get chat details by ID.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chat fetched successfully",
  "data": {
    "chat": {
      "id": "chatId",
      "type": "group",
      "name": "Team Chat",
      "picture": null,
      "admin": {
        "id": "userId",
        "username": "alice",
        "avatar": "avatar.jpg"
      },
      "participants": [
        {
          "id": "userId1",
          "username": "alice",
          "avatar": "avatar.jpg",
          "email": "alice@example.com"
        }
      ],
      "createdAt": "2024-01-20T10:30:00.000Z",
      "updatedAt": "2024-01-21T10:30:00.000Z"
    }
  }
}
```

---

### PATCH `/api/v1/chats/:chatId`
Update chat details (group chats only, admin only).

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "groupName": "New Team Chat",
  "groupPicture": "picture_url",
  "admin": "newAdminUserId"
}
```

**Validation Rules:**
- Only works for group chats
- Only admin can update
- At least one field must be provided
- `groupName`: 1-50 characters if provided
- `admin`: Must be a valid participant ID

**Response (200):**
```json
{
  "success": true,
  "message": "Chat updated successfully",
  "data": {
    "chat": {
      "id": "chatId",
      "name": "New Team Chat",
      ...
    }
  }
}
```

---

### DELETE `/api/v1/chats/:chatId`
Delete chat (group chats only, admin only).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Validation Rules:**
- Only works for group chats
- Only admin can delete

**Response (200):**
```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

---

### GET `/api/v1/chats/:chatId/members`
Get chat members.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Members fetched successfully",
  "data": {
    "members": [
      {
        "id": "userId1",
        "username": "alice",
        "email": "alice@example.com",
        "avatar": "avatar.jpg",
        "bio": "Hello!"
      }
    ]
  }
}
```

---

### POST `/api/v1/chats/:chatId/members`
Add member to group chat.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "userIdToAdd"
}
```

**Validation Rules:**
- Only works for group chats
- Only admin can add members (or user can add themselves)
- User must not already be a member
- Must be a valid user ID

**Response (200):**
```json
{
  "success": true,
  "message": "Member added successfully"
}
```

---

### DELETE `/api/v1/chats/:chatId/members/:userId`
Remove member from group chat.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Validation Rules:**
- Only works for group chats
- Users can remove themselves, or admin can remove others
- Use "me" as userId to remove yourself: `/chats/:chatId/members/me`
- Admin cannot leave without transferring ownership first
- Chat is deleted if last member leaves

**Response (200):**
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

---

## Messages

All message endpoints require authentication.

### POST `/api/v1/chats/:chatId/messages`
Send a message to a chat.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Hello, world!"
}
```

**Validation Rules:**
- `content`: Required, non-empty string, maximum 5000 characters
- User must be a participant of the chat

**Response (201):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "id": "messageId",
      "content": "Hello, world!",
      "sender": "userId",
      "chat": "chatId",
      "status": "sent",
      "type": "text",
      "createdAt": "2024-01-21T10:30:00.000Z",
      "updatedAt": "2024-01-21T10:30:00.000Z"
    }
  }
}
```

---

### GET `/api/v1/chats/:chatId/messages`
Get messages from a chat with pagination.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 50, max: 100
- `sort` (optional): Sort fields, default: "createdAt" (ascending)

**Example:**
```
GET /api/v1/chats/chatId/messages?page=1&limit=50&sort=createdAt
```

**Response (200):**
```json
{
  "success": true,
  "message": "Messages fetched successfully",
  "data": [
    {
      "id": "messageId",
      "content": "Hello!",
      "sender": {
        "id": "userId",
        "username": "alice",
        "avatar": "avatar.jpg"
      },
      "chat": "chatId",
      "status": "read",
      "type": "text",
      "createdAt": "2024-01-21T10:30:00.000Z",
      "updatedAt": "2024-01-21T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 200,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### GET `/api/v1/chats/:chatId/messages/:messageId`
Get a specific message by ID.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message fetched successfully",
  "data": {
    "message": {
      "id": "messageId",
      "content": "Hello!",
      "sender": {
        "id": "userId",
        "username": "alice",
        "avatar": "avatar.jpg"
      },
      "chat": "chatId",
      "status": "read",
      "type": "text",
      "createdAt": "2024-01-21T10:30:00.000Z",
      "updatedAt": "2024-01-21T10:30:00.000Z"
    }
  }
}
```

---

### PATCH `/api/v1/chats/:chatId/messages/:messageId`
Edit a message.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Updated message content"
}
```

**Validation Rules:**
- `content`: Required, non-empty string, maximum 5000 characters
- Only the message sender can edit their own messages

**Response (200):**
```json
{
  "success": true,
  "message": "Message updated successfully",
  "data": {
    "message": {
      "id": "messageId",
      "content": "Updated message content",
      "sender": "userId",
      "chat": "chatId",
      "status": "sent",
      "type": "text",
      "createdAt": "2024-01-21T10:30:00.000Z",
      "updatedAt": "2024-01-21T10:35:00.000Z"
    }
  }
}
```

---

### DELETE `/api/v1/chats/:chatId/messages/:messageId`
Delete a message.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Validation Rules:**
- Only the message sender can delete their own messages

**Response (200):**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

## Socket.io Events

### Connection

Connect to the Socket.io server with authentication:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_access_token'
  }
});
```

### Client → Server Events

#### `chat:join`
Join a chat room to receive real-time messages.

**Data:**
```json
{
  "chatId": "chatId"
}
```

**Example:**
```javascript
socket.emit('chat:join', { chatId: 'chatId123' });
```

---

#### `chat:leave`
Leave a chat room.

**Data:**
```json
{
  "chatId": "chatId"
}
```

**Example:**
```javascript
socket.emit('chat:leave', { chatId: 'chatId123' });
```

---

#### `message:delivered`
Mark a message as delivered.

**Data:**
```json
{
  "messageId": "messageId"
}
```

**Example:**
```javascript
socket.emit('message:delivered', { messageId: 'msg123' });
```

---

#### `message:read`
Mark a message as read.

**Data:**
```json
{
  "messageId": "messageId"
}
```

**Example:**
```javascript
socket.emit('message:read', { messageId: 'msg123' });
```

---

#### `message:start-typing`
Indicate that user started typing in a chat.

**Data:**
```json
{
  "chatId": "chatId"
}
```

**Example:**
```javascript
socket.emit('message:start-typing', { chatId: 'chatId123' });
```

---

#### `message:stop-typing`
Indicate that user stopped typing in a chat.

**Data:**
```json
{
  "chatId": "chatId"
}
```

**Example:**
```javascript
socket.emit('message:stop-typing', { chatId: 'chatId123' });
```

---

### Server → Client Events

#### `message:new`
Received when a new message is sent in a chat.

**Data:**
```json
{
  "id": "messageId",
  "content": "Hello!",
  "sender": "userId",
  "chat": "chatId",
  "status": "sent",
  "type": "text",
  "createdAt": "2024-01-21T10:30:00.000Z",
  "updatedAt": "2024-01-21T10:30:00.000Z"
}
```

**Example:**
```javascript
socket.on('message:new', (message) => {
  console.log('New message:', message);
});
```

---

#### `message:updated`
Received when a message is edited.

**Data:**
```json
{
  "id": "messageId",
  "content": "Updated content",
  "sender": "userId",
  "chat": "chatId",
  "status": "sent",
  "type": "text",
  "createdAt": "2024-01-21T10:30:00.000Z",
  "updatedAt": "2024-01-21T10:35:00.000Z"
}
```

**Example:**
```javascript
socket.on('message:updated', (message) => {
  console.log('Message updated:', message);
});
```

---

#### `message:deleted`
Received when a message is deleted.

**Data:**
```json
{
  "messageId": "messageId"
}
```

**Example:**
```javascript
socket.on('message:deleted', (data) => {
  console.log('Message deleted:', data.messageId);
});
```

---

#### `user:online`
Received when a user comes online.

**Data:**
```json
{
  "userId": "userId"
}
```

**Example:**
```javascript
socket.on('user:online', (data) => {
  console.log('User came online:', data.userId);
});
```

---

#### `user:offline`
Received when a user goes offline.

**Data:**
```json
{
  "userId": "userId"
}
```

**Example:**
```javascript
socket.on('user:offline', (data) => {
  console.log('User went offline:', data.userId);
});
```

---

#### `message:start-typing`
Received when a user starts typing in a chat.

**Data:**
```json
{
  "userId": "userId",
  "chatId": "chatId"
}
```

**Example:**
```javascript
socket.on('message:start-typing', (data) => {
  console.log(`User ${data.userId} is typing in chat ${data.chatId}`);
});
```

---

#### `message:stop-typing`
Received when a user stops typing in a chat.

**Data:**
```json
{
  "userId": "userId",
  "chatId": "chatId"
}
```

**Example:**
```javascript
socket.on('message:stop-typing', (data) => {
  console.log(`User ${data.userId} stopped typing in chat ${data.chatId}`);
});
```

---

### Connection Events

#### `connection`
Fired when successfully connected to the server.

```javascript
socket.on('connect', () => {
  console.log('Connected to server');
});
```

---

#### `disconnect`
Fired when disconnected from the server.

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```